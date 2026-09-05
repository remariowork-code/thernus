/**
 * Every weight and threshold the scanner uses. The spec is emphatic that the
 * scoring system must be tunable "without rewriting the entire engine", so no
 * engine file is permitted to hard-code a number that appears here.
 *
 * Any value may be overridden from the environment via MARKETPULSE_CONFIG
 * (JSON, deep-merged over the defaults) without a redeploy of the engines.
 */

import type { SignalSeverity } from './types';

export interface MomentumWeights {
  priceAcceleration: number;
  move5m: number;
  move15m: number;
  rvol: number;
  volumeAcceleration: number;
  vwapPosition: number;
  distanceFromHigh: number;
  newHigh: number;
  volatility: number;
}

/** Denominators that map a raw metric onto its 0-1 normalised band. */
export interface MomentumScales {
  /** Δ%1m / (Δ%5m / 5) saturates here. */
  priceAcceleration: number;
  /** |Δ%5m| saturates at this percent. */
  move5m: number;
  /** |Δ%15m| saturates at this percent. */
  move15m: number;
  /** RVOL saturates here. */
  rvol: number;
  /** Volume acceleration saturates here. */
  volumeAcceleration: number;
  /** Fraction above VWAP earning the full component. */
  vwapStrongDistance: number;
  /** Percent below day high at which the component reaches zero. */
  distanceFromHigh: number;
  /** Seconds a new high stays "new". */
  newHighWindowSec: number;
  /** σ5m / σ20d saturates here. */
  volatility: number;
}

export interface SectorStageThresholds {
  /** Constituents that must be "moving" (>= movingStockMovePct). */
  minMovingStocks: number;
  /** Percent move that qualifies a constituent as moving. */
  movingStockMovePct: number;
  /** Mean move of the sector's leaders. */
  minLeaderAvgMovePct: number;
  /** Mean move of the whole sector. */
  minSectorAvgMovePct: number;
  /** Breadth as a fraction, 0-1. */
  minBreadth: number;
  minAvgRvol: number;
  /** Constituents at or above strongLeaderMovePct. */
  minStrongLeaders: number;
  strongLeaderMovePct: number;
  minNewHighs: number;
  /** Set on stage 4 — a correlated catalyst escalates severity further. */
  catalystPreferred: boolean;
  severity: SignalSeverity;
}

export type SectorThresholdOverride = Partial<{
  stage1: Partial<SectorStageThresholds>;
  stage2: Partial<SectorStageThresholds>;
  stage3: Partial<SectorStageThresholds>;
  stage4: Partial<SectorStageThresholds>;
}>;

export interface MarketPulseConfig {
  momentum: { weights: MomentumWeights; scales: MomentumScales };
  sector: {
    stage1: SectorStageThresholds;
    stage2: SectorStageThresholds;
    stage3: SectorStageThresholds;
    stage4: SectorStageThresholds;
    /** Sector score below this returns a COOLING sector to IDLE. */
    idleScore: number;
    /** Consecutive minutes of negative acceleration before COOLING. */
    coolingMinutes: number;
    /** How many leaders to surface per sector. */
    leaderCount: number;
    /** Sector score at or above which a news item becomes a CATALYST signal. */
    catalystCorrelationScore: number;
    /** How recently a catalyst must have landed to escalate a stage-4 move. */
    catalystWindowMinutes: number;
    /**
     * Per-sector threshold overrides, keyed by sector id. A narrow sector needs
     * different numbers from a broad one: three of four memory names moving is
     * a stronger statement than three of twenty-eight semis.
     */
    overrides: Record<string, SectorThresholdOverride>;
  };
  stock: {
    /** MOMENTUM_START fires when score crosses this upward. */
    momentumStartScore: number;
    /**
     * The score must fall this far back below the threshold before
     * MOMENTUM_START can arm again. Without a hysteresis band a score sitting
     * near the threshold oscillates across it and re-fires every few seconds.
     */
    momentumStartHysteresis: number;
    /** MOMENTUM_ACCELERATION fires on this much score gain inside the window. */
    momentumAccelDelta: number;
    momentumAccelWindowMinutes: number;
    /** VOLUME_SPIKE fires at this RVOL. */
    volumeSpikeRvol: number;
    /** VWAP_BREAK fires when price crosses VWAP with at least this RVOL. */
    vwapBreakMinRvol: number;
    /** A high counts as "new" for this long. */
    newHighWindowMs: number;
    /** Momentum score at which a stock is reported as AWAKENING. */
    stageAwakeningScore: number;
    /** ...as ACCELERATING. */
    stageAcceleratingScore: number;
    /** ...as BREAKOUT, which also requires a new intraday high. */
    stageBreakoutScore: number;
  };
  session: {
    /** Move thresholds are multiplied by this outside regular hours. */
    extendedHoursMultiplier: number;
    /** Absolute share volume standing in for RVOL outside regular hours. */
    extendedHoursMinVolume: number;
  };
  dedup: {
    /** Minimum gap before the same stage may re-emit. */
    cooldownMs: number;
    /** Score improvement required for a same-stage re-emit. */
    sameStageScoreDelta: number;
    /** Rate limit for intra-stage updates. */
    intraStageUpdateMs: number;
  };
  engine: {
    /** How often the worker recomputes and publishes. */
    tickIntervalMs: number;
    /** Minutes in a regular session — 09:30 to 15:59 inclusive. */
    sessionMinutes: number;
    /** Trading days in the RVOL baseline. */
    rvolBaselineDays: number;
    /** Retained 1m bars per symbol. */
    bars1mRetention: number;
    /** Retained 5m bars per symbol. */
    bars5mRetention: number;
    /** Cap on the Redis signal stream. */
    signalStreamMaxLen: number;
  };
}

export const DEFAULT_CONFIG: MarketPulseConfig = {
  momentum: {
    // Sums to exactly 100, per the spec's weighting table.
    weights: {
      priceAcceleration: 20,
      move5m: 15,
      move15m: 10,
      rvol: 20,
      volumeAcceleration: 10,
      vwapPosition: 10,
      distanceFromHigh: 5,
      newHigh: 5,
      volatility: 5,
    },
    scales: {
      priceAcceleration: 1,
      move5m: 1.5,
      move15m: 3.0,
      rvol: 3.0,
      volumeAcceleration: 2.5,
      vwapStrongDistance: 0.005,
      distanceFromHigh: 0.01,
      newHighWindowSec: 60,
      volatility: 1,
    },
  },
  sector: {
    stage1: {
      minMovingStocks: 3,
      movingStockMovePct: 1.0,
      minLeaderAvgMovePct: 1.5,
      minSectorAvgMovePct: 0,
      minBreadth: 0.5,
      minAvgRvol: 1.5,
      minStrongLeaders: 0,
      strongLeaderMovePct: 3.0,
      minNewHighs: 0,
      catalystPreferred: false,
      severity: 'INFO',
    },
    stage2: {
      minMovingStocks: 3,
      movingStockMovePct: 1.0,
      minLeaderAvgMovePct: 0,
      minSectorAvgMovePct: 1.5,
      minBreadth: 0.5,
      minAvgRvol: 2.0,
      minStrongLeaders: 0,
      strongLeaderMovePct: 3.0,
      minNewHighs: 1,
      catalystPreferred: false,
      severity: 'LOW',
    },
    stage3: {
      minMovingStocks: 3,
      movingStockMovePct: 1.0,
      minLeaderAvgMovePct: 0,
      minSectorAvgMovePct: 2.0,
      minBreadth: 0.5,
      minAvgRvol: 2.5,
      minStrongLeaders: 3,
      strongLeaderMovePct: 3.0,
      minNewHighs: 2,
      catalystPreferred: false,
      severity: 'MEDIUM',
    },
    stage4: {
      minMovingStocks: 3,
      movingStockMovePct: 1.0,
      minLeaderAvgMovePct: 0,
      minSectorAvgMovePct: 3.0,
      minBreadth: 0.5,
      minAvgRvol: 3.0,
      minStrongLeaders: 5,
      strongLeaderMovePct: 3.0,
      minNewHighs: 2,
      catalystPreferred: true,
      severity: 'HIGH',
    },
    idleScore: 30,
    coolingMinutes: 5,
    leaderCount: 5,
    catalystCorrelationScore: 50,
    catalystWindowMinutes: 30,
    overrides: {
      // The dedicated memory scanner from the spec. Only four constituents, so
      // the "how many are moving" counts drop and breadth must be near-total.
      memory: {
        stage1: { minMovingStocks: 2, movingStockMovePct: 1.5, minLeaderAvgMovePct: 1.5, minAvgRvol: 1.5 },
        stage2: { minMovingStocks: 3, movingStockMovePct: 2.0, minSectorAvgMovePct: 2.0, minAvgRvol: 1.5, minNewHighs: 1 },
        stage3: { minMovingStocks: 3, movingStockMovePct: 3.0, minSectorAvgMovePct: 2.5, minStrongLeaders: 3, minAvgRvol: 2.0, minNewHighs: 2 },
        stage4: { minStrongLeaders: 4, minSectorAvgMovePct: 3.0, minAvgRvol: 3.0, minNewHighs: 2 },
      },
    },
  },
  stock: {
    momentumStartScore: 55,
    momentumStartHysteresis: 8,
    momentumAccelDelta: 15,
    momentumAccelWindowMinutes: 5,
    volumeSpikeRvol: 2.5,
    vwapBreakMinRvol: 1.5,
    newHighWindowMs: 60_000,
    stageAwakeningScore: 45,
    stageAcceleratingScore: 60,
    stageBreakoutScore: 75,
  },
  session: {
    extendedHoursMultiplier: 1.5,
    extendedHoursMinVolume: 250_000,
  },
  dedup: {
    cooldownMs: 3 * 60 * 1000,
    sameStageScoreDelta: 5,
    intraStageUpdateMs: 60 * 1000,
  },
  engine: {
    tickIntervalMs: 1000,
    sessionMinutes: 390,
    rvolBaselineDays: 20,
    bars1mRetention: 390,
    bars5mRetention: 78,
    signalStreamMaxLen: 10_000,
  },
};

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function mergeConfig(
  base: MarketPulseConfig,
  override: DeepPartial<MarketPulseConfig>,
): MarketPulseConfig {
  const out: Record<string, unknown> = { ...(base as unknown as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    if (value === undefined) continue;
    const current = out[key];
    out[key] = isPlainObject(value) && isPlainObject(current)
      ? mergeConfig(current as never, value as never)
      : value;
  }
  return out as unknown as MarketPulseConfig;
}

let cached: MarketPulseConfig | null = null;

/** Resolved once per process; MARKETPULSE_CONFIG is deep-merged if present. */
export function getConfig(): MarketPulseConfig {
  if (cached) return cached;
  const raw = process.env.MARKETPULSE_CONFIG;
  if (!raw) {
    cached = DEFAULT_CONFIG;
    return cached;
  }
  try {
    cached = mergeConfig(DEFAULT_CONFIG, JSON.parse(raw));
  } catch {
    // A malformed override must never take the scanner down.
    cached = DEFAULT_CONFIG;
  }
  return cached;
}

/** Test seam. */
export function resetConfigCache(): void {
  cached = null;
}

export const STAGE_ORDER = ['IDLE', 'AWAKENING', 'ACCELERATING', 'BREAKOUT', 'COOLING'] as const;

/** Rank used for escalation checks. COOLING deliberately ranks with IDLE. */
export const STAGE_RANK: Record<string, number> = {
  IDLE: 0,
  COOLING: 0,
  AWAKENING: 1,
  ACCELERATING: 2,
  BREAKOUT: 3,
};
