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
  /**
   * Minimum shares traded today so far.
   *
   * Two things make this smaller than instinct suggests. The feed is IEX,
   * which is a few percent of the consolidated tape, so a floor here is
   * really demanding thirty to fifty times as many real shares. And at $100
   * of capital a position is one to twenty shares, so liquidity is never the
   * binding constraint — the floor exists only to stop a handful of prints
   * manufacturing a percentage.
   *
   * Setting it by instinct cost three detections. A 200,000 floor made VEEA
   * unreachable on the day it traded a hundred times its normal volume, and
   * the whole session only came to 54,439 shares on IEX. RVOL is the test
   * that actually distinguishes unusual from ordinary, and it is
   * sample-invariant because its baseline comes from the same feed.
   */
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
  /**
   * Initial stop, percent below entry. Defines R for the trade.
   *
   * This must be sized for the stocks the *entry* rules actually select, not
   * for a typical equity. Entry requires a stock already up 3%+ on 2x volume,
   * which is a violent instrument by construction: replaying 2026-09-15, RETO
   * printed a single five-minute bar ranging $1.62 to $1.90 — 17% — while
   * qualifying. A 3% stop cannot survive that, and the backtest showed exactly
   * that failure: three entries, three stop-outs within minutes, then the
   * daily trade limit was spent and the bot sat out a move from $2.04 to
   * $4.46.
   *
   * Widening it also cuts friction, for a reason worth stating. At 3% the
   * $20 capital cap binds, giving a large position with a small R, so
   * commission is 0.66R. At 12% the risk budget binds instead, giving a
   * smaller position with a larger R, and commission falls to 0.17R.
   *
   * 12% is the setting the evidence supports, on two independent samples.
   * It is not a tuned optimum — the samples are 9 and 10 trades, which is far
   * too small to optimise against, and the value was chosen because the
   * mechanism is understood rather than because it scored best.
   */
  stopLossPercent: number;
  /**
   * Profit target as a multiple of the initial risk, or null for none.
   *
   * null means the trade is closed by the trailing stop, the clock or dying
   * momentum, never by reaching a fixed level. A fixed target caps the upside
   * at exactly the moment a position is working, which is the wrong trade on
   * instruments whose whole appeal is the occasional outlier.
   */
  targetRMultiple: number | null;
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
  /** Which named profile produced these rules. */
  profile: ProfileName;
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
    stopLossPercent: 12,
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
  profile: 'standard',
  liveTrading: false,
};

/**
 * Alpaca charges nothing on US equities. Kept as a named constant rather than
 * three zeroes inline, because the difference between this and the IBKR
 * schedule is the single largest measured effect in the project: commission
 * ran 0.66R per trade on the original settings and moved the break-even win
 * rate from 33% to 55%.
 *
 * It does not touch the spread, which is the larger half of the cost and is
 * identical whoever executes the order.
 */
export const ZERO_COMMISSION: CostModel = {
  commissionPerShare: 0,
  minCommissionPerOrder: 0,
  maxCommissionPercent: 0,
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

export type ProfileName = 'standard' | 'penny';

/**
 * Named rule sets for different kinds of instrument.
 *
 * The same rules cannot serve both. A sub-$5 stock running several hundred
 * percent prints five-minute bars with a 17% range, so it needs a stop wide
 * enough to survive one and a break-even rule that does not choke the position
 * the moment it works. A $40 stock up 4% on an earnings beat does not move like
 * that, and applying penny settings to it would mean risking 12% to make 8%.
 *
 * Choosing a profile is choosing what the bot hunts. It is not a tuning knob.
 */
export const PROFILES: Record<ProfileName, DeepPartial<TraderConfig>> = {
  /**
   * Mature movers: liquid, mid-priced names making an ordinary intraday move.
   * Tighter everything, and a fixed target, because the tail is thinner — a
   * $40 stock rarely triples, so waiting for a runner mostly means giving back
   * gains that were there.
   */
  standard: {
    profile: 'standard',
    entry: {
      minPrice: 5,
      maxPrice: 100,
      minDayVolume: 100_000,
      minChangePercent: 3,
      minRvol: 2,
      minMomentumScore: 60,
      maxDistanceFromHighPercent: 2,
    },
    exit: {
      stopLossPercent: 8,
      targetRMultiple: 3,
      breakEvenAtR: 2,
      trailPercent: 3,
      maxHoldMinutes: 120,
      momentumGraceMinutes: 15,
    },
    execution: { scanIntervalMinutes: 5 },
  },

  /**
   * Explosive low-priced movers — the RETO case.
   *
   * Every setting here is a consequence of one fact: these instruments are
   * enormously more volatile than the rules were originally written for.
   *
   *  - The stop is wide because a single five-minute bar can range 17%.
   *  - Break-even is deferred to 5R because moving the stop to entry at 1R
   *    turns a 12% stop into a 0% stop. On 2026-09-15 that one rule was the
   *    difference between exiting RETO at $1.95 and riding it to $4.36.
   *  - There is no fixed target, because the entire edge is the rare trade
   *    that goes several hundred percent, and a 2R target throws it away.
   *  - Entry demands a much larger move and far higher relative volume: at
   *    this price point a 3% move on 2x volume is noise.
   *  - The scan runs more often because the move develops in minutes.
   *  - One trade per day, because FINRA allows three day trades per five
   *    business days and spending the week's allowance on one name's
   *    re-entries is how the next four sessions get missed.
   */
  penny: {
    profile: 'penny',
    entry: {
      minPrice: 0.5,
      maxPrice: 10,
      // Cumulative volume so far today, NOT the day's eventual total, and
      // measured on a feed that sees a few percent of the tape. A floor near
      // the whole session's volume means a stock only qualifies in the last
      // hour — RETO trades 1.2M all day, so a 1M floor pushed entry from
      // 11:24 to mid-afternoon — and 200,000 put VEEA out of reach entirely
      // on a day it traded a hundred times normal. RVOL carries the real
      // test and is time-of-day normalised.
      minDayVolume: 20_000,
      minChangePercent: 15,
      minRvol: 5,
      minMomentumScore: 65,
      maxDistanceFromHighPercent: 3,
    },
    exit: {
      stopLossPercent: 12,
      targetRMultiple: null,
      breakEvenAtR: 5,
      trailPercent: 2,
      maxHoldMinutes: 360,
      momentumGraceMinutes: 20,
    },
    risk: { maxTradesPerDay: 1, maxOpenPositions: 1 },
    execution: { scanIntervalMinutes: 3 },
  },
};

export function isProfileName(value: string): value is ProfileName {
  return value === 'standard' || value === 'penny';
}

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

/**
 * The active rules: defaults, then the profile, then TRADER_CONFIG, then the
 * live-trading gate. Later layers win, so an explicit override always beats a
 * profile and the gate always beats both.
 */
export function getTraderConfig(profileName?: ProfileName): TraderConfig {
  if (cached) return cached;

  const resolved: ProfileName = profileName
    ?? (process.env.TRADER_PROFILE && isProfileName(process.env.TRADER_PROFILE)
      ? process.env.TRADER_PROFILE
      : 'standard');

  let config = mergeTraderConfig(DEFAULT_TRADER_CONFIG, PROFILES[resolved]);
  const base = config;
  const raw = process.env.TRADER_CONFIG;
  if (raw) {
    try {
      config = mergeTraderConfig(base, JSON.parse(raw));
    } catch {
      // A malformed override must not silently become live-trading defaults.
      config = base;
    }
  }

  // Live trading needs two independent switches set. One of them is an
  // environment variable that says the word out loud.
  // Alpaca modes pay no commission, and the cost model has to say so or every
  // simulation against them reports losses the account would never see.
  const mode = process.argv[2] ?? process.env.TRADER_MODE;
  if (mode === 'alpaca' || mode === 'alpaca-live' || process.env.TRADER_ZERO_COMMISSION === '1') {
    config = { ...config, costs: ZERO_COMMISSION };
  }

  const armed = process.env.TRADER_LIVE === 'I_UNDERSTAND_THIS_TRADES_REAL_MONEY';
  cached = { ...config, profile: resolved, liveTrading: config.liveTrading && armed };
  return cached;
}

/** Test seam. */
export function resetTraderConfig(): void {
  cached = null;
}

/** Renders the active rules as prose, for the startup log and the audit trail. */
export function describeConfig(c: TraderConfig): string[] {
  return [
    `Profile: ${c.profile}.`,
    `Enter when: change >= ${c.entry.minChangePercent}%, RVOL >= ${c.entry.minRvol}x, ` +
      `momentum >= ${c.entry.minMomentumScore}` +
      `${c.entry.requireAboveVwap ? ', price above VWAP' : ''}` +
      `${c.entry.requirePositiveFiveMinute ? ', rising over 5m' : ''}` +
      `, within ${c.entry.maxDistanceFromHighPercent}% of the day high.`,
    `Universe: $${c.entry.minPrice}-$${c.entry.maxPrice}, at least ` +
      `${c.entry.minDayVolume.toLocaleString()} shares traded today.`,
    `Size: risk ${c.risk.riskPercentPerTrade}% of $${c.risk.accountEquity} per trade, ` +
      `position capped at ${c.risk.maxPositionPercent}% or $${c.risk.maxPositionDollars}.`,
    `Exit: stop ${c.exit.stopLossPercent}% below entry, ` +
      `${c.exit.targetRMultiple === null
        ? 'no fixed target (trail only)'
        : `target ${c.exit.targetRMultiple}R`}, ` +
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
