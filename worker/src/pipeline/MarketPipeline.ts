/**
 * The market pipeline.
 *
 * Provider -> stock engines -> sector engines -> signal engine -> Redis -> SSE.
 *
 * Trades arrive continuously and are folded into per-symbol engines with no I/O
 * on the hot path. A timer then recomputes, writes state to Redis, persists any
 * signals, and publishes one batched event. That split is deliberate: it keeps
 * tick handling allocation-light, and it means the publish rate is a knob
 * (`engine.tickIntervalMs`) rather than a function of market activity.
 */

import type { MarketPulseConfig } from '../../../shared/config';
import { SectorEngine } from '../../../shared/engine/SectorEngine';
import { SignalEngine } from '../../../shared/engine/SignalEngine';
import { SignalDeduplicator } from '../../../shared/engine/SignalStateMachine';
import { NewsCatalystEngine, type RawHeadline } from '../../../shared/engine/NewsCatalystEngine';
import { StockMetricsEngine } from '../../../shared/engine/StockMetricsEngine';
import { buildRvolProfile } from '../../../shared/calculations/rvol';
import { getEffectiveSession } from '../../../shared/market/session';
import type { MarketStore } from '../../../shared/redis/store';
import type {
  IMarketDataProvider, MarketSession, NewsHeadline, SectorMetrics, Signal,
  StockMetrics, Trade, Universe,
} from '../../../shared/types';
import { Logger } from '../utils/logger';

export interface SignalSink {
  persist(signals: Signal[]): Promise<void>;
  persistNews(item: NewsHeadline): Promise<void>;
}

export interface MarketPipelineOptions {
  provider: IMarketDataProvider;
  store: MarketStore;
  universe: Universe;
  config: MarketPulseConfig;
  sink?: SignalSink;
  /** Overridable for tests. */
  now?: () => number;
  /**
   * Overridable session resolver. Defaults to real wall-clock New York time;
   * injectable so tests are deterministic and so a replay harness can drive
   * historical data through the same code path.
   */
  session?: (at: Date) => MarketSession;
}

export class MarketPipeline {
  private readonly stocks = new Map<string, StockMetricsEngine>();
  private readonly sectors = new Map<string, SectorEngine>();
  private readonly sectorsBySymbol = new Map<string, string[]>();
  private readonly signalEngine: SignalEngine;
  private readonly newsEngine: NewsCatalystEngine;
  private readonly dedup: SignalDeduplicator;

  private readonly provider: IMarketDataProvider;
  private readonly store: MarketStore;
  private readonly config: MarketPulseConfig;
  private readonly universe: Universe;
  private readonly sink: SignalSink | null;
  private readonly now: () => number;
  private readonly resolveSession: (at: Date) => MarketSession;

  private timer: NodeJS.Timeout | null = null;
  private lastTickAt = 0;
  private lastSession: MarketSession | null = null;
  private tickInFlight = false;

  constructor(options: MarketPipelineOptions) {
    this.provider = options.provider;
    this.store = options.store;
    this.config = options.config;
    this.universe = options.universe;
    this.sink = options.sink ?? null;
    this.now = options.now ?? (() => Date.now());
    this.resolveSession = options.session ?? getEffectiveSession;

    this.dedup = new SignalDeduplicator(this.config);
    this.signalEngine = new SignalEngine({ config: this.config, deduplicator: this.dedup });
    this.newsEngine = new NewsCatalystEngine(this.universe.sectors);

    for (const sector of this.universe.sectors) {
      this.sectors.set(
        sector.id,
        new SectorEngine(sector.id, sector.name, sector.constituents, this.config),
      );
      for (const { symbol } of sector.constituents) {
        this.sectorsBySymbol.set(symbol, [...(this.sectorsBySymbol.get(symbol) ?? []), sector.id]);
      }
    }
  }

  get symbols(): string[] {
    return this.universe.stocks.filter((s) => s.active).map((s) => s.symbol);
  }

  /** Seconds since the last print — the worker's stall detector reads this. */
  msSinceLastTick(): number {
    return this.lastTickAt === 0 ? 0 : this.now() - this.lastTickAt;
  }

  // -------------------------------------------------------------------------
  // Warm-up
  // -------------------------------------------------------------------------

  /**
   * Build per-symbol baselines before subscribing: previous close, the
   * time-of-day RVOL curve, and the daily closes behind the volatility term.
   *
   * Done with bounded concurrency — 250 symbols x 2 REST calls will trip any
   * vendor's rate limiter if fired at once.
   */
  async warmUp(concurrency = 5): Promise<void> {
    const symbols = this.symbols;
    Logger.info('Warming up baselines', { symbols: symbols.length, concurrency });

    let index = 0;
    let failures = 0;

    const worker = async (): Promise<void> => {
      while (index < symbols.length) {
        const symbol = symbols[index++];
        try {
          await this.warmUpSymbol(symbol);
        } catch (error) {
          failures++;
          // A symbol without history is degraded, not fatal — it simply has no
          // RVOL baseline until tomorrow's warm-up.
          Logger.warn('Warm-up failed for symbol', { symbol, error: String(error) });
          this.stocks.set(symbol, new StockMetricsEngine(symbol, this.config, { previousClose: 0 }));
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(concurrency, symbols.length) }, worker));
    Logger.info('Warm-up complete', { ready: this.stocks.size, failures });
  }

  private async warmUpSymbol(symbol: string): Promise<void> {
    const [snapshot, minuteBars, dailyBars] = await Promise.all([
      this.provider.getSnapshot(symbol),
      this.provider.getHistoricalBars(symbol, '1m', 390 * this.config.engine.rvolBaselineDays),
      this.provider.getHistoricalBars(symbol, '1d', this.config.engine.rvolBaselineDays + 1),
    ]);

    const profile = buildRvolProfile(minuteBars, this.config.engine.sessionMinutes);
    const dailyCloses = dailyBars.map((b) => b.close);

    // The average daily volume behind the fallback curve comes from history,
    // not from `snapshot.volume` — that is *today's* partial volume, and using
    // it would make the baseline shrink as the session progresses.
    const averageDailyVolume = dailyBars.length
      ? dailyBars.reduce((sum, b) => sum + b.volume, 0) / dailyBars.length
      : undefined;

    const engine = new StockMetricsEngine(symbol, this.config, {
      previousClose: snapshot.previousClose || snapshot.lastPrice,
      rvolProfile: profile.some((v) => v > 0) ? profile : undefined,
      averageDailyVolume,
      dailyCloses,
      // Adopt the session already in progress, so a worker restarted at midday
      // reports correct RVOL and VWAP immediately rather than after the close.
      lastPrice: snapshot.lastPrice,
      sessionVolume: snapshot.volume,
      sessionVwap: snapshot.vwap,
      sessionHigh: snapshot.dayHigh,
      sessionLow: snapshot.dayLow,
    });
    this.stocks.set(symbol, engine);
    await this.store.writeRvolProfile(symbol, profile);
  }

  // -------------------------------------------------------------------------
  // Ingest
  // -------------------------------------------------------------------------

  async start(): Promise<void> {
    const symbols = this.symbols;

    await this.provider.subscribeTrades(symbols, (trade) => this.onTrade(trade));
    await this.provider.subscribeQuotes(symbols, (quote) => {
      // Quotes are stored for display only; nothing is computed from them.
      void this.store.writeQuote(quote.symbol, {
        bidPrice: quote.bidPrice, bidSize: quote.bidSize,
        askPrice: quote.askPrice, askSize: quote.askSize,
        timestamp: quote.timestamp,
      });
    });

    // Publish provenance before the first tick, so the UI can never show live
    // numbers without saying where they came from.
    await this.store.writeProviderInfo({
      providerName: this.provider.providerName,
      simulated: this.provider.providerName === 'SIMULATED',
      startedAt: this.now(),
    });

    this.timer = setInterval(() => { void this.tick(); }, this.config.engine.tickIntervalMs);
    Logger.info('Pipeline started', {
      symbols: symbols.length,
      sectors: this.sectors.size,
      tickMs: this.config.engine.tickIntervalMs,
    });
  }

  async stop(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    await this.provider.disconnect();
  }

  onTrade(trade: Trade): void {
    const engine = this.stocks.get(trade.symbol);
    if (!engine) return;
    engine.onTrade(trade);
    this.lastTickAt = this.now();
  }

  ingestHeadline(raw: RawHeadline): NewsHeadline | null {
    const item = this.newsEngine.ingest(raw, this.now());
    if (!item) return null;
    void this.store.appendNews(item);
    void this.sink?.persistNews(item);
    void this.store.publish({ type: 'NEWS', data: item });
    return item;
  }

  // -------------------------------------------------------------------------
  // Compute cycle
  // -------------------------------------------------------------------------

  /**
   * One full recompute. Guarded against overlap: if Redis is slow, ticks must
   * queue rather than interleave and write stale state over fresh.
   */
  async tick(): Promise<void> {
    if (this.tickInFlight) return;
    this.tickInFlight = true;
    try {
      await this.runTick();
    } catch (error) {
      // A failed cycle must not kill the timer — the next one may well succeed.
      Logger.error('Tick failed', error);
    } finally {
      this.tickInFlight = false;
    }
  }

  private async runTick(): Promise<void> {
    const now = this.now();
    const session = this.resolveSession(new Date(now));

    if (session !== this.lastSession) {
      await this.onSessionChange(session, now);
      this.lastSession = session;
    }

    // 1. Stock metrics.
    const metrics: StockMetrics[] = [];
    for (const engine of this.stocks.values()) {
      if (!engine.hasTraded()) continue;
      metrics.push(engine.snapshot(session, now));
    }
    if (metrics.length === 0) return;

    // 2. Fan out to sectors.
    for (const m of metrics) {
      for (const sectorId of this.sectorsBySymbol.get(m.symbol) ?? []) {
        this.sectors.get(sectorId)?.updateStock(m.symbol, m);
      }
    }

    // 3. Sector aggregation, with the 5-minute lookback for acceleration.
    const lookbackMs = 5 * 60_000;
    const sectorMetrics: SectorMetrics[] = [];
    for (const [sectorId, engine] of this.sectors) {
      const previousScore = await this.store.readHistoricalScore(sectorId, lookbackMs, now);
      sectorMetrics.push(engine.compute(session, previousScore, now));
    }

    // 4. Signals. Sector signals first — they are the headline act.
    this.signalEngine.setRecentCatalysts(
      this.newsEngine.recentCatalysts(this.config.sector.catalystWindowMinutes, now),
    );

    const signals: Signal[] = [];
    for (const sector of sectorMetrics) {
      const signal = this.signalEngine.evaluateSector(sector, session, now);
      if (signal) signals.push(signal);
    }

    // Stock-level detectors only run for symbols in a sector that is awake —
    // otherwise 249 symbols produce a wall of noise the product exists to avoid.
    const liveSectors = new Set(
      sectorMetrics.filter((s) => s.stage !== 'IDLE').map((s) => s.sectorId),
    );
    for (const m of metrics) {
      const sectorIds = this.sectorsBySymbol.get(m.symbol) ?? [];
      const activeSector = sectorIds.find((id) => liveSectors.has(id));
      if (!activeSector) continue;
      const sector = sectorMetrics.find((s) => s.sectorId === activeSector);
      signals.push(...this.signalEngine.evaluateStock(m, activeSector, sector?.sectorName ?? null, session, now));
    }

    // 5. Persist and broadcast.
    await this.persistState(metrics, sectorMetrics, signals);
  }

  private async persistState(
    metrics: StockMetrics[],
    sectorMetrics: SectorMetrics[],
    signals: Signal[],
  ): Promise<void> {
    await Promise.all([
      ...metrics.map((m) => this.store.writeMetrics(m)),
      ...sectorMetrics.map((s) => this.store.writeSector(s)),
    ]);

    if (signals.length > 0) {
      for (const signal of signals) await this.store.appendSignal(signal);
      // Postgres write is fire-and-forget: a database hiccup must not delay the
      // live feed, and Redis already holds the signal.
      void this.sink?.persist(signals).catch((error) => {
        Logger.error('Signal persistence failed', error, { count: signals.length });
      });
    }

    await this.store.publish({ type: 'METRICS', data: metrics });
    await this.store.publish({ type: 'SECTORS', data: sectorMetrics });
    for (const signal of signals) {
      await this.store.publish({ type: 'SIGNAL', data: signal });
    }
  }

  /**
   * Session transitions. Crossing into a new regular session clears intraday
   * state — otherwise yesterday's high would suppress today's new-high signals
   * for the whole morning.
   */
  private async onSessionChange(session: MarketSession, now: number): Promise<void> {
    Logger.info('Market session changed', { session });
    await this.store.writeSession(session);
    await this.store.publish({
      type: 'SESSION',
      data: { session, asOf: new Date(now).toISOString() },
    });

    if (this.lastSession !== null && session === 'PREMARKET') {
      for (const [symbol, engine] of this.stocks) {
        try {
          const snapshot = await this.provider.getSnapshot(symbol);
          engine.resetForNewSession(snapshot.previousClose || snapshot.lastPrice);
        } catch {
          // Keep the stale baseline rather than zeroing it out.
        }
      }
      this.dedup.reset();
      for (const sector of this.sectors.values()) sector.setStage('IDLE');
      Logger.info('Intraday state reset for the new session');
    }
  }

  // -------------------------------------------------------------------------
  // Introspection, used by the health endpoint
  // -------------------------------------------------------------------------

  stats(): { symbols: number; sectors: number; tracked: number; lastTickAgoMs: number } {
    return {
      symbols: this.symbols.length,
      sectors: this.sectors.size,
      tracked: [...this.stocks.values()].filter((e) => e.hasTraded()).length,
      lastTickAgoMs: this.msSinceLastTick(),
    };
  }
}
