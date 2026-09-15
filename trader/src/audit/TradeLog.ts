import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import type { ClosedTrade, Order, Position } from '../types';

export type LogEventType =
  | 'SESSION_START' | 'SESSION_END' | 'SCAN' | 'CANDIDATE' | 'REJECTED'
  | 'ENTRY' | 'EXIT' | 'STOP_MOVED' | 'ORDER' | 'HALT' | 'ERROR';

export interface LogEvent {
  at: string;
  type: LogEventType;
  symbol?: string;
  /** One sentence a human can read without consulting the code. */
  message: string;
  data?: Record<string, unknown>;
}

/**
 * The append-only record of everything the bot did and why.
 *
 * JSON Lines: one self-contained object per line, appended synchronously. The
 * synchronous write is intentional — if the process dies mid-trade, the reason
 * for the last action must already be on disk, and a buffered writer is exactly
 * what loses it. The volume here is a few hundred lines a day, so the cost is
 * irrelevant next to the guarantee.
 *
 * Closed trades are also written to a second file, because performance review
 * and incident reconstruction are different jobs and mixing them makes both
 * harder.
 */
export class TradeLog {
  constructor(
    private readonly eventPath: string,
    private readonly tradePath: string,
  ) {
    for (const path of [eventPath, tradePath]) {
      const dir = dirname(path);
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    }
  }

  private write(path: string, payload: unknown): void {
    try {
      appendFileSync(path, `${JSON.stringify(payload)}\n`, 'utf8');
    } catch (error) {
      // Logging must not be able to stop trading either. A failure here is
      // reported and swallowed.
      console.error(`[log] could not write to ${path}:`, error);
    }
  }

  record(event: Omit<LogEvent, 'at'> & { at?: string }): void {
    const entry: LogEvent = { at: event.at ?? new Date().toISOString(), ...event };
    this.write(this.eventPath, entry);
    console.log(`[${entry.type}] ${entry.message}`);
  }

  recordEntry(position: Position, order: Order): void {
    this.record({
      type: 'ENTRY',
      symbol: position.symbol,
      message:
        `Bought ${position.quantity} ${position.symbol} at $${position.entryPrice.toFixed(2)} ` +
        `— ${position.entryReasons.join('; ')}. Stop $${position.stopPrice.toFixed(2)}, ` +
        `target $${position.targetPrice.toFixed(2)}.`,
      data: { position, orderId: order.clientOrderId, brokerOrderId: order.brokerOrderId },
    });
  }

  recordExit(trade: ClosedTrade): void {
    const verb = trade.realizedPnl >= 0 ? 'made' : 'lost';
    this.record({
      type: 'EXIT',
      symbol: trade.symbol,
      message:
        `Sold ${trade.quantity} ${trade.symbol} at $${trade.exitPrice.toFixed(2)} ` +
        `(${trade.exitReason}) — ${verb} $${Math.abs(trade.realizedPnl).toFixed(2)}, ` +
        `${trade.rMultiple.toFixed(2)}R.`,
      data: { trade },
    });
    this.write(this.tradePath, trade);
  }

  /**
   * Every closed trade on disk, oldest first.
   *
   * Read at startup so the day-trade window survives a restart. Without this,
   * a crash and restart would reset the PDT count to zero and walk the account
   * straight into a broker violation.
   */
  readTrades(): ClosedTrade[] {
    if (!existsSync(this.tradePath)) return [];
    try {
      return readFileSync(this.tradePath, 'utf8')
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .flatMap((line) => {
          try {
            return [JSON.parse(line) as ClosedTrade];
          } catch {
            // One corrupt line must not discard the rest of the history.
            return [];
          }
        });
    } catch (error) {
      console.error('[log] could not read trade history:', error);
      return [];
    }
  }

  /** Trades closed on the given NY calendar day. */
  tradesOn(day: string): ClosedTrade[] {
    return this.readTrades().filter((t) => nyDate(t.exitAt) === day);
  }

  summarise(trades: ClosedTrade[]): string {
    if (trades.length === 0) return 'No trades.';
    const wins = trades.filter((t) => t.realizedPnl > 0);
    const pnl = trades.reduce((sum, t) => sum + t.realizedPnl, 0);
    const avgR = trades.reduce((sum, t) => sum + t.rMultiple, 0) / trades.length;
    return (
      `${trades.length} trade${trades.length === 1 ? '' : 's'}, ` +
      `${wins.length} winner${wins.length === 1 ? '' : 's'} ` +
      `(${Math.round((wins.length / trades.length) * 100)}%), ` +
      `net ${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toFixed(2)}, ` +
      `average ${avgR >= 0 ? '+' : ''}${avgR.toFixed(2)}R.`
    );
  }
}

export function nyDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
}
