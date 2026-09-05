/**
 * Scripted rallies for the simulator.
 *
 * Used for demonstrations and manual QA: SIM_SCENARIO=<sector id> drives that
 * sector through the full lifecycle — quiet, then awakening, then confirmation,
 * then breakout — so the whole pipeline can be watched end to end without
 * waiting for a real market to do something interesting.
 *
 * The leaders move first and hardest, and a couple of constituents deliberately
 * lag, because a sector where every name moves identically would never exercise
 * the breadth calculation.
 *
 * A note on the volume multiples, which look extreme. RVOL is *cumulative*: a
 * stock that has traded normally all morning has to absorb an enormous burst
 * before its running ratio moves. Over a real session that burst is spread
 * across hours; here it is compressed into minutes, so the per-second rate has
 * to be correspondingly larger to reach the same 2-3x cumulative RVOL. These
 * numbers are a demonstration timeline, not a claim about real tape.
 */

import type { Universe } from '../../../shared/types';
import type { Scenario } from './SimulatedProvider';

export interface ScenarioOptions {
  /** Seconds until the sector reaches stage 1. */
  awakenAfterSeconds?: number;
  /** Seconds until it reaches breakout. */
  breakoutAfterSeconds?: number;
}

export function buildSectorScenario(
  universe: Universe,
  sectorId: string,
  options: ScenarioOptions = {},
): Scenario[] {
  const sector = universe.sectors.find((s) => s.id === sectorId);
  if (!sector) return [];

  const awaken = options.awakenAfterSeconds ?? 120;
  const breakout = options.breakoutAfterSeconds ?? 420;

  return sector.constituents.map(({ symbol }, index) => {
    // Two of every seven names lag, so breadth lands realistically short of
    // 100% and the sector still has to earn its stage.
    const laggard = index % 7 === 3 || index % 7 === 6;
    const strength = laggard ? 0.15 : 1 - Math.min(index, 8) * 0.06;

    return {
      symbol,
      legs: [
        { atSeconds: 0, changePercent: 0, volumeMultiple: 1 },
        { atSeconds: awaken * 0.5, changePercent: 0.4 * strength, volumeMultiple: 40 },
        { atSeconds: awaken, changePercent: 1.9 * strength, volumeMultiple: 110 },
        { atSeconds: (awaken + breakout) / 2, changePercent: 2.9 * strength, volumeMultiple: 190 },
        { atSeconds: breakout, changePercent: 4.4 * strength, volumeMultiple: 260 },
        // Plateau rather than reverse, so the cooling path is reached through
        // fading acceleration rather than a price collapse.
        { atSeconds: breakout + 600, changePercent: 4.6 * strength, volumeMultiple: 70 },
      ],
    };
  });
}
