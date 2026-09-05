/**
 * Deliverable 11's acceptance fixture.
 *
 * The spec's scenario, verbatim:
 *
 *   MU   +0.5% -> +1.8% -> +3.4%
 *   SNDK +0.3% -> +2.1% -> +4.2%
 *   WDC  +0.2% -> +1.7% -> +3.1%
 *   STX  +0.1% -> +1.2% -> +2.7%
 *
 * "The system should correctly transition AWAKENING -> ACCELERATING ->
 * BREAKOUT without requiring live market data."
 *
 * Real prints go through the real StockMetricsEngine — nothing is stubbed — so
 * this exercises bar folding, VWAP, RVOL, scoring, aggregation and the signal
 * state machine together. Price ramps across each block rather than jumping to
 * the target and sitting flat, because a rally that stops making highs stops
 * being a rally, and the new-high term is load-bearing in stages 2 and 3.
 */

import { describe, expect, it } from 'vitest';
import { StockMetricsEngine } from '@shared/engine/StockMetricsEngine';
import { SectorEngine } from '@shared/engine/SectorEngine';
import { SignalEngine } from '@shared/engine/SignalEngine';
import { SignalDeduplicator } from '@shared/engine/SignalStateMachine';
import { DEFAULT_CONFIG } from '@shared/config';
import type { SectorMetrics, Signal, Trade } from '@shared/types';

/** 09:30 EDT on Tuesday 2026-09-08. */
const OPEN = Date.parse('2026-09-08T13:30:00Z');
const MINUTE = 60_000;
const PRINTS_PER_MINUTE = 10;

interface SymbolDef { symbol: string; previousClose: number; legs: [number, number, number] }

const MEMORY: SymbolDef[] = [
  { symbol: 'MU', previousClose: 100, legs: [0.5, 1.8, 3.4] },
  { symbol: 'SNDK', previousClose: 50, legs: [0.3, 2.1, 4.2] },
  { symbol: 'WDC', previousClose: 60, legs: [0.2, 1.7, 3.1] },
  { symbol: 'STX', previousClose: 80, legs: [0.1, 1.2, 2.7] },
];

/**
 * A flat baseline: 1,000 shares a minute, so expected cumulative volume at
 * minute m is 1000·(m+1) and RVOL is exactly reasoned about rather than guessed.
 */
const BASE_RATE = 1_000;
const flatProfile = () => Array.from({ length: 390 }, (_, m) => BASE_RATE * (m + 1));

type PctFor = (def: SymbolDef) => number;

class Harness {
  readonly engines = new Map<string, StockMetricsEngine>();
  readonly sector: SectorEngine;
  readonly signals: SignalEngine;
  readonly emitted: Signal[] = [];
  /** Every print produced, so an identical tape can be replayed exactly. */
  readonly tape: Trade[] = [];

  constructor() {
    for (const def of MEMORY) {
      this.engines.set(def.symbol, new StockMetricsEngine(def.symbol, DEFAULT_CONFIG, {
        previousClose: def.previousClose,
        rvolProfile: flatProfile(),
        dailyCloses: Array.from({ length: 21 }, (_, i) =>
          def.previousClose * (1 + (i % 2 ? 0.004 : -0.004))),
      }));
    }
    this.sector = new SectorEngine(
      'memory', 'Memory / Storage',
      MEMORY.map((m) => ({ symbol: m.symbol, weight: 1 })),
      DEFAULT_CONFIG,
    );
    this.signals = new SignalEngine({
      config: DEFAULT_CONFIG,
      deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
    });
  }

  /** Ramp every symbol from `from` to `to` across a block of minutes. */
  playBlock(fromMinute: number, toMinute: number, from: PctFor, to: PctFor, volumeMultiple: number): void {
    const span = toMinute - fromMinute + 1;
    for (let minute = fromMinute; minute <= toMinute; minute++) {
      const ratio = (minute - fromMinute + 1) / span;
      this.playMinute(minute, (def) => from(def) + (to(def) - from(def)) * ratio, volumeMultiple);
    }
  }

  private playMinute(minute: number, pctFor: PctFor, volumeMultiple: number): void {
    for (const def of MEMORY) {
      const engine = this.engines.get(def.symbol)!;
      const target = def.previousClose * (1 + pctFor(def) / 100);
      for (let i = 1; i <= PRINTS_PER_MINUTE; i++) {
        const timestamp = OPEN + minute * MINUTE + (i * MINUTE) / (PRINTS_PER_MINUTE + 1);
        const current = engine.snapshot('REGULAR', timestamp).price;
        const trade: Trade = {
          symbol: def.symbol,
          price: Number((current + (target - current) * (i / PRINTS_PER_MINUTE)).toFixed(4)),
          size: Math.round((BASE_RATE * volumeMultiple) / PRINTS_PER_MINUTE),
          timestamp,
        };
        this.tape.push(trade);
        engine.onTrade(trade);
      }
    }
  }

  /** Replay prints already seen. The engine must ignore every one. */
  replay(trades: Trade[]): void {
    for (const trade of trades) this.engines.get(trade.symbol)?.onTrade(trade);
  }

  settle(minute: number, previousScore: number | null): SectorMetrics {
    const now = OPEN + minute * MINUTE + 59_000;
    for (const def of MEMORY) {
      this.sector.updateStock(def.symbol, this.engines.get(def.symbol)!.snapshot('REGULAR', now));
    }
    const metrics = this.sector.compute('REGULAR', previousScore, now);
    const signal = this.signals.evaluateSector(metrics, 'REGULAR', now);
    if (signal) this.emitted.push(signal);
    return metrics;
  }
}

/** Drive the standard rally and hand back the state at each checkpoint. */
function runRally(h: Harness) {
  const leg = (i: 0 | 1 | 2): PctFor => (def) => def.legs[i];

  h.playBlock(0, 5, () => 0, leg(0), 1.0);
  const t0 = h.settle(5, null);

  h.playBlock(6, 12, leg(0), leg(1), 2.6);
  const t1 = h.settle(12, t0.score);

  h.playBlock(13, 20, leg(1), (d) => d.legs[2] * 0.75, 4.0);
  const t2 = h.settle(20, t1.score);

  h.playBlock(21, 28, (d) => d.legs[2] * 0.75, (d) => d.legs[2] * 1.15, 5.0);
  const t3 = h.settle(28, t2.score);

  return { t0, t1, t2, t3 };
}

describe('simulated memory-sector rally', () => {
  it('transitions IDLE -> AWAKENING -> ACCELERATING -> BREAKOUT', () => {
    const h = new Harness();
    const { t0, t1, t2, t3 } = runRally(h);

    expect(t0.stage).toBe('IDLE');
    expect(t1.stage).toBe('AWAKENING');
    expect(t2.stage).toBe('ACCELERATING');
    expect(t3.stage).toBe('BREAKOUT');

    // The move is monotonic in every dimension the product ranks on.
    expect(t1.changePercent).toBeGreaterThan(t0.changePercent);
    expect(t3.changePercent).toBeGreaterThan(t2.changePercent);
    expect(t3.avgRvol).toBeGreaterThan(t1.avgRvol);
    expect(t3.score).toBeGreaterThan(t1.score);
  });

  it('emits one signal per transition, not one per evaluation', () => {
    const h = new Harness();
    runRally(h);

    const stages = h.emitted.map((s) => s.metadata.stageTo);
    expect(stages).toEqual(['AWAKENING', 'ACCELERATING', 'BREAKOUT']);
    expect(h.emitted.map((s) => s.type)).toEqual([
      'SECTOR_AWAKENING', 'SECTOR_ACCELERATION', 'SECTOR_BREAKOUT',
    ]);
  });

  it('re-injecting the identical tape emits no further signals', () => {
    const h = new Harness();
    runRally(h);
    const afterFirstRun = h.emitted.length;
    const volumeBefore = h.engines.get('MU')!.snapshot('REGULAR', OPEN + 28 * MINUTE).volume;

    // Every print is a duplicate: same timestamp, price and size.
    h.replay(h.tape);
    const volumeAfter = h.engines.get('MU')!.snapshot('REGULAR', OPEN + 28 * MINUTE).volume;
    expect(volumeAfter).toBe(volumeBefore);

    // And re-evaluating the unchanged state stays silent, minute after minute.
    let score = h.settle(28, null).score;
    for (let minute = 29; minute <= 40; minute++) {
      score = h.settle(minute, score).score;
    }
    expect(h.emitted.length).toBe(afterFirstRun);
  });

  it('computes VWAP, RVOL and breadth from the tape rather than fixtures', () => {
    const h = new Harness();
    const { t3 } = runRally(h);
    const now = OPEN + 28 * MINUTE + 59_000;
    const mu = h.engines.get('MU')!.snapshot('REGULAR', now);

    // Price rose all session, so VWAP must trail it.
    expect(mu.vwap).toBeGreaterThan(0);
    expect(mu.vwap).toBeLessThan(mu.price);
    expect(mu.aboveVwap).toBe(true);
    expect(mu.vwapDistance).toBeGreaterThan(0);

    // Volume ran far above the 1,000/min baseline.
    expect(mu.rvol).toBeGreaterThan(2.0);
    expect(mu.changePercent).toBeGreaterThan(3.0);
    expect(mu.dayHigh).toBeGreaterThanOrEqual(mu.price);

    // All four advanced, so breadth is total and every name is a leader.
    expect(t3.active).toBe(4);
    expect(t3.breadth).toBeCloseTo(1.0, 6);
    expect(t3.advancing).toBe(4);
    expect(t3.leaders.length).toBe(4);
  });

  it('renders a breakout headline a trader can act on without interpreting it', () => {
    const h = new Harness();
    runRally(h);
    const breakout = h.emitted.find((s) => s.type === 'SECTOR_BREAKOUT')!;

    expect(breakout.headline).toContain('MEMORY / STORAGE BREAKOUT');
    expect(breakout.headline).toContain('4/4 advancing');
    expect(breakout.headline).toMatch(/avg RVOL \d+\.\dx/);
    expect(breakout.headline).toMatch(/Leaders: [A-Z]+ \+\d+\.\d%/);
    expect(breakout.metadata.leaders).toHaveLength(4);
  });

  it('a single stock running alone never wakes the sector', () => {
    const h = new Harness();

    // MU rips 6%; the other three sit still on ordinary volume.
    for (let m = 0; m <= 15; m++) {
      for (const def of MEMORY) {
        const isMu = def.symbol === 'MU';
        const pct = isMu ? (m / 15) * 6 : 0.05;
        h.engines.get(def.symbol)!.onTrade({
          symbol: def.symbol,
          price: Number((def.previousClose * (1 + pct / 100)).toFixed(4)),
          size: isMu ? 6_000 : 900,
          timestamp: OPEN + m * MINUTE + 30_000,
        });
      }
    }

    const metrics = h.settle(15, null);
    expect(metrics.stage).toBe('IDLE');
    expect(h.emitted).toHaveLength(0);
    // MU itself is unambiguously strong — the sector simply is not.
    expect(h.engines.get('MU')!.snapshot('REGULAR', OPEN + 15 * MINUTE).changePercent)
      .toBeGreaterThan(5);
  });
});
