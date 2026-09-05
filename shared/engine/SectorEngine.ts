/**
 * Sector aggregation and stage detection.
 *
 * This is the part that makes the product different from a screener. A screener
 * ranks stocks; this ranks *sectors*, and only calls a sector strong when the
 * move is broad. One semiconductor stock up 6% is noise. Eight of eleven up 1.5%
 * on double normal volume is a sector waking up.
 *
 *   Breadth        B_S = Σ I(Δ%daily,i > 0) / M
 *   Sector score   S_S = Σ w_i·S_i / Σ w_i
 *   Acceleration   A_S(t) = S_S(t) − S_S(t−5min)
 */

import type { MarketPulseConfig, SectorStageThresholds, SectorThresholdOverride } from '../config';
import { adjustMoveThreshold, isRvolMeaningful } from '../market/session';
import type {
  MarketSession, SectorLeader, SectorMetrics, SectorStage, StockMetrics,
} from '../types';

export interface SectorConstituent {
  symbol: string;
  weight: number;
}

export interface StageEvaluation {
  stage: SectorStage;
  /** Highest stage whose conditions are met, 0 when none are. */
  stageNumber: 0 | 1 | 2 | 3 | 4;
  /** Per-stage pass/fail detail — surfaced in the UI to explain a call. */
  reasons: Record<string, boolean>;
}

const STAGE_TO_NAME: Record<number, SectorStage> = {
  0: 'IDLE',
  1: 'AWAKENING',
  2: 'ACCELERATING',
  3: 'BREAKOUT',
  4: 'BREAKOUT',
};

export class SectorEngine {
  private readonly metricsBySymbol = new Map<string, StockMetrics>();
  private stage: SectorStage = 'IDLE';
  /** Consecutive evaluations with negative acceleration, for the COOLING gate. */
  private negativeAccelerationSince: number | null = null;

  constructor(
    public readonly sectorId: string,
    public readonly sectorName: string,
    private readonly constituents: SectorConstituent[],
    private readonly config: MarketPulseConfig,
  ) {}

  /** Feed in a constituent's freshly computed metrics. */
  updateStock(symbol: string, metrics: StockMetrics): void {
    if (!this.constituents.some((c) => c.symbol === symbol)) return;
    this.metricsBySymbol.set(symbol, metrics);
  }

  getStage(): SectorStage {
    return this.stage;
  }

  setStage(stage: SectorStage): void {
    this.stage = stage;
  }

  private weightOf(symbol: string): number {
    return this.constituents.find((c) => c.symbol === symbol)?.weight ?? 1;
  }

  /** Constituents that have actually traded. A dead name must not dilute breadth. */
  private activeMetrics(): StockMetrics[] {
    return this.constituents
      .map((c) => this.metricsBySymbol.get(c.symbol))
      .filter((m): m is StockMetrics => m !== undefined && m.volume > 0);
  }

  /** Thresholds for a stage, with any per-sector override applied. */
  thresholdsFor(stage: 1 | 2 | 3 | 4): SectorStageThresholds {
    const base = this.config.sector[`stage${stage}` as const];
    const override: SectorThresholdOverride | undefined =
      this.config.sector.overrides?.[this.sectorId];
    const stageOverride = override?.[`stage${stage}` as const];
    return stageOverride ? { ...base, ...stageOverride } : base;
  }

  compute(session: MarketSession, previousScore: number | null, now = Date.now()): SectorMetrics {
    const active = this.activeMetrics();
    const activeCount = active.length;

    if (activeCount === 0) {
      return this.emptyMetrics(now);
    }

    const totalWeight = active.reduce((acc, m) => acc + this.weightOf(m.symbol), 0);
    const weighted = (pick: (m: StockMetrics) => number): number =>
      totalWeight > 0
        ? active.reduce((acc, m) => acc + this.weightOf(m.symbol) * pick(m), 0) / totalWeight
        : 0;
    const mean = (pick: (m: StockMetrics) => number): number =>
      active.reduce((acc, m) => acc + pick(m), 0) / activeCount;

    const advancing = active.filter((m) => m.changePercent > 0).length;
    const breadth = advancing / activeCount;
    const score = weighted((m) => m.momentumScore);
    const changePercent = mean((m) => m.changePercent);
    const avgRvol = mean((m) => m.rvol);
    const avgMomentum = mean((m) => m.momentumScore);
    const aboveVwapCount = active.filter((m) => m.aboveVwap).length;
    const newHighCount = active.filter((m) => m.isNewHigh).length;
    const volumeAcceleration = mean((m) => m.volumeAcceleration);

    const strongThreshold = adjustMoveThreshold(
      this.thresholdsFor(3).strongLeaderMovePct,
      session,
      this.config.session.extendedHoursMultiplier,
    );
    const strongLeaderCount = active.filter((m) => m.changePercent >= strongThreshold).length;

    const leaders: SectorLeader[] = [...active]
      .sort((a, b) => b.momentumScore - a.momentumScore)
      .slice(0, this.config.sector.leaderCount)
      .map((m) => ({
        symbol: m.symbol,
        changePercent: m.changePercent,
        rvol: m.rvol,
        momentumScore: m.momentumScore,
        isNewHigh: m.isNewHigh,
      }));

    // Acceleration is the early-warning term: a sector at score 55 and rising
    // is more interesting than one sitting at 80 and fading.
    const acceleration = previousScore === null ? 0 : score - previousScore;

    const draft: SectorMetrics = {
      sectorId: this.sectorId,
      sectorName: this.sectorName,
      score,
      changePercent,
      breadth,
      advancing,
      active: activeCount,
      avgRvol,
      avgMomentum,
      aboveVwapCount,
      newHighCount,
      volumeAcceleration,
      acceleration,
      strongLeaderCount,
      leaders,
      stage: this.stage,
      updatedAt: now,
    };

    draft.stage = this.resolveStage(draft, session, now);
    this.stage = draft.stage;
    return draft;
  }

  private emptyMetrics(now: number): SectorMetrics {
    return {
      sectorId: this.sectorId,
      sectorName: this.sectorName,
      score: 0,
      changePercent: 0,
      breadth: 0,
      advancing: 0,
      active: 0,
      avgRvol: 0,
      avgMomentum: 0,
      aboveVwapCount: 0,
      newHighCount: 0,
      volumeAcceleration: 1,
      acceleration: 0,
      strongLeaderCount: 0,
      leaders: [],
      stage: 'IDLE',
      updatedAt: now,
    };
  }

  /**
   * Which stage's conditions does the current state satisfy?
   *
   * Evaluated highest-first so a sector that qualifies for stage 3 is not
   * reported as stage 1. Every threshold that is a *percentage move* gets the
   * session adjustment; counts and breadth do not.
   */
  evaluate(metrics: SectorMetrics, session: MarketSession): StageEvaluation {
    for (const stage of [4, 3, 2, 1] as const) {
      const t = this.thresholdsFor(stage);
      const mult = this.config.session.extendedHoursMultiplier;

      const movingThreshold = adjustMoveThreshold(t.movingStockMovePct, session, mult);
      const movers = this.activeMetrics().filter((m) => m.changePercent >= movingThreshold);
      const movingStocks = movers.length;

      // "Average movement among leaders" means among the names actually
      // leading the move. Averaging over a fixed top-N pads the set with
      // laggards once a sector has more constituents than leader slots, which
      // silently raises the bar for wide sectors and suppresses stage 1.
      const leaderAvg = movers.length
        ? movers.reduce((a, m) => a + m.changePercent, 0) / movers.length
        : 0;

      const reasons: Record<string, boolean> = {
        movingStocks: movingStocks >= t.minMovingStocks,
        leaderAvgMove:
          t.minLeaderAvgMovePct === 0 ||
          leaderAvg >= adjustMoveThreshold(t.minLeaderAvgMovePct, session, mult),
        sectorAvgMove:
          t.minSectorAvgMovePct === 0 ||
          metrics.changePercent >= adjustMoveThreshold(t.minSectorAvgMovePct, session, mult),
        breadth: metrics.breadth > t.minBreadth,
        // RVOL is not trustworthy outside regular hours, so it is waived there
        // rather than allowed to block or fabricate a stage.
        rvol: !isRvolMeaningful(session) || metrics.avgRvol >= t.minAvgRvol,
        strongLeaders: metrics.strongLeaderCount >= t.minStrongLeaders,
        newHighs: metrics.newHighCount >= t.minNewHighs,
      };

      if (Object.values(reasons).every(Boolean)) {
        return { stage: STAGE_TO_NAME[stage], stageNumber: stage, reasons };
      }
    }

    return { stage: 'IDLE', stageNumber: 0, reasons: {} };
  }

  /**
   * Turn a stage evaluation into the sector's lifecycle state.
   *
   * The lifecycle is not the same as the evaluation: a sector that *was*
   * breaking out and is now failing its thresholds goes to COOLING, not
   * straight back to IDLE, and only reaches IDLE once its score decays.
   */
  private resolveStage(metrics: SectorMetrics, session: MarketSession, now: number): SectorStage {
    const evaluation = this.evaluate(metrics, session);

    if (evaluation.stageNumber > 0) {
      this.negativeAccelerationSince = null;
      return evaluation.stage;
    }

    const wasActive =
      this.stage === 'AWAKENING' || this.stage === 'ACCELERATING' || this.stage === 'BREAKOUT';

    if (wasActive) {
      // Sustained negative acceleration is what defines cooling — a single
      // negative sample is just noise.
      if (metrics.acceleration < 0) {
        if (this.negativeAccelerationSince === null) this.negativeAccelerationSince = now;
        const elapsedMin = (now - this.negativeAccelerationSince) / 60_000;
        if (elapsedMin >= this.config.sector.coolingMinutes) return 'COOLING';
      } else {
        this.negativeAccelerationSince = null;
      }
      return this.stage;
    }

    if (this.stage === 'COOLING') {
      return metrics.score < this.config.sector.idleScore ? 'IDLE' : 'COOLING';
    }

    return 'IDLE';
  }

  /** Test seam: force cooling to be reachable without waiting five minutes. */
  markNegativeAccelerationSince(at: number | null): void {
    this.negativeAccelerationSince = at;
  }
}
