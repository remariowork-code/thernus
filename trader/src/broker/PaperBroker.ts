import type { AccountState, Order, OrderRequest, Position } from '../types';
import { BrokerError, type IBroker } from './IBroker';

export interface PaperBrokerOptions {
  startingCash: number;
  /**
   * Fill price penalty, percent. A market order does not fill at the price you
   * saw — it crosses the spread and moves the book. Simulating fills at the
   * quoted price is the single most common way a backtest lies, so the default
   * is deliberately pessimistic for the small, fast-moving names this trades.
   */
  slippagePercent?: number;
  /**
   * Commission for one order. A function rather than a constant because the
   * real schedule is per-share with a minimum, and on small orders the minimum
   * is what binds — flattening it to one number hides the cost that matters.
   */
  commission?: (quantity: number, price: number) => number;
  /** Price source. Injected so tests and replays drive it deterministically. */
  priceFeed: (symbol: string) => Promise<number | null> | number | null;
  now?: () => Date;
}

/**
 * An in-memory broker that fills immediately at a penalised price.
 *
 * This is Phase 1: it lets the entry rules, sizing, stops and day-trade
 * accounting be exercised end-to-end without an account, a connection, or a
 * market being open. It is not a market simulator — there is no queue, no
 * partial fill, no rejection for want of liquidity — so a strategy that only
 * works here has proved very little. What it does prove is that the engine's
 * own arithmetic and state machine are correct, which is the part worth
 * testing before real orders exist.
 */
export class PaperBroker implements IBroker {
  readonly name = 'simulator';
  readonly isLive = false;

  private connected = false;
  private cash: number;
  private readonly startingCash: number;
  private readonly slippage: number;
  private readonly commission: (quantity: number, price: number) => number;
  private readonly priceFeed: PaperBrokerOptions['priceFeed'];
  private readonly now: () => Date;
  private readonly orders = new Map<string, Order>();
  private readonly positions = new Map<string, Position>();
  private commissionPaid = 0;
  private lastCommission = 0;

  constructor(options: PaperBrokerOptions) {
    this.startingCash = options.startingCash;
    this.cash = options.startingCash;
    this.slippage = options.slippagePercent ?? 0.15;
    this.commission = options.commission ?? (() => 0);
    this.priceFeed = options.priceFeed;
    this.now = options.now ?? (() => new Date());
  }

  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getAccount(): Promise<AccountState> {
    let marketValue = 0;
    for (const position of this.positions.values()) {
      const price = (await this.priceFeed(position.symbol)) ?? position.entryPrice;
      marketValue += price * position.quantity;
    }
    const equity = this.cash + marketValue;
    return {
      equity,
      cash: this.cash,
      // No margin in the simulator. A cash account settles, but for a
      // day-trading bot under PDT limits that distinction never binds before
      // the trade count does.
      buyingPower: this.cash,
      dayTradesUsed: 0,
    };
  }

  async getPositions(): Promise<Position[]> {
    return [...this.positions.values()];
  }

  async placeOrder(request: OrderRequest): Promise<Order> {
    if (!this.connected) throw new BrokerError('not connected', 'NOT_CONNECTED', true);
    if (this.orders.has(request.clientOrderId)) {
      throw new BrokerError(`duplicate order id ${request.clientOrderId}`, 'DUPLICATE');
    }
    if (request.quantity <= 0) {
      throw new BrokerError(`quantity must be positive, got ${request.quantity}`, 'BAD_QUANTITY');
    }

    const at = this.now().toISOString();
    const quoted = await this.priceFeed(request.symbol);
    if (quoted === null || quoted <= 0) {
      const order: Order = {
        clientOrderId: request.clientOrderId,
        brokerOrderId: null,
        symbol: request.symbol,
        side: request.side,
        requestedQuantity: request.quantity,
        filledQuantity: 0,
        averageFillPrice: null,
        status: 'REJECTED',
        submittedAt: at,
        updatedAt: at,
        message: 'no price available',
      };
      this.orders.set(order.clientOrderId, order);
      return order;
    }

    // Slippage always works against us: pay up to buy, give up to sell.
    const direction = request.side === 'BUY' ? 1 : -1;
    let fillPrice = quoted * (1 + (direction * this.slippage) / 100);

    // A limit order that the slipped price would violate does not fill here.
    // It is left resting rather than silently becoming a market order.
    if (request.limitPrice !== undefined) {
      const violates = request.side === 'BUY'
        ? fillPrice > request.limitPrice
        : fillPrice < request.limitPrice;
      if (violates) {
        const order: Order = {
          clientOrderId: request.clientOrderId,
          brokerOrderId: `sim-${this.orders.size + 1}`,
          symbol: request.symbol,
          side: request.side,
          requestedQuantity: request.quantity,
          filledQuantity: 0,
          averageFillPrice: null,
          status: 'SUBMITTED',
          submittedAt: at,
          updatedAt: at,
          message: `resting: ${request.side} limit ${request.limitPrice} vs ${fillPrice.toFixed(4)}`,
        };
        this.orders.set(order.clientOrderId, order);
        return order;
      }
      fillPrice = request.limitPrice;
    }

    const commission = this.commission(request.quantity, fillPrice);

    if (request.side === 'BUY') {
      const cost = fillPrice * request.quantity + commission;
      if (cost > this.cash) {
        const order: Order = {
          clientOrderId: request.clientOrderId,
          brokerOrderId: null,
          symbol: request.symbol,
          side: request.side,
          requestedQuantity: request.quantity,
          filledQuantity: 0,
          averageFillPrice: null,
          status: 'REJECTED',
          submittedAt: at,
          updatedAt: at,
          message: `insufficient cash: need $${cost.toFixed(2)}, have $${this.cash.toFixed(2)}`,
        };
        this.orders.set(order.clientOrderId, order);
        return order;
      }
      this.cash -= cost;
      this.applyBuy(request.symbol, request.quantity, fillPrice, at, request.clientOrderId, commission);
    } else {
      const held = this.positions.get(request.symbol);
      if (!held || held.quantity < request.quantity) {
        const order: Order = {
          clientOrderId: request.clientOrderId,
          brokerOrderId: null,
          symbol: request.symbol,
          side: request.side,
          requestedQuantity: request.quantity,
          filledQuantity: 0,
          averageFillPrice: null,
          status: 'REJECTED',
          submittedAt: at,
          updatedAt: at,
          // No shorting: the brief is a long momentum strategy, and a silent
          // short is the worst possible way to discover otherwise.
          message: `cannot sell ${request.quantity} of ${request.symbol}, hold ${held?.quantity ?? 0}`,
        };
        this.orders.set(order.clientOrderId, order);
        return order;
      }
      this.cash += fillPrice * request.quantity - commission;
      held.quantity -= request.quantity;
      held.lastKnownPrice = fillPrice;
      held.updatedAt = at;
      if (held.quantity === 0) this.positions.delete(request.symbol);
    }

    this.commissionPaid += commission;

    const order: Order = {
      clientOrderId: request.clientOrderId,
      brokerOrderId: `sim-${this.orders.size + 1}`,
      symbol: request.symbol,
      side: request.side,
      requestedQuantity: request.quantity,
      filledQuantity: request.quantity,
      averageFillPrice: fillPrice,
      status: 'FILLED',
      submittedAt: at,
      updatedAt: at,
      // The commission is reported on the order so the caller can account for
      // it without re-deriving the schedule.
      message: `commission $${commission.toFixed(2)}`,
    };
    this.orders.set(order.clientOrderId, order);
    this.lastCommission = commission;
    return order;
  }

  /** Commission charged by the most recent fill. */
  lastFillCommission(): number {
    return this.lastCommission;
  }

  private applyBuy(
    symbol: string,
    quantity: number,
    price: number,
    at: string,
    orderId: string,
    commission: number,
  ): void {
    const existing = this.positions.get(symbol);
    if (existing) {
      const total = existing.quantity + quantity;
      existing.entryPrice = (existing.entryPrice * existing.quantity + price * quantity) / total;
      existing.quantity = total;
      existing.lastKnownPrice = price;
      existing.entryCommission += commission;
      existing.updatedAt = at;
      return;
    }
    // Stop and target are set by the engine, which owns the exit rules; the
    // broker only records what it was told to hold.
    this.positions.set(symbol, {
      symbol,
      quantity,
      entryPrice: price,
      entryAt: at,
      entryReasons: [],
      stopPrice: 0,
      initialStopPrice: 0,
      targetPrice: 0,
      highWaterMark: price,
      stopRaised: false,
      entryOrderId: orderId,
      entryCommission: commission,
      lastKnownPrice: price,
      updatedAt: at,
    });
  }

  async getOrder(clientOrderId: string): Promise<Order | null> {
    return this.orders.get(clientOrderId) ?? null;
  }

  async cancelOrder(clientOrderId: string): Promise<void> {
    const order = this.orders.get(clientOrderId);
    if (!order) throw new BrokerError(`unknown order ${clientOrderId}`, 'UNKNOWN_ORDER');
    if (order.status === 'FILLED') {
      throw new BrokerError(`${clientOrderId} already filled`, 'ALREADY_FILLED');
    }
    order.status = 'CANCELLED';
    order.updatedAt = this.now().toISOString();
  }

  async getLastPrice(symbol: string): Promise<number | null> {
    return this.priceFeed(symbol);
  }

  /** Simulator-only accounting, for the Phase 1 report. */
  stats(): { startingCash: number; cash: number; commissionPaid: number; openPositions: number } {
    return {
      startingCash: this.startingCash,
      cash: this.cash,
      commissionPaid: this.commissionPaid,
      openPositions: this.positions.size,
    };
  }
}
