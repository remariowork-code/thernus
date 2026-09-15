import type { ExitRules as ExitConfig } from '../config';
import type { ExitReason, Position } from '../types';

export interface ExitDecision {
  shouldExit: boolean;
  reason: ExitReason | null;
  /** Plain-language account of why, for the log and the notification. */
  explanation: string;
  /** A raised stop, when the trade has earned one but is not closing. */
  newStopPrice?: number;
  stopExplanation?: string;
}

export interface ExitContext {
  price: number;
  momentumScore: number;
  now: Date;
  /** Minutes until the regular session closes. */
  minutesToClose: number;
  /** Set when the global halt has tripped and everything must be flattened. */
  killSwitchActive?: boolean;
}

const HOLD = (): ExitDecision => ({ shouldExit: false, reason: null, explanation: '' });

/**
 * Decides whether an open position should be closed, and manages the stop.
 *
 * Order matters here and is not arbitrary. The stop is checked before the
 * target because if a bar straddles both, assuming the good outcome is how a
 * backtest flatters itself. The kill switch is checked before either, because
 * the point of a kill switch is that nothing outranks it.
 *
 * This is a pure function of the position and the current context, which means
 * it can be tested exhaustively and replayed against history without a broker.
 */
export function evaluateExit(
  position: Position,
  ctx: ExitContext,
  config: ExitConfig,
): ExitDecision {
  const { price } = ctx;

  if (ctx.killSwitchActive) {
    return {
      shouldExit: true,
      reason: 'KILL_SWITCH',
      explanation: `closing ${position.symbol}: the kill switch is active`,
    };
  }

  if (price <= 0) return HOLD();

  const risk = position.entryPrice - position.initialStopPrice;
  const gain = price - position.entryPrice;
  const r = risk > 0 ? gain / risk : 0;

  // 1. The stop. Checked first and unconditionally.
  if (price <= position.stopPrice) {
    const moved = position.stopRaised ? ' (stop had been raised)' : '';
    return {
      shouldExit: true,
      reason: position.stopRaised ? 'TRAILING_STOP' : 'STOP_LOSS',
      explanation:
        `closing ${position.symbol} at $${price.toFixed(2)}: it hit the ` +
        `$${position.stopPrice.toFixed(2)} stop${moved}, ${r.toFixed(2)}R`,
    };
  }

  // 2. The target.
  if (position.targetPrice > 0 && price >= position.targetPrice) {
    return {
      shouldExit: true,
      reason: 'PROFIT_TARGET',
      explanation:
        `closing ${position.symbol} at $${price.toFixed(2)}: it reached the ` +
        `$${position.targetPrice.toFixed(2)} target, ${r.toFixed(2)}R`,
    };
  }

  // 3. End of day. This strategy does not hold overnight — a gap against an
  // unattended position can exceed the stop by more than the whole risk budget,
  // because a stop is not a guarantee of price, only of intent.
  if (ctx.minutesToClose <= config.closeAllBeforeCloseMinutes) {
    return {
      shouldExit: true,
      reason: 'END_OF_DAY',
      explanation:
        `closing ${position.symbol} at $${price.toFixed(2)}: ` +
        `${Math.max(0, Math.round(ctx.minutesToClose))} minutes to the bell, ${r.toFixed(2)}R`,
    };
  }

  // 4. Time stop. A thesis that was going to work has usually started working.
  const heldMinutes = (ctx.now.getTime() - new Date(position.entryAt).getTime()) / 60_000;
  if (heldMinutes >= config.maxHoldMinutes) {
    return {
      shouldExit: true,
      reason: 'MAX_HOLD',
      explanation:
        `closing ${position.symbol} at $${price.toFixed(2)}: held ` +
        `${Math.round(heldMinutes)} minutes without reaching the target, ${r.toFixed(2)}R`,
    };
  }

  // 5. The move is over. Exits on a dead signal rather than waiting for the
  // stop, which gives back less of an open gain — but only once the trade has
  // had time to breathe. Before that the stop is the risk control, because the
  // entry condition itself guarantees a high score that cannot last.
  if (heldMinutes >= config.momentumGraceMinutes
    && ctx.momentumScore < config.momentumReversalScore) {
    return {
      shouldExit: true,
      reason: 'MOMENTUM_REVERSAL',
      explanation:
        `closing ${position.symbol} at $${price.toFixed(2)}: momentum fell to ` +
        `${ctx.momentumScore.toFixed(0)}, below ${config.momentumReversalScore}, ${r.toFixed(2)}R`,
    };
  }

  // Not exiting — so consider whether the stop has earned a move up.
  return evaluateStopAdjustment(position, price, r, config);
}

/**
 * Raises the stop as the trade works. Never lowers it.
 *
 * Two stages: at the break-even threshold the stop moves to entry, converting
 * the position into a free option. Past that it trails the high-water mark. The
 * monotonic guarantee is enforced here rather than trusted to callers.
 */
function evaluateStopAdjustment(
  position: Position,
  price: number,
  r: number,
  config: ExitConfig,
): ExitDecision {
  const high = Math.max(position.highWaterMark, price);

  let candidate = position.stopPrice;
  let explanation = '';

  if (r >= config.breakEvenAtR && !position.stopRaised) {
    candidate = position.entryPrice;
    explanation =
      `${position.symbol} is ${r.toFixed(2)}R ahead; moving the stop to break-even at ` +
      `$${position.entryPrice.toFixed(2)}`;
  }

  if (position.stopRaised || r >= config.breakEvenAtR) {
    const trailed = round2(high * (1 - config.trailPercent / 100));
    if (trailed > candidate) {
      candidate = trailed;
      explanation =
        `${position.symbol} made a new high at $${high.toFixed(2)}; trailing the stop up to ` +
        `$${trailed.toFixed(2)}`;
    }
  }

  if (candidate > position.stopPrice) {
    return { ...HOLD(), newStopPrice: candidate, stopExplanation: explanation };
  }

  return HOLD();
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
