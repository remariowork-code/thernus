/**
 * Sector ranking.
 *
 * "The dashboard should prioritize sectors that are accelerating, not simply
 * sectors with the highest current percentage gain." That sentence is the
 * product, so the ordering lives in its own module rather than being buried in
 * a table component.
 *
 * Rank = score, plus a bonus for acceleration and breadth. A sector at 60 and
 * climbing fast on wide participation ranks above one at 75 that has stalled.
 */

import type { SectorMetrics } from './types';

export interface RankWeights {
  score: number;
  acceleration: number;
  breadth: number;
  /** Anything not yet awake is pushed below everything that is. */
  idlePenalty: number;
}

export const DEFAULT_RANK_WEIGHTS: RankWeights = {
  score: 1,
  acceleration: 1.5,
  breadth: 20,
  idlePenalty: 25,
};

export function rankValue(
  sector: SectorMetrics,
  weights: RankWeights = DEFAULT_RANK_WEIGHTS,
): number {
  const stageBonus =
    sector.stage === 'BREAKOUT' ? 15
    : sector.stage === 'ACCELERATING' ? 10
    : sector.stage === 'AWAKENING' ? 5
    : sector.stage === 'COOLING' ? -5
    : -weights.idlePenalty;

  return (
    sector.score * weights.score +
    sector.acceleration * weights.acceleration +
    sector.breadth * weights.breadth +
    stageBonus
  );
}

export function rankSectors(
  sectors: SectorMetrics[],
  weights: RankWeights = DEFAULT_RANK_WEIGHTS,
): SectorMetrics[] {
  return [...sectors].sort((a, b) => rankValue(b, weights) - rankValue(a, weights));
}
