/**
 * Session VWAP, accumulated tick by tick.
 *
 *   VWAP(t) = Σ P_i·v_i / Σ v_i   over trades in the current session
 *
 * Kept as running sums rather than recomputed from a trade list — the worker
 * sees millions of prints a day and must not retain them.
 */

export interface VwapAccumulator {
  notional: number;
  volume: number;
}

export function createVwapAccumulator(): VwapAccumulator {
  return { notional: 0, volume: 0 };
}

export function addTradeToVwap(acc: VwapAccumulator, price: number, size: number): void {
  if (size <= 0 || !Number.isFinite(price)) return;
  acc.notional += price * size;
  acc.volume += size;
}

/** Falls back to the passed price before the first print of the session. */
export function computeVwap(acc: VwapAccumulator, fallbackPrice: number): number {
  if (acc.volume <= 0) return fallbackPrice;
  return acc.notional / acc.volume;
}

/** Signed fractional distance from VWAP. Positive means price is above. */
export function vwapDistance(price: number, vwap: number): number {
  if (!Number.isFinite(vwap) || vwap <= 0) return 0;
  return (price - vwap) / vwap;
}
