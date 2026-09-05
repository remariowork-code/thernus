/**
 * Volatility expansion: σ5m / σ20d.
 *
 * The two inputs live on different time scales, so the daily baseline is
 * converted to a per-minute equivalent under the usual square-root-of-time
 * rule (σ_minute = σ_day / √390) before the ratio is taken. A result above 1
 * means the stock is currently moving faster than its own normal.
 */

export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Percent returns between consecutive closes. */
export function percentReturns(closes: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const prev = closes[i - 1];
    if (prev > 0) out.push(((closes[i] - prev) / prev) * 100);
  }
  return out;
}

/**
 * @param recentCloses  Trailing 1-minute closes; the last ~6 give σ5m.
 * @param dailyCloses   Trailing daily closes; ~21 give a 20-day σ.
 */
export function computeVolatilityExpansion(
  recentCloses: number[],
  dailyCloses: number[],
  sessionMinutes = 390,
): number {
  const sigma5m = standardDeviation(percentReturns(recentCloses.slice(-6)));
  const sigmaDaily = standardDeviation(percentReturns(dailyCloses));
  if (sigmaDaily <= 0) return 0;
  const sigmaPerMinute = sigmaDaily / Math.sqrt(sessionMinutes);
  if (sigmaPerMinute <= 0) return 0;
  return sigma5m / sigmaPerMinute;
}
