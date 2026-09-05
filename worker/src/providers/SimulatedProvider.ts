/**
 * A synthetic market, implementing the same interface as Polygon.
 *
 * Two reasons this exists rather than being a testing afterthought:
 *
 *  1. Deliverable 11 requires simulated fixtures that drive the state machine
 *     through AWAKENING -> BREAKOUT with no live data.
 *  2. It lets the whole system — worker, Redis, SSE, UI — run end to end with
 *     no vendor account, which is how anyone will first see it work.
 *
 * `scenarios` scripts a deterministic sector rally; everything not scripted
 * follows a seeded random walk, so runs are reproducible.
 */

import { nyOffsetMinutes, nyWallClock } from '../../../shared/market/nyClock';
import type {
  Bar, IMarketDataProvider, MarketDataHandler, Quote, Snapshot, Timeframe, Trade,
} from '../../../shared/types';

const SESSION_MINUTES = 390;
/** Upper bound on the volume a single step may represent. */
const MAX_STEP_SECONDS = 60;
const REGULAR_OPEN_MINUTE = 9 * 60 + 30;

export interface ScenarioLeg {
  /** Seconds from simulation start at which this target should be reached. */
  atSeconds: number;
  /** Percent change from the previous close to converge on. */
  changePercent: number;
  /** Multiple of the symbol's baseline volume rate to trade at. */
  volumeMultiple: number;
}

export interface Scenario {
  symbol: string;
  legs: ScenarioLeg[];
}

export interface SimulatedProviderOptions {
  symbols: string[];
  /** Prints per symbol per second. */
  tickRateHz?: number;
  scenarios?: Scenario[];
  /** Fixed seed keeps a run reproducible. */
  seed?: number;
  /** Baseline reference prices; anything absent gets a deterministic default. */
  referencePrices?: Record<string, number>;
  /** Drive the clock manually instead of with a timer — used by tests. */
  manualClock?: boolean;
}

/** Mulberry32 — small, fast, and deterministic from a seed. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SymbolState {
  symbol: string;
  previousClose: number;
  price: number;
  /** Shares per second at baseline. */
  volumeRate: number;
  scenario: Scenario | null;
}

export class SimulatedProvider implements IMarketDataProvider {
  readonly providerName = 'SIMULATED';

  private readonly states = new Map<string, SymbolState>();
  private readonly random: () => number;
  private readonly tickRateHz: number;
  private readonly manualClock: boolean;

  private tradeHandler: MarketDataHandler<Trade> | null = null;
  private quoteHandler: MarketDataHandler<Quote> | null = null;
  private disconnectHandler: ((reason: string) => void) | null = null;
  private timer: NodeJS.Timeout | null = null;
  private startedAt = 0;
  private lastStepAt = 0;
  private subscribed = new Set<string>();

  constructor(private readonly options: SimulatedProviderOptions) {
    this.random = mulberry32(options.seed ?? 1337);
    this.tickRateHz = options.tickRateHz ?? 2;
    this.manualClock = options.manualClock ?? false;

    const scenarioBySymbol = new Map(
      (options.scenarios ?? []).map((s) => [s.symbol, s] as const),
    );

    for (const symbol of options.symbols) {
      const previousClose =
        options.referencePrices?.[symbol] ?? this.deterministicPrice(symbol);
      this.states.set(symbol, {
        symbol,
        previousClose,
        price: previousClose,
        volumeRate: this.deterministicVolumeRate(symbol),
        scenario: scenarioBySymbol.get(symbol) ?? null,
      });
    }
  }

  /** Stable pseudo-price from the ticker, so restarts look the same. */
  private deterministicPrice(symbol: string): number {
    let hash = 0;
    for (const char of symbol) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    return 20 + (hash % 48_000) / 100; // $20 - $500
  }

  private deterministicVolumeRate(symbol: string): number {
    let hash = 7;
    for (const char of symbol) hash = (hash * 17 + char.charCodeAt(0)) >>> 0;
    return 300 + (hash % 4_700); // 300 - 5,000 shares/sec
  }

  onDisconnect(handler: (reason: string) => void): void {
    this.disconnectHandler = handler;
  }

  async connect(): Promise<void> {
    // Left unanchored: the first step establishes the origin, so a caller
    // driving a simulated clock is not measured against real wall time.
    this.startedAt = 0;
    this.lastStepAt = 0;
    if (!this.manualClock) {
      this.timer = setInterval(() => this.step(Date.now()), 1000 / this.tickRateHz);
      // Never hold the process open on the simulator alone.
      this.timer.unref?.();
    }
  }

  async disconnect(): Promise<void> {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  async subscribeTrades(symbols: string[], handler: MarketDataHandler<Trade>): Promise<void> {
    this.tradeHandler = handler;
    for (const s of symbols) this.subscribed.add(s);
  }

  async subscribeQuotes(symbols: string[], handler: MarketDataHandler<Quote>): Promise<void> {
    this.quoteHandler = handler;
    for (const s of symbols) this.subscribed.add(s);
  }

  async unsubscribe(symbols: string[]): Promise<void> {
    for (const s of symbols) this.subscribed.delete(s);
  }

  /** Simulate a provider-side drop, so reconnection logic can be exercised. */
  simulateDisconnect(reason = 'Simulated provider drop'): void {
    void this.disconnect();
    this.disconnectHandler?.(reason);
  }

  /**
   * Advance the simulation to `now` and emit one round of prints.
   *
   * Volume is scaled by the time actually elapsed since the previous step, so
   * a caller driving the clock in 10-second jumps gets the same cumulative
   * volume as one stepping every second. Without that, a manually clocked run
   * silently under-trades and every RVOL reads far below 1.
   */
  step(now: number): void {
    const nominalStep = 1 / this.tickRateHz;
    if (this.lastStepAt === 0) {
      this.startedAt = now;
      this.lastStepAt = now - nominalStep * 1000;
    }

    const sinceStartSec = (now - this.startedAt) / 1000;
    // Clamped: a paused process or a clock jump must not bill hours of volume
    // into a single print.
    const elapsedSec = Math.min(
      Math.max((now - this.lastStepAt) / 1000, nominalStep),
      MAX_STEP_SECONDS,
    );
    this.lastStepAt = now;
    for (const symbol of this.subscribed) {
      const state = this.states.get(symbol);
      if (!state) continue;
      this.emitFor(state, sinceStartSec, elapsedSec, now);
    }
  }

  private emitFor(state: SymbolState, elapsedSec: number, stepSeconds: number, now: number): void {
    const { targetChange, volumeMultiple } = this.targetFor(state, elapsedSec);

    const targetPrice = state.previousClose * (1 + targetChange / 100);
    // Converge on the target with noise, so the tape looks like a tape.
    const drift = (targetPrice - state.price) * 0.25;
    const noise = (this.random() - 0.5) * state.previousClose * 0.0008;
    state.price = Math.max(0.01, state.price + drift + noise);

    const shares = Math.max(
      1,
      Math.round(state.volumeRate * stepSeconds * volumeMultiple * (0.6 + this.random() * 0.8)),
    );

    void this.tradeHandler?.({
      symbol: state.symbol,
      price: Number(state.price.toFixed(4)),
      size: shares,
      timestamp: now,
    });

    const spread = Math.max(0.01, state.price * 0.0002);
    void this.quoteHandler?.({
      symbol: state.symbol,
      bidPrice: Number((state.price - spread).toFixed(4)),
      bidSize: 100 + Math.floor(this.random() * 900),
      askPrice: Number((state.price + spread).toFixed(4)),
      askSize: 100 + Math.floor(this.random() * 900),
      timestamp: now,
    });
  }

  /** Interpolate between scripted legs; drift randomly when unscripted. */
  private targetFor(state: SymbolState, elapsedSec: number): { targetChange: number; volumeMultiple: number } {
    if (!state.scenario || state.scenario.legs.length === 0) {
      // Unscripted names wander gently, which is what gives the dashboard a
      // realistic backdrop of sectors that are doing nothing in particular.
      const wander = Math.sin(elapsedSec / 90 + state.symbol.length) * 0.6
        + (this.random() - 0.5) * 0.15;
      return { targetChange: wander, volumeMultiple: 0.9 + this.random() * 0.3 };
    }

    const legs = state.scenario.legs;
    if (elapsedSec <= legs[0].atSeconds) {
      const ratio = legs[0].atSeconds > 0 ? elapsedSec / legs[0].atSeconds : 1;
      return {
        targetChange: legs[0].changePercent * ratio,
        volumeMultiple: 1 + (legs[0].volumeMultiple - 1) * ratio,
      };
    }

    for (let i = 0; i < legs.length - 1; i++) {
      const from = legs[i];
      const to = legs[i + 1];
      if (elapsedSec > from.atSeconds && elapsedSec <= to.atSeconds) {
        const span = to.atSeconds - from.atSeconds;
        const ratio = span > 0 ? (elapsedSec - from.atSeconds) / span : 1;
        return {
          targetChange: from.changePercent + (to.changePercent - from.changePercent) * ratio,
          volumeMultiple: from.volumeMultiple + (to.volumeMultiple - from.volumeMultiple) * ratio,
        };
      }
    }

    const last = legs[legs.length - 1];
    return { targetChange: last.changePercent, volumeMultiple: last.volumeMultiple };
  }

  // -------------------------------------------------------------------------
  // REST equivalents
  // -------------------------------------------------------------------------

  async getSnapshot(symbol: string): Promise<Snapshot> {
    const state = this.states.get(symbol);
    const price = state?.price ?? this.deterministicPrice(symbol);
    const previousClose = state?.previousClose ?? price;
    const rate = state?.volumeRate ?? 1000;

    // Volume "already traded today", consistent with the elapsed session, so a
    // mid-session start behaves the way it would against a real vendor.
    const elapsedMinutes = Math.max(
      Math.min(nyWallClock(Date.now()).minutesOfDay - REGULAR_OPEN_MINUTE, SESSION_MINUTES),
      0,
    );

    return {
      symbol,
      bidPrice: price - 0.01, bidSize: 200,
      askPrice: price + 0.01, askSize: 200,
      volume: Math.round(rate * elapsedMinutes * 60),
      vwap: price,
      lastPrice: price,
      previousClose,
      dayHigh: price,
      dayLow: price,
      dayOpen: previousClose,
      timestamp: Date.now(),
    };
  }

  /**
   * Synthetic history.
   *
   * Intraday bars are emitted only for regular-session minutes on weekdays,
   * because that is what a real vendor returns for a session request — and
   * because a 24/7 tape would poison the RVOL baseline built from it.
   */
  async getHistoricalBars(symbol: string, timeframe: Timeframe, limit: number): Promise<Bar[]> {
    const state = this.states.get(symbol);
    const base = state?.previousClose ?? this.deterministicPrice(symbol);
    const rate = state?.volumeRate ?? 1000;
    let price = base;

    if (timeframe === '1d') {
      const bars: Bar[] = [];
      const cursor = new Date();
      for (let i = 0; i < limit; i++) {
        cursor.setUTCDate(cursor.getUTCDate() - 1);
        while (cursor.getUTCDay() === 0 || cursor.getUTCDay() === 6) {
          cursor.setUTCDate(cursor.getUTCDate() - 1);
        }
        const open = price;
        price = Math.max(0.01, price * (1 + (this.random() - 0.5) * 0.02));
        bars.push({
          symbol, open,
          high: Math.max(open, price) * 1.004,
          low: Math.min(open, price) * 0.996,
          close: price,
          volume: Math.round(rate * 23_400 * (0.8 + this.random() * 0.4)),
          vwap: (open + price) / 2,
          timestamp: cursor.getTime(),
        });
      }
      return bars.reverse();
    }

    const stepMinutes = timeframe === '15m' ? 15 : timeframe === '5m' ? 5 : 1;
    const barsPerSession = Math.floor(SESSION_MINUTES / stepMinutes);
    const sessionsNeeded = Math.ceil(limit / barsPerSession);

    // Walk back over weekdays, filling each session from the open.
    const sessions: number[] = [];
    const day = new Date();
    while (sessions.length < sessionsNeeded) {
      day.setUTCDate(day.getUTCDate() - 1);
      if (day.getUTCDay() === 0 || day.getUTCDay() === 6) continue;
      sessions.push(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()));
    }
    sessions.reverse();

    const bars: Bar[] = [];
    for (const sessionDay of sessions) {
      // 09:30 New York for that date.
      const noonUtc = sessionDay + 12 * 3_600_000;
      const openAt = sessionDay + (REGULAR_OPEN_MINUTE - nyOffsetMinutes(noonUtc)) * 60_000;

      for (let b = 0; b < barsPerSession; b++) {
        const timestamp = openAt + b * stepMinutes * 60_000;
        const open = price;
        price = Math.max(0.01, price * (1 + (this.random() - 0.5) * 0.004));
        const high = Math.max(open, price) * 1.0005;
        const low = Math.min(open, price) * 0.9995;

        // U-shaped intraday volume: heavy open and close, quiet midday.
        const position = (b * stepMinutes) / SESSION_MINUTES;
        const shape = 1 + 1.8 * Math.exp(-position * 6) + 1.2 * Math.exp(-(1 - position) * 6);

        bars.push({
          symbol, open, high, low, close: price,
          volume: Math.round(rate * stepMinutes * 60 * shape * (0.8 + this.random() * 0.4)),
          vwap: (high + low + price) / 3,
          timestamp,
        });
      }
    }
    return bars.slice(-limit);
  }
}
