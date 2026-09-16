import type { StockMetrics } from '../../../shared/types';
import { getCurrentSession, isHalfDay, nyParts } from '../../../shared/market/session';
import type { IBroker } from '../broker/IBroker';
import { estimateCommission, type TraderConfig } from '../config';
import type { TradeLog } from '../audit/TradeLog';
import { nyDate } from '../audit/TradeLog';
import type { Notifier } from '../notify/Notifier';
import type { ClosedTrade, ExitReason, Order, Position } from '../types';
import { evaluateEntry, rankCandidates } from './EntryRules';
import { evaluateExit } from './ExitRules';
import { RiskManager } from './RiskManager';

/** Where the engine gets its view of the market. */
export interface MarketDataSource {
  /** Symbols worth considering right now, with metrics already computed. */
  getCandidates(): Promise<StockMetrics[]>;
  /** Current metrics for a held symbol, for exit decisions. */
  getMetrics(symbol: string): Promise<StockMetrics | null>;
}

export interface EngineDeps {
  broker: IBroker;
  data: MarketDataSource;
  risk: RiskManager;
  log: TradeLog;
  notify: Notifier;
  config: TraderConfig;
  now?: () => Date;
}

export interface CycleResult {
  at: string;
  scanned: number;
  entered: string[];
  exited: string[];
  skipped: string | null;
}

const REGULAR_OPEN_MINUTES = 9 * 60 + 30;

/**
 * One pass of the trading loop.
 *
 * The order of operations is the safety property worth stating plainly: open
 * positions are always managed before new ones are considered. An engine that
 * hunts for entries first can spend its cycle budget, hit an error, and leave a
 * losing position past its stop — so exits come first, unconditionally, and a
 * failure to find candidates cannot prevent a position from being closed.
 */
export class TradingEngine {
  private readonly positions = new Map<string, Position>();
  private readonly lastOrderAt = new Map<string, number>();
  private tradesToday = 0;
  private realizedPnlToday = 0;
  private currentDay: string;
  private orderSequence = 0;

  constructor(private readonly deps: EngineDeps) {
    this.currentDay = nyDate(this.now().toISOString());
  }

  private now(): Date {
    return this.deps.now?.() ?? new Date();
  }

  /** Restores state a restart would otherwise lose. */
  async resume(): Promise<void> {
    const { broker, log } = this.deps;
    const held = await broker.getPositions();
    for (const position of held) {
      this.positions.set(position.symbol, position);
    }
    const today = this.tradesOnDay();
    this.tradesToday = today.length;
    this.realizedPnlToday = today.reduce((sum, t) => sum + t.realizedPnl, 0);

    if (held.length > 0 || today.length > 0) {
      log.record({
        type: 'SESSION_START',
        message:
          `Resumed with ${held.length} open position${held.length === 1 ? '' : 's'} and ` +
          `${today.length} trade${today.length === 1 ? '' : 's'} already taken today ` +
          `(realised ${this.realizedPnlToday >= 0 ? '+' : '-'}$${Math.abs(this.realizedPnlToday).toFixed(2)}).`,
      });
    }
  }

  private tradesOnDay(): ClosedTrade[] {
    return this.deps.log.tradesOn(this.currentDay);
  }

  /** Zeroes the per-day counters when the date rolls over. */
  private rollDayIfNeeded(at: Date): void {
    const day = nyDate(at.toISOString());
    if (day === this.currentDay) return;
    this.currentDay = day;
    this.tradesToday = 0;
    this.realizedPnlToday = 0;
    this.deps.log.record({ type: 'SESSION_START', message: `New trading day: ${day}.` });
  }

  async runCycle(): Promise<CycleResult> {
    const at = this.now();
    this.rollDayIfNeeded(at);

    const result: CycleResult = {
      at: at.toISOString(),
      scanned: 0,
      entered: [],
      exited: [],
      skipped: null,
    };

    const session = getCurrentSession(at);
    if (session !== 'REGULAR') {
      result.skipped = `market is ${session.toLowerCase().replace('_', ' ')}`;
      return result;
    }

    // Exits first, always.
    result.exited = await this.manageOpenPositions(at);

    const halt = this.deps.risk.haltReason();
    if (halt) {
      result.skipped = `halted: ${halt}`;
      return result;
    }

    const window = this.entryWindow(at);
    if (!window.open) {
      result.skipped = window.reason;
      return result;
    }

    const entered = await this.findEntries(at);
    result.entered = entered.entered;
    result.scanned = entered.scanned;
    return result;
  }

  private entryWindow(at: Date): { open: boolean; reason: string } {
    const { execution } = this.deps.config;
    const { minutesOfDay } = nyParts(at);
    const closeMinutes = isHalfDay(at) ? 13 * 60 : 16 * 60;
    const sinceOpen = minutesOfDay - REGULAR_OPEN_MINUTES;
    const toClose = closeMinutes - minutesOfDay;

    if (sinceOpen < execution.earliestEntryMinutesAfterOpen) {
      // The first half hour is the widest spreads and the least reliable
      // volume comparison of the day. Waiting costs a few entries and avoids
      // paying for the privilege of being early.
      return {
        open: false,
        reason:
          `waiting for the open to settle (${Math.max(0, Math.round(sinceOpen))} of ` +
          `${execution.earliestEntryMinutesAfterOpen} minutes)`,
      };
    }
    if (toClose < execution.latestEntryMinutesBeforeClose) {
      return {
        open: false,
        reason: `too close to the bell (${Math.round(toClose)} minutes left)`,
      };
    }
    return { open: true, reason: '' };
  }

  private minutesToClose(at: Date): number {
    const closeMinutes = isHalfDay(at) ? 13 * 60 : 16 * 60;
    const { minutesOfDay } = nyParts(at);
    return closeMinutes - minutesOfDay;
  }

  private async manageOpenPositions(at: Date): Promise<string[]> {
    const { data, config, log, risk } = this.deps;
    const exited: string[] = [];
    const killSwitchActive = risk.isHalted();

    for (const position of [...this.positions.values()]) {
      let metrics: StockMetrics | null = null;
      try {
        metrics = await data.getMetrics(position.symbol);
      } catch (error) {
        log.record({
          type: 'ERROR',
          symbol: position.symbol,
          message: `Could not refresh ${position.symbol}: ${describe(error)}`,
        });
      }

      // A position whose price cannot be read is still a position. Falling back
      // to the last known price keeps the time and kill-switch exits working
      // rather than leaving it unmanaged until the feed recovers.
      const price = metrics?.price ?? position.lastKnownPrice;
      const momentum = metrics?.momentumScore ?? 100;

      const decision = evaluateExit(
        position,
        { price, momentumScore: momentum, now: at, minutesToClose: this.minutesToClose(at), killSwitchActive },
        config.exit,
      );

      if (decision.shouldExit && decision.reason) {
        const closed = await this.closePosition(position, price, decision.reason, decision.explanation, at);
        if (closed) exited.push(position.symbol);
        continue;
      }

      position.lastKnownPrice = price;
      position.highWaterMark = Math.max(position.highWaterMark, price);
      position.updatedAt = at.toISOString();

      if (decision.newStopPrice !== undefined) {
        position.stopPrice = decision.newStopPrice;
        position.stopRaised = true;
        log.record({
          type: 'STOP_MOVED',
          symbol: position.symbol,
          message: decision.stopExplanation ?? `Stop moved to $${decision.newStopPrice.toFixed(2)}.`,
          data: { stopPrice: decision.newStopPrice },
        });
        this.deps.notify.send(decision.stopExplanation ?? '');
      }
    }

    return exited;
  }

  private async closePosition(
    position: Position,
    price: number,
    reason: ExitReason,
    explanation: string,
    at: Date,
  ): Promise<boolean> {
    const { broker, log, notify, risk, config } = this.deps;

    let order: Order;
    try {
      order = await broker.placeOrder({
        symbol: position.symbol,
        side: 'SELL',
        quantity: position.quantity,
        clientOrderId: this.nextOrderId('x', position.symbol),
      });
      risk.recordSuccess();
    } catch (error) {
      // A failed exit is the most dangerous state this system can be in, so it
      // counts towards the kill switch rather than being retried silently.
      risk.recordFailure(config.execution.maxConsecutiveFailures, `exit ${position.symbol}`);
      log.record({
        type: 'ERROR',
        symbol: position.symbol,
        message: `EXIT FAILED for ${position.symbol}: ${describe(error)}. Position still open.`,
      });
      notify.send(`⚠️ Could not exit ${position.symbol}: ${describe(error)}`);
      return false;
    }

    if (order.status !== 'FILLED' || order.averageFillPrice === null) {
      log.record({
        type: 'ERROR',
        symbol: position.symbol,
        message:
          `Exit order for ${position.symbol} came back ${order.status}` +
          `${order.message ? `: ${order.message}` : ''}. Position still open.`,
        data: { order },
      });
      notify.send(`⚠️ Exit order for ${position.symbol} was ${order.status}`);
      return false;
    }

    const exitPrice = order.averageFillPrice;
    // Commission on both sides. On a small account this is not a rounding
    // error — a $0.35 minimum each way against a $20 position is 3.5% round
    // trip, which is larger than the profit target — so realised P&L is
    // reported net of it rather than as a gross price difference that the
    // account will never actually show.
    const exitCommission = estimateCommission(order.filledQuantity, exitPrice, config.costs);
    const commission = round2(position.entryCommission + exitCommission);
    const gross = (exitPrice - position.entryPrice) * order.filledQuantity;
    const realizedPnl = round2(gross - commission);
    const risked = position.entryPrice - position.initialStopPrice;
    const rMultiple = risked > 0 ? (exitPrice - position.entryPrice) / risked : 0;

    const trade: ClosedTrade = {
      symbol: position.symbol,
      quantity: order.filledQuantity,
      entryPrice: position.entryPrice,
      entryAt: position.entryAt,
      entryReasons: position.entryReasons,
      stopPrice: position.stopPrice,
      initialStopPrice: position.initialStopPrice,
      targetPrice: position.targetPrice,
      highWaterMark: position.highWaterMark,
      stopRaised: position.stopRaised,
      entryOrderId: position.entryOrderId,
      entryCommission: position.entryCommission,
      exitPrice,
      exitAt: at.toISOString(),
      exitReason: reason,
      exitOrderId: order.clientOrderId,
      realizedPnl,
      commission,
      rMultiple: round2(rMultiple),
      // Same NY calendar day in and out is what makes it a day trade, which is
      // the only definition the PDT rule cares about.
      wasDayTrade: nyDate(position.entryAt) === nyDate(at.toISOString()),
    };

    this.positions.delete(position.symbol);
    this.realizedPnlToday = round2(this.realizedPnlToday + realizedPnl);
    log.recordExit(trade);
    notify.send(`${realizedPnl >= 0 ? '✅' : '🔻'} ${explanation}`);
    return true;
  }

  private async findEntries(at: Date): Promise<{ entered: string[]; scanned: number }> {
    const { data, config, log, risk, broker, notify } = this.deps;

    let candidates: StockMetrics[];
    try {
      candidates = await data.getCandidates();
      risk.recordSuccess();
    } catch (error) {
      risk.recordFailure(config.execution.maxConsecutiveFailures, 'scan');
      log.record({ type: 'ERROR', message: `Scan failed: ${describe(error)}` });
      return { entered: [], scanned: 0 };
    }

    const evaluations = candidates.map((m) => evaluateEntry(m, config.entry));
    const ranked = rankCandidates(evaluations);
    const entered: string[] = [];

    log.record({
      type: 'SCAN',
      message: `Scanned ${candidates.length} symbols; ${ranked.length} met every entry condition.`,
      data: { passed: ranked.map((r) => r.symbol) },
    });

    for (const candidate of ranked) {
      const metrics = candidates.find((m) => m.symbol === candidate.symbol);
      if (!metrics) continue;

      if (this.isDuplicate(candidate.symbol, at)) {
        log.record({
          type: 'REJECTED',
          symbol: candidate.symbol,
          message: `Skipping ${candidate.symbol}: an order was already placed for it recently.`,
        });
        continue;
      }

      let account;
      try {
        account = await broker.getAccount();
        risk.recordSuccess();
      } catch (error) {
        risk.recordFailure(config.execution.maxConsecutiveFailures, 'account');
        log.record({ type: 'ERROR', message: `Could not read the account: ${describe(error)}` });
        break;
      }

      const decision = risk.evaluateEntry(
        candidate.symbol,
        metrics.price,
        config.exit.stopLossPercent,
        config.exit.targetRMultiple,
        {
          account,
          openPositions: [...this.positions.values()],
          tradesToday: this.tradesToday,
          realizedPnlToday: this.realizedPnlToday,
          recentTrades: this.deps.log.readTrades(),
          now: at,
        },
      );

      if (!decision.allowed) {
        log.record({
          type: 'REJECTED',
          symbol: candidate.symbol,
          message: `Not taking ${candidate.symbol}: ${decision.reason}`,
          data: { evidence: candidate.evidence },
        });
        // A refusal that applies to the whole account applies to every
        // remaining candidate too, so there is no point continuing the list.
        if (isAccountWideRefusal(decision.reason)) break;
        continue;
      }

      const position = await this.openPosition(candidate.symbol, metrics, decision, at);
      if (position) {
        entered.push(candidate.symbol);
        notify.send(
          `🟢 Bought ${position.quantity} ${position.symbol} at ` +
            `$${position.entryPrice.toFixed(2)} — ${candidate.reasons[2] ?? 'entry conditions met'}. ` +
            `Stop $${position.stopPrice.toFixed(2)}, target $${position.targetPrice.toFixed(2)}.`,
        );
      }
    }

    return { entered, scanned: candidates.length };
  }

  private isDuplicate(symbol: string, at: Date): boolean {
    const last = this.lastOrderAt.get(symbol);
    if (last === undefined) return false;
    const windowMs = this.deps.config.execution.duplicateOrderWindowSeconds * 1_000;
    return at.getTime() - last < windowMs;
  }

  private async openPosition(
    symbol: string,
    metrics: StockMetrics,
    decision: { quantity: number; stopPrice: number; targetPrice: number; reason: string },
    at: Date,
  ): Promise<Position | null> {
    const { broker, log, risk, config } = this.deps;
    const evaluation = evaluateEntry(metrics, config.entry);

    // Recorded before the order goes out, so a crash between submission and
    // acknowledgement still leaves evidence that an order was attempted.
    this.lastOrderAt.set(symbol, at.getTime());

    let order: Order;
    try {
      order = await broker.placeOrder({
        symbol,
        side: 'BUY',
        quantity: decision.quantity,
        clientOrderId: this.nextOrderId('e', symbol),
      });
      risk.recordSuccess();
    } catch (error) {
      risk.recordFailure(config.execution.maxConsecutiveFailures, `entry ${symbol}`);
      log.record({ type: 'ERROR', symbol, message: `Entry order failed: ${describe(error)}` });
      return null;
    }

    if (order.status !== 'FILLED' || order.averageFillPrice === null) {
      log.record({
        type: 'ORDER',
        symbol,
        message:
          `Entry order for ${symbol} came back ${order.status}` +
          `${order.message ? `: ${order.message}` : ''}. No position opened.`,
        data: { order },
      });
      // Nothing was bought, so nothing is left dangling — but a resting order
      // would be, and it must not be.
      if (order.status === 'SUBMITTED' || order.status === 'PARTIAL') {
        await broker.cancelOrder(order.clientOrderId).catch(() => {});
      }
      return null;
    }

    const fill = order.averageFillPrice;
    // The stop is recomputed from the actual fill, not the price that triggered
    // the signal. Anchoring risk to a price we did not pay understates it.
    const stopPrice = round2(fill * (1 - config.exit.stopLossPercent / 100));
    const targetPrice = config.exit.targetRMultiple === null
      ? 0
      : round2(fill + (fill - stopPrice) * config.exit.targetRMultiple);

    const position: Position = {
      symbol,
      quantity: order.filledQuantity,
      entryPrice: fill,
      entryAt: at.toISOString(),
      entryReasons: evaluation.reasons,
      stopPrice,
      initialStopPrice: stopPrice,
      targetPrice,
      highWaterMark: fill,
      stopRaised: false,
      entryOrderId: order.clientOrderId,
      entryCommission: estimateCommission(order.filledQuantity, fill, config.costs),
      lastKnownPrice: fill,
      updatedAt: at.toISOString(),
    };

    this.positions.set(symbol, position);
    this.tradesToday += 1;
    log.recordEntry(position, order);
    return position;
  }

  private nextOrderId(prefix: string, symbol: string): string {
    this.orderSequence += 1;
    return `${prefix}-${symbol}-${this.now().getTime()}-${this.orderSequence}`;
  }

  /** Flattens everything. Used at shutdown and when the kill switch trips. */
  async closeAll(why: string): Promise<string[]> {
    const at = this.now();
    const closed: string[] = [];
    for (const position of [...this.positions.values()]) {
      const price = (await this.deps.broker.getLastPrice(position.symbol).catch(() => null))
        ?? position.lastKnownPrice;
      const ok = await this.closePosition(
        position, price, 'KILL_SWITCH', `closing ${position.symbol}: ${why}`, at,
      );
      if (ok) closed.push(position.symbol);
    }
    return closed;
  }

  openPositionCount(): number {
    return this.positions.size;
  }

  snapshot(): { positions: Position[]; tradesToday: number; realizedPnlToday: number } {
    return {
      positions: [...this.positions.values()],
      tradesToday: this.tradesToday,
      realizedPnlToday: this.realizedPnlToday,
    };
  }
}

/** Refusals about the account as a whole, rather than one symbol. */
function isAccountWideRefusal(reason: string): boolean {
  return (
    reason.includes('halted') ||
    reason.includes('position limit') ||
    reason.includes('daily trade limit') ||
    reason.includes('daily loss limit') ||
    reason.includes('pattern day trader')
  );
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
