import { existsSync } from 'node:fs';
import type { RiskLimits } from '../config';
import type { AccountState, ClosedTrade, Position, RiskDecision } from '../types';

export interface RiskContext {
  account: AccountState;
  openPositions: Position[];
  /** Entries taken today, whether or not they are still open. */
  tradesToday: number;
  /** Realised profit and loss for today, in dollars. */
  realizedPnlToday: number;
  /** Closed trades, most recent first, for the day-trade window. */
  recentTrades: ClosedTrade[];
  now: Date;
}

/**
 * The component that says no.
 *
 * Every limit in the brief that can stop a trade lives here, and it is the only
 * thing the executor consults before committing capital. Keeping the refusals
 * in one class means the reason a trade did not happen is always a single
 * string from a single place, which matters more than it sounds: a bot that
 * skips trades for reasons spread across five files is a bot nobody can debug
 * at 9:45 in the morning.
 */
export class RiskManager {
  private killSwitchReason: string | null = null;
  private consecutiveFailures = 0;

  constructor(
    private readonly limits: RiskLimits,
    /**
     * Path whose existence trips the kill switch. A file is deliberately the
     * mechanism: it can be created by a human, a cron job, or a phone over SSH,
     * with no need for the process to be healthy enough to accept a command.
     */
    private readonly killSwitchFile: string | null = null,
  ) {}

  /** Trip the switch. Nothing re-arms it except an explicit clear. */
  trip(reason: string): void {
    if (!this.killSwitchReason) this.killSwitchReason = reason;
  }

  clear(): void {
    this.killSwitchReason = null;
    this.consecutiveFailures = 0;
  }

  /** Called after any broker or data error; trips the switch if they pile up. */
  recordFailure(maxConsecutive: number, detail: string): void {
    this.consecutiveFailures += 1;
    if (this.consecutiveFailures >= maxConsecutive) {
      this.trip(`${this.consecutiveFailures} consecutive failures (${detail})`);
    }
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;
  }

  /**
   * Why trading is halted, or null. Checks the file every call rather than
   * caching, so dropping the file in mid-session takes effect on the next scan.
   */
  haltReason(): string | null {
    if (this.killSwitchReason) return this.killSwitchReason;
    if (this.killSwitchFile && existsSync(this.killSwitchFile)) {
      return `kill switch file present: ${this.killSwitchFile}`;
    }
    return null;
  }

  isHalted(): boolean {
    return this.haltReason() !== null;
  }

  /**
   * Day trades used in the rolling window.
   *
   * A day trade is a buy and a sell of the same symbol on the same session.
   * The window is business days, so a Monday trade still counts against the
   * following Monday — counting calendar days would under-report and walk the
   * account into a broker rejection.
   */
  dayTradesUsed(recentTrades: ClosedTrade[], now: Date): number {
    const cutoff = businessDaysBefore(now, this.limits.dayTradeWindowDays - 1);
    return recentTrades.filter((t) => t.wasDayTrade && new Date(t.exitAt) >= cutoff).length;
  }

  private pdtApplies(equity: number): boolean {
    return equity < this.limits.pdtEquityThreshold;
  }

  /**
   * Decide whether to open a position in `symbol` at `price`, and how large.
   *
   * Returns a decision carrying its own explanation either way, so the caller
   * never has to reconstruct the reasoning for the log.
   */
  evaluateEntry(
    symbol: string,
    price: number,
    stopPercent: number,
    targetRMultiple: number,
    ctx: RiskContext,
  ): RiskDecision {
    const refuse = (reason: string): RiskDecision => ({
      allowed: false,
      reason,
      quantity: 0,
      stopPrice: 0,
      targetPrice: 0,
      riskAmount: 0,
    });

    const halted = this.haltReason();
    if (halted) return refuse(`trading halted: ${halted}`);

    if (price <= 0) return refuse(`no valid price for ${symbol}`);

    if (ctx.openPositions.some((p) => p.symbol === symbol)) {
      return refuse(`already holding ${symbol}`);
    }

    if (ctx.openPositions.length >= this.limits.maxOpenPositions) {
      return refuse(
        `at position limit (${ctx.openPositions.length}/${this.limits.maxOpenPositions} open)`,
      );
    }

    if (ctx.tradesToday >= this.limits.maxTradesPerDay) {
      return refuse(`at daily trade limit (${ctx.tradesToday}/${this.limits.maxTradesPerDay})`);
    }

    const equity = ctx.account.equity;
    const maxDailyLoss = (equity * this.limits.maxDailyLossPercent) / 100;
    if (ctx.realizedPnlToday <= -maxDailyLoss) {
      return refuse(
        `daily loss limit hit: $${ctx.realizedPnlToday.toFixed(2)} ` +
          `against a $${maxDailyLoss.toFixed(2)} allowance`,
      );
    }

    // The day-trade check is deliberately conservative. A position opened today
    // is assumed to be closed today, because this strategy's maximum hold is
    // measured in minutes — so opening one must cost a day trade up front.
    if (this.pdtApplies(equity)) {
      const used = this.dayTradesUsed(ctx.recentTrades, ctx.now);
      if (used >= this.limits.maxDayTradesPerWindow) {
        return refuse(
          `pattern day trader limit: ${used}/${this.limits.maxDayTradesPerWindow} ` +
            `day trades used in the last ${this.limits.dayTradeWindowDays} business days`,
        );
      }
    }

    const stopPrice = round2(price * (1 - stopPercent / 100));
    const riskPerShare = price - stopPrice;
    if (riskPerShare <= 0) return refuse(`stop ${stopPrice} is not below entry ${price}`);

    const riskBudget = (equity * this.limits.riskPercentPerTrade) / 100;
    const byRisk = Math.floor(riskBudget / riskPerShare);

    const positionCap = Math.min(
      (equity * this.limits.maxPositionPercent) / 100,
      this.limits.maxPositionDollars,
      ctx.account.buyingPower,
    );
    const byCapital = Math.floor(positionCap / price);

    const quantity = Math.max(0, Math.min(byRisk, byCapital));

    if (quantity < 1) {
      // On a $100 account this is the common outcome, and saying so plainly is
      // more useful than a silent skip: the constraint is the account, not the
      // signal.
      return refuse(
        `size rounds to zero shares: $${riskBudget.toFixed(2)} risk budget over ` +
          `$${riskPerShare.toFixed(2)}/share risk, capital cap $${positionCap.toFixed(2)} ` +
          `at $${price.toFixed(2)}/share`,
      );
    }

    const riskAmount = round2(riskPerShare * quantity);
    const targetPrice = round2(price + riskPerShare * targetRMultiple);
    const limiting = byRisk <= byCapital ? 'risk budget' : 'capital cap';

    return {
      allowed: true,
      reason:
        `${quantity} share${quantity === 1 ? '' : 's'} at $${price.toFixed(2)} ` +
        `= $${(quantity * price).toFixed(2)}, risking $${riskAmount.toFixed(2)} ` +
        `to the $${stopPrice.toFixed(2)} stop (limited by ${limiting})`,
      quantity,
      stopPrice,
      targetPrice,
      riskAmount,
    };
  }
}

/** Midnight, `days` business days before `from`. Weekends do not count. */
export function businessDaysBefore(from: Date, days: number): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  let remaining = days;
  while (remaining > 0) {
    d.setDate(d.getDate() - 1);
    const day = d.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return d;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
