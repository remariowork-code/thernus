import type { StockMetrics } from '../../../shared/types';
import type { EntryRules as EntryConfig } from '../config';

export interface EntryEvaluation {
  symbol: string;
  pass: boolean;
  /** Conditions that were met, in plain language. */
  reasons: string[];
  /** The first condition that failed, if any. */
  blockedBy: string | null;
  evidence: Record<string, number>;
}

/**
 * Decides whether a moving stock is worth buying.
 *
 * These are the "explicit, configurable entry conditions" from the brief, and
 * they are checked in a fixed order: the cheap structural filters first, the
 * momentum judgement last. Every check contributes a sentence whether it passes
 * or fails, which is what makes the resulting trade explainable without going
 * back to the data.
 *
 * The conditions divide into two kinds. Price, volume and change are filters —
 * is this instrument tradeable at all. VWAP, distance from the high and the
 * five-minute change are timing — is *now* the moment. A stock can pass the
 * first set all day and only pass the second for a few minutes.
 */
export function evaluateEntry(m: StockMetrics, config: EntryConfig): EntryEvaluation {
  const reasons: string[] = [];
  let blockedBy: string | null = null;

  const check = (ok: boolean, pass: string, fail: string): void => {
    if (ok) reasons.push(pass);
    else if (!blockedBy) blockedBy = fail;
  };

  check(
    m.price >= config.minPrice && m.price <= config.maxPrice,
    `price $${m.price.toFixed(2)} is inside the $${config.minPrice}-$${config.maxPrice} band`,
    `price $${m.price.toFixed(2)} is outside the $${config.minPrice}-$${config.maxPrice} band`,
  );

  check(
    m.volume >= config.minDayVolume,
    `${fmt(m.volume)} shares traded today, above the ${fmt(config.minDayVolume)} floor`,
    `only ${fmt(m.volume)} shares traded today, below the ${fmt(config.minDayVolume)} floor`,
  );

  check(
    m.changePercent >= config.minChangePercent,
    `up ${m.changePercent.toFixed(1)}% on the day, past the ${config.minChangePercent}% trigger`,
    `up only ${m.changePercent.toFixed(1)}% on the day, under the ${config.minChangePercent}% trigger`,
  );

  // The volume test is the one that separates a real move from drift. RVOL is
  // measured against this symbol's own volume at this time of day, so a stock
  // that is always busy at 10am does not qualify merely for being busy.
  check(
    m.rvol >= config.minRvol,
    `trading at ${m.rvol.toFixed(1)}x its normal volume for this time of day`,
    `volume is only ${m.rvol.toFixed(1)}x normal, under the ${config.minRvol}x requirement`,
  );

  check(
    m.momentumScore >= config.minMomentumScore,
    `momentum score ${m.momentumScore.toFixed(0)}, above ${config.minMomentumScore}`,
    `momentum score ${m.momentumScore.toFixed(0)}, below ${config.minMomentumScore}`,
  );

  if (config.requireAboveVwap) {
    check(
      m.aboveVwap,
      `price is ${m.vwapDistance.toFixed(1)}% above VWAP, so today's buyers are ahead`,
      `price is ${m.vwapDistance.toFixed(1)}% against VWAP, so today's buyers are underwater`,
    );
  }

  // Buying well off the high means buying from someone who already took profit.
  check(
    m.distanceFromHigh <= config.maxDistanceFromHighPercent,
    `sitting ${m.distanceFromHigh.toFixed(1)}% off the day's high`,
    `${m.distanceFromHigh.toFixed(1)}% off the day's high, more than the ` +
      `${config.maxDistanceFromHighPercent}% allowed`,
  );

  if (config.requirePositiveFiveMinute) {
    check(
      m.change5m > 0,
      `still rising, ${m.change5m >= 0 ? '+' : ''}${m.change5m.toFixed(1)}% over five minutes`,
      `stalled or falling, ${m.change5m.toFixed(1)}% over five minutes`,
    );
  }

  return {
    symbol: m.symbol,
    pass: blockedBy === null,
    reasons,
    blockedBy,
    evidence: {
      price: m.price,
      changePercent: m.changePercent,
      rvol: m.rvol,
      momentumScore: m.momentumScore,
      change5m: m.change5m,
      distanceFromHigh: m.distanceFromHigh,
      vwapDistance: m.vwapDistance,
      volume: m.volume,
    },
  };
}

/**
 * Ranks passing candidates when more than one qualifies at the same moment.
 *
 * Volume conviction is weighted above raw price movement on purpose: a stock up
 * 4% on 8x volume is a better entry than one up 12% on 2x, because the second
 * has already spent most of its move and has thinner support underneath it.
 */
export function rankCandidates(evaluations: EntryEvaluation[]): EntryEvaluation[] {
  return [...evaluations]
    .filter((e) => e.pass)
    .sort((a, b) => candidateScore(b) - candidateScore(a));
}

function candidateScore(e: EntryEvaluation): number {
  const rvol = Math.min(e.evidence.rvol ?? 0, 15);
  return (e.evidence.momentumScore ?? 0) + rvol * 3 + (e.evidence.change5m ?? 0) * 2;
}

function fmt(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}
