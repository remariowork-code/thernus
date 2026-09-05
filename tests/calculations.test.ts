import { describe, expect, it } from 'vitest';
import {
  buildRvolProfile, computeRvol, genericRvolProfile, minuteOfSession,
} from '@shared/calculations/rvol';
import { computeVolumeAcceleration } from '@shared/calculations/volume';
import {
  addTradeToVwap, computeVwap, createVwapAccumulator, vwapDistance,
} from '@shared/calculations/vwap';
import { computeVolatilityExpansion, standardDeviation } from '@shared/calculations/volatility';
import { computeMomentumBreakdown, computeMomentumScore } from '@shared/calculations/momentum';
import { DEFAULT_CONFIG } from '@shared/config';
import type { Bar } from '@shared/types';

const { weights, scales } = DEFAULT_CONFIG.momentum;

/** 09:30 EST on a normal weekday, expressed in UTC (EDT = UTC-4). */
const OPEN_UTC = Date.parse('2026-09-08T13:30:00Z');
const at = (minutesAfterOpen: number) => OPEN_UTC + minutesAfterOpen * 60_000;

describe('minuteOfSession', () => {
  it('maps 09:30 to minute 0 and 15:59 to minute 389', () => {
    expect(minuteOfSession(at(0))).toBe(0);
    expect(minuteOfSession(at(389))).toBe(389);
  });

  it('maps 09:45 to minute 15 — the spec\'s worked example', () => {
    expect(minuteOfSession(at(15))).toBe(15);
  });

  it('clamps pre-open timestamps to minute 0', () => {
    expect(minuteOfSession(at(-30))).toBe(0);
  });
});

describe('RVOL — time-of-day normalisation', () => {
  /** Two days of bars, 1000 shares every minute. */
  function twoDaysOfBars(perMinute: number): Bar[] {
    const bars: Bar[] = [];
    for (const dayOffset of [0, 1]) {
      const dayStart = OPEN_UTC - (dayOffset + 1) * 24 * 60 * 60 * 1000;
      for (let m = 0; m < 390; m++) {
        bars.push({
          symbol: 'TEST', open: 10, high: 10, low: 10, close: 10,
          volume: perMinute, timestamp: dayStart + m * 60_000,
        });
      }
    }
    return bars;
  }

  it('builds a cumulative curve averaged across days', () => {
    const profile = buildRvolProfile(twoDaysOfBars(1000));
    // By minute 15 (i.e. 16 minutes elapsed) a typical day has traded 16k.
    expect(profile[15]).toBeCloseTo(16_000, 5);
    expect(profile[389]).toBeCloseTo(390_000, 5);
  });

  it('reports 1.0 when volume exactly matches the curve', () => {
    const profile = buildRvolProfile(twoDaysOfBars(1000));
    expect(computeRvol(16_000, profile, 15)).toBeCloseTo(1.0, 6);
  });

  it('catches early-session unusual volume that a full-day average would miss', () => {
    const profile = buildRvolProfile(twoDaysOfBars(1000));
    // 48k shares by 09:45. Against the full-day average of 390k this looks like
    // a sleepy 0.12x; against the time-of-day curve it is a 3x surge.
    const naive = 48_000 / 390_000;
    const normalised = computeRvol(48_000, profile, 15);
    expect(naive).toBeLessThan(0.2);
    expect(normalised).toBeCloseTo(3.0, 6);
  });

  it('returns 0 rather than Infinity when no baseline exists', () => {
    expect(computeRvol(100_000, [], 15)).toBe(0);
    expect(computeRvol(100_000, new Array(390).fill(0), 15)).toBe(0);
  });

  it('generic fallback curve is monotonic and front-loaded', () => {
    const profile = genericRvolProfile(1_000_000);
    for (let m = 1; m < profile.length; m++) {
      expect(profile[m]).toBeGreaterThanOrEqual(profile[m - 1]);
    }
    // The open is heavier than a flat curve would predict.
    expect(profile[29]).toBeGreaterThan(1_000_000 * (30 / 390));
  });
});

describe('volume acceleration', () => {
  it('is 1.0 on steady volume', () => {
    expect(computeVolumeAcceleration(new Array(20).fill(1000))).toBeCloseTo(1.0, 6);
  });

  it('rises when the last five minutes outpace the prior fifteen', () => {
    const volumes = [...new Array(15).fill(1000), ...new Array(5).fill(3000)];
    expect(computeVolumeAcceleration(volumes)).toBeCloseTo(3.0, 6);
  });

  it('defaults to 1.0 before a full window exists', () => {
    expect(computeVolumeAcceleration([1000, 2000, 3000])).toBe(1);
  });

  it('does not divide by zero on a dead preceding window', () => {
    const volumes = [...new Array(15).fill(0), ...new Array(5).fill(5000)];
    expect(Number.isFinite(computeVolumeAcceleration(volumes))).toBe(true);
  });
});

describe('VWAP', () => {
  it('weights by size, not by print count', () => {
    const acc = createVwapAccumulator();
    addTradeToVwap(acc, 10, 100);   // 1,000
    addTradeToVwap(acc, 20, 900);   // 18,000
    // A naive mean of prices would give 15; size-weighted is 19.
    expect(computeVwap(acc, 0)).toBeCloseTo(19, 6);
  });

  it('falls back to the passed price before any print', () => {
    expect(computeVwap(createVwapAccumulator(), 42.5)).toBe(42.5);
  });

  it('ignores non-positive sizes', () => {
    const acc = createVwapAccumulator();
    addTradeToVwap(acc, 10, 100);
    addTradeToVwap(acc, 999, 0);
    expect(computeVwap(acc, 0)).toBeCloseTo(10, 6);
  });

  it('signs distance from VWAP', () => {
    expect(vwapDistance(101, 100)).toBeCloseTo(0.01, 6);
    expect(vwapDistance(99, 100)).toBeCloseTo(-0.01, 6);
    expect(vwapDistance(100, 0)).toBe(0);
  });
});

describe('volatility expansion', () => {
  it('returns 0 without a daily baseline', () => {
    expect(computeVolatilityExpansion([10, 10.1, 10.2], [])).toBe(0);
  });

  it('rises when recent minutes are more volatile than the daily norm', () => {
    const calmDaily = [100, 100.5, 100.2, 100.7, 100.4, 100.9, 100.6];
    const wildMinutes = [100, 102, 99, 103, 98, 104];
    const calmMinutes = [100, 100.05, 100.02, 100.06, 100.03, 100.07];
    expect(computeVolatilityExpansion(wildMinutes, calmDaily))
      .toBeGreaterThan(computeVolatilityExpansion(calmMinutes, calmDaily));
  });

  it('standardDeviation needs two points', () => {
    expect(standardDeviation([5])).toBe(0);
    expect(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
  });
});

describe('momentum score', () => {
  const flat = {
    change1m: 0, change5m: 0, change15m: 0, rvol: 0, volumeAcceleration: 0,
    price: 100, vwap: 100, dayHigh: 100, msSinceNewHigh: null, volatilityExpansion: 0,
  };

  it('is 0 for a completely inert stock', () => {
    // Sitting exactly at the day high still earns the distance-from-high points.
    const score = computeMomentumScore({ ...flat, dayHigh: 110 }, weights, scales);
    expect(score).toBe(0);
  });

  it('is capped at 100 when every component saturates', () => {
    const maxed = {
      change1m: 5, change5m: 5, change15m: 10, rvol: 10, volumeAcceleration: 10,
      price: 110, vwap: 100, dayHigh: 110, msSinceNewHigh: 1_000, volatilityExpansion: 5,
    };
    expect(computeMomentumScore(maxed, weights, scales)).toBe(100);
  });

  it('weights sum to 100 so each component contributes at most its weight', () => {
    const total = Object.values(weights).reduce((a, b) => a + b, 0);
    expect(total).toBe(100);

    const rvolOnly = computeMomentumBreakdown(
      { ...flat, dayHigh: 110, rvol: 99 }, weights, scales,
    );
    const rvolComponent = rvolOnly.components.find((c) => c.key === 'rvol')!;
    expect(rvolComponent.contribution).toBeCloseTo(weights.rvol, 6);
  });

  it('scores VWAP position as a three-step function', () => {
    const below = computeMomentumBreakdown({ ...flat, price: 99, vwap: 100, dayHigh: 110 }, weights, scales);
    const barely = computeMomentumBreakdown({ ...flat, price: 100.2, vwap: 100, dayHigh: 110 }, weights, scales);
    const clear = computeMomentumBreakdown({ ...flat, price: 101, vwap: 100, dayHigh: 110 }, weights, scales);
    const pick = (b: typeof below) => b.components.find((c) => c.key === 'vwapPosition')!.raw;
    expect(pick(below)).toBe(0);
    expect(pick(barely)).toBe(50);
    expect(pick(clear)).toBe(100);
  });

  it('awards the new-high component only inside the window', () => {
    const inside = computeMomentumBreakdown({ ...flat, dayHigh: 110, msSinceNewHigh: 30_000 }, weights, scales);
    const outside = computeMomentumBreakdown({ ...flat, dayHigh: 110, msSinceNewHigh: 90_000 }, weights, scales);
    const pick = (b: typeof inside) => b.components.find((c) => c.key === 'newHigh')!.raw;
    expect(pick(inside)).toBe(100);
    expect(pick(outside)).toBe(0);
  });

  it('ranks an accelerating stock above a stale one at the same daily change', () => {
    const stale = { ...flat, change5m: 0.1, change15m: 3, rvol: 1, price: 103, vwap: 102, dayHigh: 106 };
    const fresh = { ...flat, change1m: 0.9, change5m: 2.0, change15m: 3, rvol: 3, volumeAcceleration: 3, price: 106, vwap: 102, dayHigh: 106, msSinceNewHigh: 5_000 };
    expect(computeMomentumScore(fresh, weights, scales))
      .toBeGreaterThan(computeMomentumScore(stale, weights, scales));
  });
});
