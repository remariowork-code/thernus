/**
 * Per-symbol metric accumulation.
 *
 * One instance per symbol, living in the worker's memory. It consumes raw
 * trades, folds them into 1-minute bars, and produces the full StockMetrics
 * record on demand. Nothing here touches Redis or Postgres — that is the
 * pipeline's job — which is what makes the whole thing unit-testable against
 * a synthetic tape.
 */

import {
  addTradeToVwap, computeRvol, computeVolatilityExpansion, computeVolumeAcceleration,
  computeVwap, createVwapAccumulator, genericRvolProfile, minuteOfSession,
  type MomentumInputs, type RvolProfile, type VwapAccumulator, computeMomentumBreakdown,
  vwapDistance,
} from '../calculations';
import type { MarketPulseConfig } from '../config';
import { isRvolMeaningful, isVwapMeaningful } from '../market/session';
import type { MarketSession, MomentumBreakdown, StockMetrics, StockStage, Trade } from '../types';

interface MinuteBar {
  minute: number;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockEngineSeed {
  previousClose: number;
  /** Prior-session volume used to synthesise a curve when history is absent. */
  averageDailyVolume?: number;
  rvolProfile?: RvolProfile;
  /** Trailing daily closes for the 20-day volatility baseline. */
  dailyCloses?: number[];
  openingPrice?: number;

  /**
   * Session state already elapsed before this process started.
   *
   * A worker that boots at 14:00 has witnessed none of the day's volume. Left
   * at zero, RVOL reads near zero for the rest of the session and the scanner
   * detects nothing at all — so the provider snapshot is used to adopt the
   * session already in progress.
   */
  sessionVolume?: number;
  sessionVwap?: number;
  sessionHigh?: number;
  sessionLow?: number;
  lastPrice?: number;
}

export class StockMetricsEngine {
  private price = 0;
  private previousClose = 0;
  private openingPrice = 0;
  private dayHigh = 0;
  private dayLow = Number.POSITIVE_INFINITY;
  private cumulativeVolume = 0;
  private vwapAcc: VwapAccumulator = createVwapAccumulator();
  private lastNewHighAt: number | null = null;
  private lastTradeAt = 0;
  private lastSeenTimestamp = 0;
  private stage: StockStage = 'IDLE';

  /** Closed 1-minute bars, oldest first. */
  private bars: MinuteBar[] = [];
  private currentBar: MinuteBar | null = null;

  private rvolProfile: RvolProfile = [];
  private dailyCloses: number[] = [];

  /** Trade ids already folded in, so a redelivered print cannot double-count. */
  private recentTradeKeys = new Set<string>();

  constructor(
    public readonly symbol: string,
    private readonly config: MarketPulseConfig,
    seed: StockEngineSeed,
  ) {
    this.previousClose = seed.previousClose;
    this.price = seed.lastPrice ?? seed.previousClose;
    this.openingPrice = seed.openingPrice ?? seed.previousClose;
    this.dailyCloses = seed.dailyCloses ?? [];

    // Adopt a session already in progress.
    if (seed.sessionVolume && seed.sessionVolume > 0) {
      this.cumulativeVolume = seed.sessionVolume;
      const vwap = seed.sessionVwap && seed.sessionVwap > 0 ? seed.sessionVwap : this.price;
      // Reconstruct the running sums so subsequent prints extend the real VWAP
      // rather than starting a fresh one from this moment.
      this.vwapAcc = { notional: vwap * seed.sessionVolume, volume: seed.sessionVolume };
    }
    if (seed.sessionHigh && seed.sessionHigh > 0) this.dayHigh = seed.sessionHigh;
    if (seed.sessionLow && seed.sessionLow > 0) this.dayLow = seed.sessionLow;
    this.rvolProfile =
      seed.rvolProfile ??
      (seed.averageDailyVolume
        ? genericRvolProfile(seed.averageDailyVolume, config.engine.sessionMinutes)
        : []);
  }

  // -------------------------------------------------------------------------
  // Ingest
  // -------------------------------------------------------------------------

  /**
   * Fold one print in.
   *
   * Guards three realities of a live tape: duplicate delivery on reconnect,
   * out-of-order arrival, and prints for a minute that has already closed.
   */
  onTrade(trade: Trade): void {
    if (!(trade.price > 0) || !(trade.size > 0)) return;

    // Duplicate suppression, keyed on the fields that identify a print.
    const key = `${trade.timestamp}:${trade.price}:${trade.size}`;
    if (this.recentTradeKeys.has(key)) return;
    this.recentTradeKeys.add(key);
    if (this.recentTradeKeys.size > 4096) {
      // Bounded memory: drop the oldest half rather than growing without limit.
      this.recentTradeKeys = new Set([...this.recentTradeKeys].slice(-2048));
    }

    // Out-of-order prints still count toward volume and VWAP (both are
    // order-independent sums) but must not rewrite "current" price backwards.
    const isStale = trade.timestamp < this.lastSeenTimestamp;
    this.lastSeenTimestamp = Math.max(this.lastSeenTimestamp, trade.timestamp);

    this.cumulativeVolume += trade.size;
    addTradeToVwap(this.vwapAcc, trade.price, trade.size);

    if (!isStale) {
      this.price = trade.price;
      this.lastTradeAt = trade.timestamp;
      if (this.openingPrice === this.previousClose && this.bars.length === 0) {
        this.openingPrice = trade.price;
      }
    }

    if (trade.price > this.dayHigh) {
      this.dayHigh = trade.price;
      // Only a forward-moving print sets a *new* high for signalling purposes.
      if (!isStale) this.lastNewHighAt = trade.timestamp;
    }
    if (trade.price < this.dayLow) this.dayLow = trade.price;

    this.foldIntoBar(trade);
  }

  private foldIntoBar(trade: Trade): void {
    const minute = minuteOfSession(trade.timestamp, this.config.engine.sessionMinutes);

    if (this.currentBar && this.currentBar.minute === minute) {
      const bar = this.currentBar;
      bar.high = Math.max(bar.high, trade.price);
      bar.low = Math.min(bar.low, trade.price);
      bar.close = trade.price;
      bar.volume += trade.size;
      return;
    }

    // A print for an already-closed minute: credit its volume, leave OHLC alone.
    if (this.currentBar && minute < this.currentBar.minute) {
      const existing = this.bars.find((b) => b.minute === minute);
      if (existing) existing.volume += trade.size;
      return;
    }

    if (this.currentBar) {
      this.bars.push(this.currentBar);
      // Gap-fill skipped minutes with flat zero-volume bars so that windowed
      // lookbacks ("five minutes ago") stay positionally correct.
      for (let m = this.currentBar.minute + 1; m < minute; m++) {
        this.bars.push({
          minute: m,
          timestamp: this.currentBar.timestamp + (m - this.currentBar.minute) * 60_000,
          open: this.currentBar.close,
          high: this.currentBar.close,
          low: this.currentBar.close,
          close: this.currentBar.close,
          volume: 0,
        });
      }
      const cap = this.config.engine.bars1mRetention;
      if (this.bars.length > cap) this.bars = this.bars.slice(-cap);
    }

    this.currentBar = {
      minute,
      timestamp: trade.timestamp,
      open: trade.price,
      high: trade.price,
      low: trade.price,
      close: trade.price,
      volume: trade.size,
    };
  }

  // -------------------------------------------------------------------------
  // Derived series
  // -------------------------------------------------------------------------

  /** Closed bars plus the bar in progress, oldest first. */
  private allBars(): MinuteBar[] {
    return this.currentBar ? [...this.bars, this.currentBar] : this.bars;
  }

  /** Percent change over the last `minutes` completed minutes. */
  private changeOver(minutes: number): number {
    const bars = this.allBars();
    if (bars.length < 2) return 0;
    const index = bars.length - 1 - minutes;
    const reference = index >= 0 ? bars[index].close : bars[0].open;
    if (!(reference > 0)) return 0;
    return ((this.price - reference) / reference) * 100;
  }

  private perMinuteVolumes(): number[] {
    return this.allBars().map((b) => b.volume);
  }

  private recentCloses(): number[] {
    return this.allBars().slice(-6).map((b) => b.close);
  }

  // -------------------------------------------------------------------------
  // Output
  // -------------------------------------------------------------------------

  hasTraded(): boolean {
    return this.cumulativeVolume > 0;
  }

  setStage(stage: StockStage): void {
    this.stage = stage;
  }

  /** Expose the score breakdown so the UI can explain a number. */
  breakdown(session: MarketSession, now = Date.now()): MomentumBreakdown {
    return computeMomentumBreakdown(
      this.momentumInputs(session, now),
      this.config.momentum.weights,
      this.config.momentum.scales,
    );
  }

  private momentumInputs(session: MarketSession, now: number): MomentumInputs {
    const vwap = this.effectiveVwap(session);
    return {
      change1m: this.changeOver(1),
      change5m: this.changeOver(5),
      change15m: this.changeOver(15),
      rvol: this.effectiveRvol(session, now),
      volumeAcceleration: computeVolumeAcceleration(this.perMinuteVolumes()),
      price: this.price,
      vwap,
      dayHigh: this.dayHigh,
      msSinceNewHigh: this.lastNewHighAt === null ? null : now - this.lastNewHighAt,
      volatilityExpansion: computeVolatilityExpansion(
        this.recentCloses(),
        this.dailyCloses,
        this.config.engine.sessionMinutes,
      ),
    };
  }

  /**
   * RVOL outside regular hours is meaningless — the intraday curve's
   * denominator is near zero, so the ratio explodes. The spec's instruction is
   * to fall back to an absolute volume threshold, expressed here as a ratio
   * against that floor so the momentum component still has something sane.
   */
  private effectiveRvol(session: MarketSession, now: number): number {
    if (!isRvolMeaningful(session)) {
      return this.cumulativeVolume / this.config.session.extendedHoursMinVolume;
    }
    return computeRvol(
      this.cumulativeVolume,
      this.rvolProfile,
      minuteOfSession(now, this.config.engine.sessionMinutes),
    );
  }

  /** Before the open there is no session VWAP; price stands in for it. */
  private effectiveVwap(session: MarketSession): number {
    if (!isVwapMeaningful(session)) return this.price;
    return computeVwap(this.vwapAcc, this.price);
  }

  snapshot(session: MarketSession, now = Date.now()): StockMetrics {
    const inputs = this.momentumInputs(session, now);
    const score = computeMomentumBreakdown(
      inputs,
      this.config.momentum.weights,
      this.config.momentum.scales,
    ).total;

    const dayHigh = this.dayHigh || this.price;
    const dayLow = Number.isFinite(this.dayLow) ? this.dayLow : this.price;
    const changePercent = this.previousClose > 0
      ? ((this.price - this.previousClose) / this.previousClose) * 100
      : 0;

    return {
      symbol: this.symbol,
      price: this.price,
      previousClose: this.previousClose,
      changePercent,
      change1m: inputs.change1m,
      change5m: inputs.change5m,
      change15m: inputs.change15m,
      volume: this.cumulativeVolume,
      rvol: inputs.rvol,
      volumeAcceleration: inputs.volumeAcceleration,
      vwap: inputs.vwap,
      vwapDistance: vwapDistance(this.price, inputs.vwap) * 100,
      aboveVwap: this.price > inputs.vwap,
      dayHigh,
      dayLow,
      distanceFromHigh: dayHigh > 0 ? ((dayHigh - this.price) / dayHigh) * 100 : 0,
      isNewHigh:
        this.lastNewHighAt !== null &&
        now - this.lastNewHighAt <= this.config.stock.newHighWindowMs,
      volatility: inputs.volatilityExpansion,
      momentumScore: score,
      stage: this.stage,
      updatedAt: this.lastTradeAt || now,
    };
  }

  /** Wipe intraday state at the session boundary; keep the baselines. */
  resetForNewSession(previousClose: number): void {
    this.previousClose = previousClose;
    this.price = previousClose;
    this.openingPrice = previousClose;
    this.dayHigh = 0;
    this.dayLow = Number.POSITIVE_INFINITY;
    this.cumulativeVolume = 0;
    this.vwapAcc = createVwapAccumulator();
    this.lastNewHighAt = null;
    this.bars = [];
    this.currentBar = null;
    this.recentTradeKeys.clear();
    this.stage = 'IDLE';
  }

  setRvolProfile(profile: RvolProfile): void {
    this.rvolProfile = profile;
  }

  setDailyCloses(closes: number[]): void {
    this.dailyCloses = closes;
  }

  /** Closed bars, for persisting to Redis. */
  closedBars(): Array<MinuteBar & { vwap: number }> {
    const vwap = computeVwap(this.vwapAcc, this.price);
    return this.bars.map((b) => ({ ...b, vwap }));
  }
}
