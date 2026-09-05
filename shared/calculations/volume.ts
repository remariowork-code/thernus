/**
 * Volume acceleration: the rate of volume over the last 5 minutes against the
 * rate over the preceding 15.
 *
 *   A_V(t) = (Σ_{m=t-4..t} V(m) / 5) / (Σ_{m=t-19..t-5} V(m) / 15)
 *
 * A value of 1.0 means volume is arriving at exactly its recent pace; 2.5
 * means the tape has gone two-and-a-half times faster in the last five minutes.
 * This is the term that catches a move while it is still forming.
 */

const FAST_WINDOW = 5;
const SLOW_WINDOW = 15;

/**
 * @param perMinuteVolumes Oldest-first, most recent minute last.
 */
export function computeVolumeAcceleration(perMinuteVolumes: number[]): number {
  const needed = FAST_WINDOW + SLOW_WINDOW;
  if (perMinuteVolumes.length < needed) return 1;

  const fast = perMinuteVolumes.slice(-FAST_WINDOW);
  const slow = perMinuteVolumes.slice(-needed, -FAST_WINDOW);

  const fastRate = fast.reduce((a, b) => a + b, 0) / FAST_WINDOW;
  const slowRate = slow.reduce((a, b) => a + b, 0) / SLOW_WINDOW;

  // A dead preceding window would divide by zero; treat any activity at all as
  // a strong but finite acceleration rather than Infinity.
  if (slowRate <= 0) return fastRate > 0 ? 10 : 1;
  return fastRate / slowRate;
}
