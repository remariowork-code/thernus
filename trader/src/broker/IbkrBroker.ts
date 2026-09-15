import {
  EventName, IBApi, LimitOrder, MarketOrder, OrderAction, Stock,
} from '@stoqey/ib';
import type { AccountState, Order, OrderRequest, OrderStatus, Position } from '../types';
import { BrokerError, type IBroker } from './IBroker';

export interface IbkrOptions {
  host: string;
  /** 7497 paper TWS, 7496 live TWS, 4002 paper Gateway, 4001 live Gateway. */
  port: number;
  clientId: number;
  /** Asserted by the caller and verified against the port on connect. */
  isLive: boolean;
  /**
   * Price source. Supplied externally on purpose: IBKR's market data needs a
   * paid subscription and caps concurrent requests, while the scanner already
   * has a working free feed. Execution and data stay separate.
   */
  priceFeed: (symbol: string) => Promise<number | null>;
  connectTimeoutMs?: number;
}

/** IBKR order states that mean the order is done and will not fill further. */
const TERMINAL = new Set(['Filled', 'Cancelled', 'ApiCancelled', 'Inactive']);

function mapStatus(ibStatus: string): OrderStatus {
  switch (ibStatus) {
    case 'Filled': return 'FILLED';
    case 'Cancelled':
    case 'ApiCancelled': return 'CANCELLED';
    case 'Inactive': return 'REJECTED';
    case 'PendingSubmit':
    case 'ApiPending':
    case 'PreSubmitted': return 'PENDING';
    case 'Submitted':
    case 'PendingCancel': return 'SUBMITTED';
    default: return 'PENDING';
  }
}

/**
 * Interactive Brokers, via TWS or IB Gateway.
 *
 * IBKR's API is asynchronous and identifier-based rather than
 * request/response: an order is submitted with a numeric id and its progress
 * arrives later as a stream of `orderStatus` events. This class exists to turn
 * that into the promise-shaped interface the engine expects, and it keeps its
 * own record of every order so that a status arriving after the caller has
 * moved on is still recorded rather than lost.
 *
 * Two safety properties are enforced here rather than left to configuration.
 * The port is checked against the caller's live/paper assertion, because
 * connecting to 7496 believing it is paper is an error that only announces
 * itself by spending money. And every order is submitted with a numeric id
 * this class allocates from IBKR's own sequence, mapped to the engine's string
 * ids, so a reconnection cannot cause two orders to collide on one identifier.
 */
export class IbkrBroker implements IBroker {
  readonly name: string;
  readonly isLive: boolean;

  private api: IBApi | null = null;
  private connected = false;
  private nextOrderId: number | null = null;
  private readonly byClientId = new Map<string, Order>();
  private readonly byBrokerId = new Map<number, Order>();
  private positions: Position[] = [];
  private account: AccountState = { equity: 0, cash: 0, buyingPower: 0, dayTradesUsed: 0 };

  constructor(private readonly options: IbkrOptions) {
    this.isLive = options.isLive;
    this.name = options.isLive ? 'IBKR live' : 'IBKR paper';

    // The live ports are 7496 (TWS) and 4001 (Gateway). Anything else is a
    // paper port, and the two must agree.
    const portIsLive = options.port === 7496 || options.port === 4001;
    if (portIsLive !== options.isLive) {
      throw new BrokerError(
        `port ${options.port} is ${portIsLive ? 'a live' : 'a paper'} port but the broker was ` +
          `configured as ${options.isLive ? 'live' : 'paper'}. Refusing to connect.`,
        'PORT_MISMATCH',
      );
    }
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    const api = new IBApi({
      host: this.options.host,
      port: this.options.port,
      clientId: this.options.clientId,
    });
    this.api = api;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new BrokerError(
          `timed out connecting to ${this.options.host}:${this.options.port}. ` +
            'Is TWS or IB Gateway running with the API enabled?',
          'CONNECT_TIMEOUT', true,
        ));
      }, this.options.connectTimeoutMs ?? 15_000);

      // nextValidId is IBKR's handshake completion: it arrives once, with the
      // first order id this client may use.
      api.once(EventName.nextValidId, (orderId: number) => {
        clearTimeout(timeout);
        this.nextOrderId = orderId;
        this.connected = true;
        resolve();
      });

      api.on(EventName.error, (error: Error, code: number, reqId: number) => {
        // Codes below 2000 that arrive before the handshake are fatal; the
        // 2100-range messages are informational market-data notices.
        if (!this.connected && code < 2000) {
          clearTimeout(timeout);
          reject(new BrokerError(`${error.message} (code ${code})`, String(code)));
          return;
        }
        this.onError(error, code, reqId);
      });

      this.attachHandlers(api);
      api.connect();
    });

    this.subscribe();
  }

  private attachHandlers(api: IBApi): void {
    api.on(
      EventName.orderStatus,
      (
        orderId: number, status: string, filled: number, _remaining: number,
        avgFillPrice: number,
      ) => {
        const order = this.byBrokerId.get(orderId);
        if (!order) return;
        order.status = mapStatus(status);
        order.filledQuantity = filled;
        if (filled > 0 && avgFillPrice > 0) order.averageFillPrice = avgFillPrice;
        order.updatedAt = new Date().toISOString();
      },
    );

    // avgCost is optional in IBKR's own contract, so a position can arrive with
    // no cost basis at all. Treating a missing one as zero would report a
    // position as infinitely profitable, so it is skipped instead.
    api.on(EventName.position, (_account: string, contract: { symbol?: string }, pos: number, avgCost?: number) => {
      if (!contract.symbol || pos === 0 || !avgCost || avgCost <= 0) return;
      const at = new Date().toISOString();
      const existing = this.positions.find((p) => p.symbol === contract.symbol);
      if (existing) {
        existing.quantity = pos;
        existing.entryPrice = avgCost;
        existing.updatedAt = at;
        return;
      }
      // The engine owns stops and targets; a position discovered from the
      // broker carries none, and the engine fills them in.
      this.positions.push({
        symbol: contract.symbol, quantity: pos, entryPrice: avgCost, entryAt: at,
        entryReasons: ['discovered from the broker at startup'],
        stopPrice: 0, initialStopPrice: 0, targetPrice: 0, highWaterMark: avgCost,
        stopRaised: false, entryOrderId: 'unknown',
        // IBKR's avgCost already includes the commission paid, so counting it
        // again here would double-charge the position.
        entryCommission: 0,
        lastKnownPrice: avgCost, updatedAt: at,
      });
    });

    api.on(EventName.accountSummary, (_reqId: number, _account: string, tag: string, value: string) => {
      const numeric = Number.parseFloat(value);
      if (!Number.isFinite(numeric)) return;
      if (tag === 'NetLiquidation') this.account.equity = numeric;
      if (tag === 'TotalCashValue') this.account.cash = numeric;
      if (tag === 'BuyingPower') this.account.buyingPower = numeric;
      // IBKR reports how many day trades remain, not how many were used.
      if (tag === 'DayTradesRemaining' && numeric >= 0) {
        this.account.dayTradesUsed = Math.max(0, 3 - numeric);
      }
    });

    api.on(EventName.disconnected, () => {
      this.connected = false;
    });
  }

  private onError(error: Error, code: number, reqId: number): void {
    // 2104/2106/2158 are "market data farm connection is OK" notices.
    if ([2104, 2106, 2107, 2158].includes(code)) return;

    const order = this.byBrokerId.get(reqId);
    if (order && order.status !== 'FILLED') {
      order.status = 'REJECTED';
      order.message = `${error.message} (code ${code})`;
      order.updatedAt = new Date().toISOString();
    }
    console.warn(`[ibkr] ${error.message} (code ${code}, req ${reqId})`);
  }

  private subscribe(): void {
    if (!this.api) return;
    this.api.reqPositions();
    this.api.reqAccountSummary(
      9001, 'All', 'NetLiquidation,TotalCashValue,BuyingPower,DayTradesRemaining',
    );
  }

  async disconnect(): Promise<void> {
    this.api?.disconnect();
    this.connected = false;
    this.api = null;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getAccount(): Promise<AccountState> {
    if (!this.connected) throw new BrokerError('not connected', 'NOT_CONNECTED', true);
    return { ...this.account };
  }

  async getPositions(): Promise<Position[]> {
    if (!this.connected) throw new BrokerError('not connected', 'NOT_CONNECTED', true);
    return this.positions.filter((p) => p.quantity !== 0).map((p) => ({ ...p }));
  }

  async placeOrder(request: OrderRequest): Promise<Order> {
    if (!this.connected || !this.api) {
      throw new BrokerError('not connected', 'NOT_CONNECTED', true);
    }
    if (this.nextOrderId === null) {
      throw new BrokerError('no order id from IBKR yet', 'NO_ORDER_ID', true);
    }
    if (this.byClientId.has(request.clientOrderId)) {
      throw new BrokerError(`duplicate order id ${request.clientOrderId}`, 'DUPLICATE');
    }

    const brokerOrderId = this.nextOrderId;
    this.nextOrderId += 1;

    const action = request.side === 'BUY' ? OrderAction.BUY : OrderAction.SELL;
    // LimitOrder takes (action, price, quantity) — price before quantity. The
    // argument order is easy to get backwards and the consequence is an order
    // for the wrong size at the wrong price, so it is written out here rather
    // than inlined.
    const order = request.limitPrice !== undefined
      ? new LimitOrder(action, request.limitPrice, request.quantity)
      : new MarketOrder(action, request.quantity);

    const record: Order = {
      clientOrderId: request.clientOrderId,
      brokerOrderId: String(brokerOrderId),
      symbol: request.symbol,
      side: request.side,
      requestedQuantity: request.quantity,
      filledQuantity: 0,
      averageFillPrice: null,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      message: null,
    };
    this.byClientId.set(request.clientOrderId, record);
    this.byBrokerId.set(brokerOrderId, record);

    this.api.placeOrder(brokerOrderId, new Stock(request.symbol), order);
    return record;
  }

  async getOrder(clientOrderId: string): Promise<Order | null> {
    const order = this.byClientId.get(clientOrderId);
    return order ? { ...order } : null;
  }

  async cancelOrder(clientOrderId: string): Promise<void> {
    const order = this.byClientId.get(clientOrderId);
    if (!order) throw new BrokerError(`unknown order ${clientOrderId}`, 'UNKNOWN_ORDER');
    if (order.status === 'FILLED') {
      throw new BrokerError(`${clientOrderId} already filled`, 'ALREADY_FILLED');
    }
    this.api?.cancelOrder(Number(order.brokerOrderId));
  }

  async getLastPrice(symbol: string): Promise<number | null> {
    return this.options.priceFeed(symbol);
  }

  /**
   * Waits for an order to reach a terminal state.
   *
   * IBKR fills are asynchronous, so the engine's "did it fill?" question has to
   * be answered by waiting. A timeout returns the order as it stands rather
   * than throwing: an order that has not filled yet is a fact to act on, not an
   * error.
   */
  async waitForFill(clientOrderId: string, timeoutMs: number): Promise<Order | null> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const order = this.byClientId.get(clientOrderId);
      if (!order) return null;
      if (TERMINAL.has(order.status) || order.status === 'FILLED'
        || order.status === 'CANCELLED' || order.status === 'REJECTED') {
        return { ...order };
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    const order = this.byClientId.get(clientOrderId);
    return order ? { ...order } : null;
  }
}
