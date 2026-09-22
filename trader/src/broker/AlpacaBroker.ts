import type { AccountState, Order, OrderRequest, OrderStatus, Position } from '../types';
import { BrokerError, type IBroker } from './IBroker';

export interface AlpacaBrokerOptions {
  keyId: string;
  secretKey: string;
  /** True targets the live money endpoint. Verified against the host below. */
  isLive: boolean;
  /** Market data feed for last-price lookups. */
  feed?: string;
  requestTimeoutMs?: number;
}

/** Alpaca's order lifecycle, mapped to ours. */
function mapStatus(status: string, filled: number, requested: number): OrderStatus {
  switch (status) {
    case 'filled': return 'FILLED';
    case 'partially_filled': return 'PARTIAL';
    case 'canceled':
    case 'expired':
      // A cancellation after a partial fill still leaves stock held, and the
      // engine has to know that rather than seeing a bare CANCELLED.
      return filled > 0 && filled < requested ? 'PARTIAL' : 'CANCELLED';
    case 'rejected':
    case 'suspended': return 'REJECTED';
    case 'new':
    case 'accepted':
    case 'pending_new':
    case 'accepted_for_bidding': return 'SUBMITTED';
    case 'done_for_day': return filled > 0 ? 'PARTIAL' : 'CANCELLED';
    default: return 'PENDING';
  }
}

interface AlpacaOrder {
  id: string;
  client_order_id: string;
  symbol: string;
  side: string;
  qty: string;
  filled_qty: string;
  filled_avg_price: string | null;
  status: string;
  submitted_at: string;
  updated_at: string;
}

/**
 * Alpaca, for execution.
 *
 * Written because cost is the one finding this project established beyond
 * doubt. Commission ran 0.66R per trade against a 2R target on the original
 * settings — the break-even win rate moved from 33% to 55% — and the PEAD
 * literature reports transaction costs consuming 63-100% of the paper profit
 * in exactly the illiquid names these strategies select. Alpaca charges no
 * commission on US equities, which removes the term rather than shrinking it.
 *
 * What it does NOT remove is the spread. Nothing does. A 15-25% bid-ask on a
 * micro-cap is the same cost whoever executes it, and that is the larger half
 * of the problem.
 *
 * Alpaca is REST and synchronous enough to be simple, but an order still is
 * not filled when the call returns — `new` and `accepted` both mean the order
 * is working. waitForFill polls, exactly as the IBKR implementation does, and
 * for the same reason.
 */
export class AlpacaBroker implements IBroker {
  readonly name: string;
  readonly isLive: boolean;

  private readonly base: string;
  private readonly dataBase = 'https://data.alpaca.markets';
  private readonly headers: Record<string, string>;
  private readonly feed: string;
  private readonly timeoutMs: number;
  private connected = false;
  /** clientOrderId -> brokerOrderId, so cancellation does not need a lookup. */
  private readonly brokerIds = new Map<string, string>();

  constructor(options: AlpacaBrokerOptions) {
    this.isLive = options.isLive;
    this.name = options.isLive ? 'Alpaca live' : 'Alpaca paper';
    this.base = options.isLive
      ? 'https://api.alpaca.markets'
      : 'https://paper-api.alpaca.markets';
    this.headers = {
      'APCA-API-KEY-ID': options.keyId,
      'APCA-API-SECRET-KEY': options.secretKey,
      'Content-Type': 'application/json',
    };
    this.feed = options.feed ?? 'iex';
    this.timeoutMs = options.requestTimeoutMs ?? 15_000;
  }

  private async request<T>(path: string, init: RequestInit = {}, base = this.base): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(`${base}${path}`, {
        ...init,
        headers: { ...this.headers, ...(init.headers ?? {}) },
        signal: controller.signal,
      });
      const text = await res.text();
      if (!res.ok) {
        // 429 and 5xx are worth retrying; a 403 on a live account is not.
        const retryable = res.status === 429 || res.status >= 500;
        throw new BrokerError(
          `${res.status} ${res.statusText}: ${text.slice(0, 200)}`,
          String(res.status),
          retryable,
        );
      }
      return (text ? JSON.parse(text) : {}) as T;
    } catch (error) {
      if (error instanceof BrokerError) throw error;
      const detail = error instanceof Error ? error.message : String(error);
      throw new BrokerError(`request to ${path} failed: ${detail}`, 'NETWORK', true);
    } finally {
      clearTimeout(timer);
    }
  }

  async connect(): Promise<void> {
    const account = await this.request<{ status: string; trading_blocked: boolean; account_blocked: boolean }>('/v2/account');
    if (account.status !== 'ACTIVE') {
      throw new BrokerError(`account status is ${account.status}, not ACTIVE`, 'NOT_ACTIVE');
    }
    if (account.trading_blocked || account.account_blocked) {
      throw new BrokerError('account is blocked from trading', 'BLOCKED');
    }
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getAccount(): Promise<AccountState> {
    const a = await this.request<{
      equity: string; cash: string; buying_power: string; daytrade_count: number;
    }>('/v2/account');
    return {
      equity: Number(a.equity),
      cash: Number(a.cash),
      buyingPower: Number(a.buying_power),
      // Alpaca counts day trades itself over the rolling five-day window, so
      // this is the broker's own figure rather than our reconstruction of it.
      dayTradesUsed: Number(a.daytrade_count ?? 0),
    };
  }

  async getPositions(): Promise<Position[]> {
    const raw = await this.request<Array<{
      symbol: string; qty: string; avg_entry_price: string; current_price: string | null;
    }>>('/v2/positions');
    const at = new Date().toISOString();
    return raw.map((p) => {
      const entry = Number(p.avg_entry_price);
      return {
        symbol: p.symbol,
        quantity: Number(p.qty),
        entryPrice: entry,
        entryAt: at,
        entryReasons: ['discovered from the broker at startup'],
        // Stops and targets belong to the engine; a position read back from
        // the broker carries none and the engine fills them in on resume.
        stopPrice: 0,
        initialStopPrice: 0,
        targetPrice: 0,
        highWaterMark: entry,
        stopRaised: false,
        entryOrderId: 'unknown',
        // Alpaca reports average entry net of nothing — commission is zero on
        // US equities, so there is no cost to carry here.
        entryCommission: 0,
        lastKnownPrice: Number(p.current_price ?? entry),
        updatedAt: at,
      };
    });
  }

  private toOrder(o: AlpacaOrder): Order {
    const requested = Number(o.qty);
    const filled = Number(o.filled_qty);
    return {
      clientOrderId: o.client_order_id,
      brokerOrderId: o.id,
      symbol: o.symbol,
      side: o.side === 'buy' ? 'BUY' : 'SELL',
      requestedQuantity: requested,
      filledQuantity: filled,
      averageFillPrice: o.filled_avg_price !== null ? Number(o.filled_avg_price) : null,
      status: mapStatus(o.status, filled, requested),
      submittedAt: o.submitted_at,
      updatedAt: o.updated_at,
      message: null,
    };
  }

  async placeOrder(request: OrderRequest): Promise<Order> {
    if (!this.connected) throw new BrokerError('not connected', 'NOT_CONNECTED', true);
    if (request.quantity <= 0) {
      throw new BrokerError(`quantity must be positive, got ${request.quantity}`, 'BAD_QUANTITY');
    }

    const body: Record<string, unknown> = {
      symbol: request.symbol,
      qty: String(request.quantity),
      side: request.side.toLowerCase(),
      // Day orders only. A GTC order outliving the session would be a position
      // the engine stops managing at the close but the broker keeps working.
      time_in_force: 'day',
      client_order_id: request.clientOrderId,
    };
    if (request.limitPrice !== undefined) {
      body.type = 'limit';
      body.limit_price = String(request.limitPrice);
    } else {
      body.type = 'market';
    }

    try {
      const raw = await this.request<AlpacaOrder>('/v2/orders', {
        method: 'POST', body: JSON.stringify(body),
      });
      this.brokerIds.set(request.clientOrderId, raw.id);
      return this.toOrder(raw);
    } catch (error) {
      // Alpaca rejects a reused client_order_id with 422. Surfacing that as a
      // duplicate rather than a generic failure lets the engine tell "already
      // sent" apart from "never arrived", which decide opposite actions.
      if (error instanceof BrokerError && error.code === '422' && /client_order_id/i.test(error.message)) {
        throw new BrokerError(`duplicate order id ${request.clientOrderId}`, 'DUPLICATE');
      }
      throw error;
    }
  }

  async getOrder(clientOrderId: string): Promise<Order | null> {
    try {
      const raw = await this.request<AlpacaOrder>(
        `/v2/orders:by_client_order_id?client_order_id=${encodeURIComponent(clientOrderId)}`,
      );
      return this.toOrder(raw);
    } catch (error) {
      if (error instanceof BrokerError && error.code === '404') return null;
      throw error;
    }
  }

  /**
   * Poll until the order stops working.
   *
   * On timeout the order is returned as it stands rather than thrown, because
   * "not filled yet" is a fact the caller must act on — usually by cancelling
   * the remainder and keeping whatever did fill.
   */
  async waitForFill(clientOrderId: string, timeoutMs: number): Promise<Order | null> {
    const deadline = Date.now() + timeoutMs;
    let last: Order | null = null;
    while (Date.now() < deadline) {
      last = await this.getOrder(clientOrderId).catch(() => last);
      if (!last) return null;
      if (last.status === 'FILLED' || last.status === 'CANCELLED' || last.status === 'REJECTED') {
        return last;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return last;
  }

  async cancelOrder(clientOrderId: string): Promise<void> {
    const id = this.brokerIds.get(clientOrderId)
      ?? (await this.getOrder(clientOrderId))?.brokerOrderId;
    if (!id) throw new BrokerError(`unknown order ${clientOrderId}`, 'UNKNOWN_ORDER');
    try {
      await this.request(`/v2/orders/${id}`, { method: 'DELETE' });
    } catch (error) {
      // 422 here means it already reached a terminal state — nothing to undo.
      if (error instanceof BrokerError && error.code === '422') return;
      throw error;
    }
  }

  async getLastPrice(symbol: string): Promise<number | null> {
    try {
      const body = await this.request<{ trade?: { p: number } }>(
        `/v2/stocks/${encodeURIComponent(symbol)}/trades/latest?feed=${this.feed}`,
        {}, this.dataBase,
      );
      return body.trade?.p ?? null;
    } catch {
      return null;
    }
  }
}
