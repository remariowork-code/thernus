/**
 * Stock momentum score, 0-100, from nine weighted components.
 *
 * A note on the formula. The spec gives:
 *
 *     S = min(100, Σ_{k=1..9} w_k · f_k(s))
 *
 * with weights summing to 100 and every f_k normalised "× 100" — i.e. each
 * f_k lands in [0,100]. Taken literally the sum reaches 10,000 and the min()
 * pins every stock at exactly 100, which cannot be the intent. The consistent
 * reading, and the one implemented here, is that the weights apply to the
 * normalised 0-1 band:
 *
 *     S = min(100, Σ w_k · f_k(s)/100)
 *
 * which lands in [0,100] and makes the weight table mean what it says (RVOL
 * can contribute at most 20 points). Components are still *reported* on the
 * 0-100 scale in the breakdown, so the UI can show "RVOL: 84/100 → 16.8 pts".
 */

import type { MomentumScales, MomentumWeights } from '../config';
import type { MomentumBreakdown } from '../types';

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export interface MomentumInputs {
  change1m: number;
  change5m: number;
  change15m: number;
  rvol: number;
  volumeAcceleration: number;
  price: number;
  vwap: number;
  dayHigh: number;
  /** Milliseconds since the last new intraday high, or null if none today. */
  msSinceNewHigh: number | null;
  /** σ5m / σ20d. */
  volatilityExpansion: number;
}

/**
 * 1. Price acceleration — is the last minute outrunning the last five?
 *    clamp(Δ%1m / (Δ%5m / 5), 0, 1) × 100
 */
export function fPriceAcceleration(i: MomentumInputs, scale: number): number {
  const perMinuteRate = i.change5m / 5;
  // With no 5m move to compare against, a positive 1m move is pure acceleration.
  if (perMinuteRate <= 0) return i.change1m > 0 ? 100 : 0;
  return clamp(i.change1m / perMinuteRate / scale, 0, 1) * 100;
}

/** 2. clamp(|Δ%5m| / 1.5, 0, 1) × 100 */
export function fMove5m(i: MomentumInputs, scale: number): number {
  return clamp(Math.abs(i.change5m) / scale, 0, 1) * 100;
}

/** 3. clamp(|Δ%15m| / 3.0, 0, 1) × 100 */
export function fMove15m(i: MomentumInputs, scale: number): number {
  return clamp(Math.abs(i.change15m) / scale, 0, 1) * 100;
}

/** 4. clamp(RVOL / 3.0, 0, 1) × 100 */
export function fRvol(i: MomentumInputs, scale: number): number {
  return clamp(i.rvol / scale, 0, 1) * 100;
}

/** 5. clamp(A_V / 2.5, 0, 1) × 100 */
export function fVolumeAcceleration(i: MomentumInputs, scale: number): number {
  return clamp(i.volumeAcceleration / scale, 0, 1) * 100;
}

/**
 * 6. Position versus VWAP — a three-step function, not a ramp:
 *    100 when comfortably above, 50 when barely above, 0 when below.
 */
export function fVwapPosition(i: MomentumInputs, strongDistance: number): number {
  if (!(i.vwap > 0) || i.price <= i.vwap) return 0;
  return (i.price - i.vwap) / i.vwap >= strongDistance ? 100 : 50;
}

/** 7. (1 - clamp((Phigh - P) / (0.01·Phigh), 0, 1)) × 100 */
export function fDistanceFromHigh(i: MomentumInputs, band: number): number {
  if (!(i.dayHigh > 0)) return 0;
  const distance = (i.dayHigh - i.price) / (band * i.dayHigh);
  return (1 - clamp(distance, 0, 1)) * 100;
}

/** 8. 100 if a new high printed inside the window, else 0. */
export function fNewHigh(i: MomentumInputs, windowSec: number): number {
  if (i.msSinceNewHigh === null) return 0;
  return i.msSinceNewHigh <= windowSec * 1000 ? 100 : 0;
}

/** 9. clamp(σ5m / σ20d, 0, 1) × 100 */
export function fVolatility(i: MomentumInputs, scale: number): number {
  return clamp(i.volatilityExpansion / scale, 0, 1) * 100;
}

export function computeMomentumBreakdown(
  inputs: MomentumInputs,
  weights: MomentumWeights,
  scales: MomentumScales,
): MomentumBreakdown {
  const parts: Array<{ key: string; label: string; weight: number; raw: number }> = [
    { key: 'priceAcceleration', label: 'Price Acceleration', weight: weights.priceAcceleration, raw: fPriceAcceleration(inputs, scales.priceAcceleration) },
    { key: 'move5m', label: '5-Minute Movement', weight: weights.move5m, raw: fMove5m(inputs, scales.move5m) },
    { key: 'move15m', label: '15-Minute Movement', weight: weights.move15m, raw: fMove15m(inputs, scales.move15m) },
    { key: 'rvol', label: 'Relative Volume', weight: weights.rvol, raw: fRvol(inputs, scales.rvol) },
    { key: 'volumeAcceleration', label: 'Volume Acceleration', weight: weights.volumeAcceleration, raw: fVolumeAcceleration(inputs, scales.volumeAcceleration) },
    { key: 'vwapPosition', label: 'Position vs VWAP', weight: weights.vwapPosition, raw: fVwapPosition(inputs, scales.vwapStrongDistance) },
    { key: 'distanceFromHigh', label: 'Distance from Day High', weight: weights.distanceFromHigh, raw: fDistanceFromHigh(inputs, scales.distanceFromHigh) },
    { key: 'newHigh', label: 'New Intraday High', weight: weights.newHigh, raw: fNewHigh(inputs, scales.newHighWindowSec) },
    { key: 'volatility', label: 'Volatility Expansion', weight: weights.volatility, raw: fVolatility(inputs, scales.volatility) },
  ];

  const components = parts.map((p) => ({ ...p, contribution: (p.weight * p.raw) / 100 }));
  const total = Math.min(100, components.reduce((acc, c) => acc + c.contribution, 0));

  return { total, components };
}

export function computeMomentumScore(
  inputs: MomentumInputs,
  weights: MomentumWeights,
  scales: MomentumScales,
): number {
  return computeMomentumBreakdown(inputs, weights, scales).total;
}
