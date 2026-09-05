/**
 * Time-of-day normalised relative volume.
 *
 * The spec is explicit that comparing partial-day volume against a full-day
 * average is the thing that makes ordinary scanners useless before 11am. We
 * instead build a cumulative volume *curve* per symbol and compare like for
 * like: volume by 09:45 against the volume this symbol normally has by 09:45.
 *
 *   E[Vcum(t)] = (1/N) · Σ_{d=1..N} Σ_{m=0..t} V_{s,d}(m)
 *   RVOL(t)    = Vcum(t) / E[Vcum(t)]
 */

import type { Bar } from '../types';

/** Expected cumulative volume indexed by minute-of-session, 0..sessionMinutes-1. */
export type RvolProfile = number[];

/** 09:30 EST is minute 0; 15:59 EST is minute 389. */
export function minuteOfSession(timestamp: number, sessionMinutes = 390): number {
  const est = new Date(
    new Date(timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' }),
  );
  const minutesSinceOpen = est.getHours() * 60 + est.getMinutes() - (9 * 60 + 30);
  if (minutesSinceOpen < 0) return 0;
  return Math.min(minutesSinceOpen, sessionMinutes - 1);
}

/**
 * Fold N days of 1-minute bars into one cumulative-volume curve.
 *
 * Bars may be sparse — an illiquid minute simply has no bar — so we bucket by
 * minute-of-session, average across the days that actually traded, and then
 * run a cumulative sum. A missing minute contributes zero incremental volume
 * rather than breaking the curve.
 */
export function buildRvolProfile(
  historicalBars: Bar[],
  sessionMinutes = 390,
): RvolProfile {
  const perMinuteTotals = new Array<number>(sessionMinutes).fill(0);
  const daysSeen = new Set<string>();
  const dayHasMinute = new Map<number, Set<string>>();

  for (const bar of historicalBars) {
    const minute = minuteOfSession(bar.timestamp, sessionMinutes);
    const dayKey = new Date(bar.timestamp).toLocaleDateString('en-US', {
      timeZone: 'America/New_York',
    });
    daysSeen.add(dayKey);
    perMinuteTotals[minute] += bar.volume;
    if (!dayHasMinute.has(minute)) dayHasMinute.set(minute, new Set());
    dayHasMinute.get(minute)!.add(dayKey);
  }

  const dayCount = Math.max(daysSeen.size, 1);
  const profile = new Array<number>(sessionMinutes).fill(0);
  let running = 0;
  for (let m = 0; m < sessionMinutes; m++) {
    running += perMinuteTotals[m] / dayCount;
    profile[m] = running;
  }
  return profile;
}

/**
 * A generic intraday volume curve, used when a symbol has no history yet.
 * Shape follows the well-known U: heavy at the open, a midday trough, and a
 * closing-auction ramp. Values are the *fraction of the day's volume* traded
 * by the end of each half-hour bucket.
 */
const GENERIC_CUMULATIVE_SHAPE = [
  0.115, 0.19, 0.25, 0.30, 0.345, 0.385, 0.425, 0.465, 0.51, 0.56, 0.625, 0.72, 1.0,
];

/** Interpolate the generic shape onto a full per-minute cumulative curve. */
export function genericRvolProfile(
  averageDailyVolume: number,
  sessionMinutes = 390,
): RvolProfile {
  const buckets = GENERIC_CUMULATIVE_SHAPE.length;
  const minutesPerBucket = sessionMinutes / buckets;
  const profile = new Array<number>(sessionMinutes).fill(0);
  for (let m = 0; m < sessionMinutes; m++) {
    const position = (m + 1) / minutesPerBucket;
    const index = Math.min(Math.floor(position), buckets - 1);
    const lower = index === 0 ? 0 : GENERIC_CUMULATIVE_SHAPE[index - 1];
    const upper = GENERIC_CUMULATIVE_SHAPE[index];
    const withinBucket = Math.min(position - index, 1);
    profile[m] = averageDailyVolume * (lower + (upper - lower) * withinBucket);
  }
  return profile;
}

/**
 * RVOL at the given minute. Returns 0 when no baseline exists — an unknown
 * baseline must never masquerade as unusual activity.
 */
export function computeRvol(
  cumulativeVolume: number,
  profile: RvolProfile,
  minute: number,
): number {
  if (!profile.length) return 0;
  const index = Math.min(Math.max(minute, 0), profile.length - 1);
  const expected = profile[index];
  if (!Number.isFinite(expected) || expected <= 0) return 0;
  return cumulativeVolume / expected;
}
