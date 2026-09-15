/**
 * Every rule and limit the trader obeys.
 *
 * The design principle in the brief is that any trade must be explainable in
 * plain language — why it entered, what triggered it, how much was committed,
 * where the stop is, what will close it. That only holds if the rules live in
 * one readable place rather than being scattered through the code, so no engine
 * file is permitted to hard-code a number that appears here.
 *
 * TRADER_CONFIG (JSON) is deep-merged over these at startup.
 */

export interface EntryRules {
  /** Minimum share price. Below this, spreads and tick noise dominate. */
  minPrice: number;
  /** Maximum share price. At $100 of capital, a $2,000 share is untradeable. */
  maxPrice: number;
  /** Minimum shares traded today, as a liquidity floor. */
  minDayVolume: number;

  /** Required move from the previous close, percent. */
  minChangePercent: number;
  /** Required volume against the symbol's own normal for this time of day. */
  minRvol: number;
  /** Required momentum score, 0-100, from the scanner's engine. */
  minMomentumScore: number;

  /** Require price above the session VWAP. */
  requireAboveVwap: boolean;
  /** Require the current price to be within this percent of the day's high. */
  maxDistanceFromHighPercent: number;
  /** Require positive movement over the last five minutes. */
  requirePositiveFiveMinute: boolean;
}

export interface ExitRules {
  /** Initial stop, percent below entry. Defines R for the trade. */
  stopLossPercent: number;
  /** Profit target as a multiple of the initial risk. */
  targetRMultiple: number;
  /** Move the stop to break-even once the trade is this many R ahead. */
  breakEvenAtR: number;
  /**
   * Trail this far below the high-water mark, percent. Only engages after
   * break-even, and the stop never moves down.
   */
  trailPercent: number;
  /** Close regardless after this many minutes held. */
  maxHoldMinutes: number;
  /** Close if momentum falls below this score. */
  momentumReversalScore: number;
  /**
   * Minutes to hold before the momentum exit may fire.
   *
   * Entry requires the stock to be near its high with strong one-minute
   * movement, which is by nature a moment rather than a state. Without a grace
   * period the score collapses as soon as the stock pauses — the new-high
   * component ages out and the distance-from-high component widens — so the
   * position is sold into the first ordinary pullback, every time. A backtest
   * over 15 sessions exited 7 of 9 trades this way inside a few minutes,
   * without a single one reaching its stop or its target.
   *
   * The grace period lets the initial stop define the early risk, which is
   * what it was sized to do, and reserves the momentum exit for a move that
   * has genuinely stopped working.
   */
  momentumGraceMinutes: number;
  /** Minutes before the close at which everything is flattened. */
  closeAllBeforeCloseMinutes: number;
}

export interface RiskLimits {
  /** Account equity to treat as tradeable. */
  accountEquity: number;
  /** Percent of equity risked on one trade — the distance to the stop. */
  riskPercentPerTrade: number;
  /** Ceiling on one position as a percent of equity. */
  maxPositionPercent: number;
  /** Absolute cap on one position, whichever binds first. */
  maxPositionDollars: number;
  /** Stop opening new trades once the day is down this percent of equity. */
  maxDailyLossPercent: number;
  /** Cap on entries per session. */
  maxTradesPerDay: number;
  /** Cap on simultaneous open positions. */
  maxOpenPositions: number;
  /**
   * Day trades permitted in a rolling five business days.
   *
   * FINRA's pattern-day-trader rule restricts an account under $25,000 to three.
   * A fourth is refused by the broker, so the engine counts its own and stops
   * first — a limit discovered through a rejection is a limit discovered too late.
   */
  maxDayTradesPerWindow: number;
  dayTradeWindowDays: number;
  /** Below this equity the PDT rule applies at all. */
  pdtEquityThreshold: number;
}

export interface ExecutionRules {
  /** How often the market is evaluated, minutes. */
  scanIntervalMinutes: number;
  /** Earliest entry, minutes after the open. Avoids the opening auction. */
  earliestEntryMinutesAfterOpen: number;
  /** Latest entry, minutes before the close. */
  latestEntryMinutesBeforeClose: number;
  /** Seconds to wait for a fill before treating an order as failed. */
  fillTimeoutSeconds: number;
  /** Refuse a second order for a symbol inside this many seconds. */
  duplicateOrderWindowSeconds: number;
  /** Consecutive broker or data failures before the kill switch trips. */
  maxConsecutiveFailures: number;
}

/**
 * What it costs to trade.
 *
 * These are IBKR's tiered US equity rates. They are modelled explicitly rather
 * than ignored because on a small account they are not a detail: a $0.35
 * minimum on each side of a $20 position is 3.5% round trip, which is larger
 * than the entire profit target. A backtest that omits them reports a strategy
 * that does not exist.
 */
export interface CostModel {
  commissionPerShare: number;
  /** Charged when the per-share rate comes to less. */
  minCommissionPerOrder: number;
  /** Ceiling as a percent of trade value. */
  maxCommissionPercent: number;
}

export interface TraderConfig {
  entry: EntryRules;
  exit: ExitRules;
  risk: RiskLimits;
  execution: ExecutionRules;
  costs: CostModel;
  /**
   * Live order placement. Off by default and separately gated, because the
   * difference between simulation and real money should never be a typo.
   */
  liveTrading: boolean;
}

export const DEFAULT_TRADER_CONFIG: TraderConfig = {
  entry: {
    minPrice: 1,
    // Sized for a small account: a share costing more than this cannot be
    // bought in a quantity that respects the position limits.
    maxPrice: 100,
    minDayVolume: 500_000,
    minChangePercent: 3,
    minRvol: 2,
    minMomentumScore: 60,
    requireAboveVwap: true,
    maxDistanceFromHighPercent: 2,
    requirePositiveFiveMinute: true,
  },
  exit: {
    stopLossPercent: 3,
    targetRMultiple: 2,
    breakEvenAtR: 1,
    trailPercent: 2,
    maxHoldMinutes: 120,
    momentumReversalScore: 35,
    momentumGraceMinutes: 15,
    closeAllBeforeCloseMinutes: 10,
  },
  risk: {
    accountEquity: 100,
    riskPercentPerTrade: 1,
    maxPositionPercent: 20,
    maxPositionDollars: 20,
    maxDailyLossPercent: 5,
    maxTradesPerDay: 3,
    maxOpenPositions: 2,
    maxDayTradesPerWindow: 3,
    dayTradeWindowDays: 5,
    pdtEquityThreshold: 25_000,
  },
  execution: {
    scanIntervalMinutes: 5,
    earliestEntryMinutesAfterOpen: 35,
    latestEntryMinutesBeforeClose: 30,
    fillTimeoutSeconds: 30,
    duplicateOrderWindowSeconds: 300,
    maxConsecutiveFailures: 5,
  },
  costs: {
    commissionPerShare: 0.0035,
    minCommissionPerOrder: 0.35,
    maxCommissionPercent: 1,
  },
  liveTrading: false,
};

/** Commission for one order, under the tiered schedule. */
export function estimateCommission(
  quantity: number, price: number, costs: CostModel,
): number {
  if (quantity <= 0 || price <= 0) return 0;
  const value = quantity * price;
  const perShare = quantity * costs.commissionPerShare;
  const charged = Math.max(perShare, costs.minCommissionPerOrder);
  const ceiling = (value * costs.maxCommissionPercent) / 100;
  return Math.round(Math.min(charged, ceiling) * 100) / 100;
}

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function mergeTraderConfig(
  base: TraderConfig,
  override: DeepPartial<TraderConfig>,
): TraderConfig {
  const out: Record<string, unknown> = { ...(base as unknown as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    if (value === undefined) continue;
    const current = out[key];
    out[key] = isPlainObject(value) && isPlainObject(current)
      ? mergeTraderConfig(current as never, value as never)
      : value;
  }
  return out as unknown as TraderConfig;
}

let cached: TraderConfig | null = null;

export function getTraderConfig(): TraderConfig {
  if (cached) return cached;

  let config = DEFAULT_TRADER_CONFIG;
  const raw = process.env.TRADER_CONFIG;
  if (raw) {
    try {
      config = mergeTraderConfig(DEFAULT_TRADER_CONFIG, JSON.parse(raw));
    } catch {
      // A malformed override must not silently become live-trading defaults.
      config = DEFAULT_TRADER_CONFIG;
    }
  }

  // Live trading needs two independent switches set. One of them is an
  // environment variable that says the word out loud.
  const armed = process.env.TRADER_LIVE === 'I_UNDERSTAND_THIS_TRADES_REAL_MONEY';
  cached = { ...config, liveTrading: config.liveTrading && armed };
  return cached;
}

/** Test seam. */
export function resetTraderConfig(): void {
  cached = null;
}

/** Renders the active rules as prose, for the startup log and the audit trail. */
export function describeConfig(c: TraderConfig): string[] {
  return [
    `Enter when: change >= ${c.entry.minChangePercent}%, RVOL >= ${c.entry.minRvol}x, ` +
      `momentum >= ${c.entry.minMomentumScore}` +
      `${c.entry.requireAboveVwap ? ', price above VWAP' : ''}` +
      `${c.entry.requirePositiveFiveMinute ? ', rising over 5m' : ''}` +
      `, within ${c.entry.maxDistanceFromHighPercent}% of the day high.`,
    `Universe: $${c.entry.minPrice}-$${c.entry.maxPrice}, at least ` +
      `${c.entry.minDayVolume.toLocaleString()} shares traded today.`,
    `Size: risk ${c.risk.riskPercentPerTrade}% of $${c.risk.accountEquity} per trade, ` +
      `position capped at ${c.risk.maxPositionPercent}% or $${c.risk.maxPositionDollars}.`,
    `Exit: stop ${c.exit.stopLossPercent}% below entry, target ${c.exit.targetRMultiple}R, ` +
      `break-even at ${c.exit.breakEvenAtR}R, then trail ${c.exit.trailPercent}%. ` +
      `Force close after ${c.exit.maxHoldMinutes}m or ${c.exit.closeAllBeforeCloseMinutes}m before the bell.`,
    `Limits: ${c.risk.maxTradesPerDay} trades/day, ${c.risk.maxOpenPositions} open at once, ` +
      `stop for the day at -${c.risk.maxDailyLossPercent}%, ` +
      `${c.risk.maxDayTradesPerWindow} day trades per ${c.risk.dayTradeWindowDays} business days.`,
    `Costs: $${c.costs.commissionPerShare}/share, minimum ` +
      `$${c.costs.minCommissionPerOrder}/order, capped at ${c.costs.maxCommissionPercent}% of value.`,
    `Mode: ${c.liveTrading ? 'LIVE — real orders' : 'simulation / paper only'}.`,
  ];
}
