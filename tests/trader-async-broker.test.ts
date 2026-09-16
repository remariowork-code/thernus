import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { rmSync } from 'node:fs';
import type { StockMetrics } from '../shared/types';
import { TradeLog } from '../trader/src/audit/TradeLog';
import type { IBroker } from '../trader/src/broker/IBroker';
import { DEFAULT_TRADER_CONFIG, mergeTraderConfig } from '../trader/src/config';
import { RiskManager } from '../trader/src/engine/RiskManager';
import { TradingEngine, type MarketDataSource } from '../trader/src/engine/TradingEngine';
import { NullNotifier } from '../trader/src/notify/Notifier';
import type { AccountState, Order, OrderRequest, Position } from '../trader/src/types';

const AT = new Date('2026-09-15T14:30:00Z'); // 10:30 ET, an hour into the session

/**
 * A broker that acknowledges an order and fills it later, the way IBKR does.
 *
 * This exists because the real defect it guards against was invisible to every
 * other test: the paper broker fills synchronously, so an engine that reads the
 * status straight back from placeOrder looks correct against it and silently
 * fails against the only broker that can lose money.
 */
class AsyncBroker implements IBroker {
  readonly name = 'async test broker';
  readonly isLive = false;
  private connected = false;
  readonly orders = new Map<string, Order>();
  readonly cancelled: string[] = [];

  constructor(
    /** What the order looks like once it settles. */
    private readonly settle: (order: Order) => Order,
  ) {}

  async connect(): Promise<void> { this.connected = true; }
  async disconnect(): Promise<void> { this.connected = false; }
  isConnected(): boolean { return this.connected; }
  async getAccount(): Promise<AccountState> {
    return { equity: 10_000, cash: 10_000, buyingPower: 10_000, dayTradesUsed: 0 };
  }
  async getPositions(): Promise<Position[]> { return []; }
  async getLastPrice(): Promise<number | null> { return 10; }

  async placeOrder(request: OrderRequest): Promise<Order> {
    // Acknowledged only. Nothing has filled yet.
    const order: Order = {
      clientOrderId: request.clientOrderId,
      brokerOrderId: `ib-${this.orders.size + 1}`,
      symbol: request.symbol,
      side: request.side,
      requestedQuantity: request.quantity,
      filledQuantity: 0,
      averageFillPrice: null,
      status: 'PENDING',
      submittedAt: AT.toISOString(),
      updatedAt: AT.toISOString(),
      message: null,
    };
    this.orders.set(order.clientOrderId, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | null> { return this.orders.get(id) ?? null; }

  async waitForFill(id: string): Promise<Order | null> {
    const order = this.orders.get(id);
    if (!order) return null;
    const done = this.settle(order);
    this.orders.set(id, done);
    return done;
  }

  async cancelOrder(id: string): Promise<void> { this.cancelled.push(id); }
}

const prices = new Map<string, number>();
let dir: string;

function metrics(symbol: string): StockMetrics {
  const price = prices.get(symbol) ?? 10;
  return {
    symbol, price, previousClose: price / 1.09, changePercent: 9,
    change1m: 0.3, change5m: 1.2, change15m: 3, volume: 2_000_000,
    rvol: 5, volumeAcceleration: 1.8, vwap: price * 0.97, vwapDistance: 3,
    aboveVwap: true, dayHigh: price * 1.005, dayLow: price * 0.9,
    distanceFromHigh: 0.5, isNewHigh: true, volatility: 1.4,
    momentumScore: 72, stage: 'ACCELERATING', updatedAt: AT.getTime(),
  };
}

const data: MarketDataSource = {
  async getCandidates() { return [...prices.keys()].map(metrics); },
  async getMetrics(symbol) { return prices.has(symbol) ? metrics(symbol) : null; },
};

function build(broker: IBroker) {
  const config = mergeTraderConfig(DEFAULT_TRADER_CONFIG, {
    risk: { accountEquity: 10_000, maxPositionDollars: 2_000, maxPositionPercent: 20 },
    exit: { ...DEFAULT_TRADER_CONFIG.exit, stopLossPercent: 3 },
  });
  const log = new TradeLog(`${dir}/events.jsonl`, `${dir}/trades.jsonl`);
  const risk = new RiskManager(config.risk);
  const engine = new TradingEngine({
    broker, data, risk, log, notify: new NullNotifier(), config, now: () => AT,
  });
  return { engine, log, risk };
}

beforeEach(() => {
  prices.clear();
  prices.set('AAA', 10);
  dir = `/tmp/thernus-async-tests/${process.pid}-${Math.random().toString(36).slice(2)}`;
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('a broker that fills asynchronously', () => {
  it('opens the position once the order settles, not on acknowledgement', async () => {
    // The regression: placeOrder returns PENDING, which the engine used to
    // read as a refusal, leaving a live order at the broker and no position.
    const broker = new AsyncBroker((o) => ({
      ...o, status: 'FILLED', filledQuantity: o.requestedQuantity, averageFillPrice: 10.01,
    }));
    const { engine } = build(broker);
    await broker.connect();

    const result = await engine.runCycle();

    expect(result.entered).toEqual(['AAA']);
    expect(engine.openPositionCount()).toBe(1);
    expect(broker.cancelled).toEqual([]);
  });

  it('cancels an order that never fills, so nothing is left working', async () => {
    const broker = new AsyncBroker((o) => o); // still PENDING at timeout
    const { engine } = build(broker);
    await broker.connect();

    const result = await engine.runCycle();

    expect(result.entered).toEqual([]);
    expect(engine.openPositionCount()).toBe(0);
    // The order must not be abandoned in a live state.
    expect(broker.cancelled).toHaveLength(1);
  });

  it('keeps a partial entry rather than discarding shares it now owns', async () => {
    // Discarding a partial leaves real stock held and untracked — the worst
    // state available, because nothing will ever manage or close it.
    const broker = new AsyncBroker((o) => ({
      ...o, status: 'PARTIAL', filledQuantity: 40, averageFillPrice: 10.01,
    }));
    const { engine } = build(broker);
    await broker.connect();

    await engine.runCycle();

    const [position] = engine.snapshot().positions;
    expect(position.quantity).toBe(40);
    // And the unfilled remainder is cancelled so it cannot fill later into a
    // position already being managed.
    expect(broker.cancelled).toHaveLength(1);
  });
});

describe('an exit that does not fill', () => {
  it('keeps the position open and counts towards the kill switch', async () => {
    let fillEntry = true;
    const broker = new AsyncBroker((o) =>
      fillEntry && o.side === 'BUY'
        ? { ...o, status: 'FILLED', filledQuantity: o.requestedQuantity, averageFillPrice: 10.01 }
        : { ...o, status: 'REJECTED', message: 'no liquidity' });
    const { engine, risk, log } = build(broker);
    await broker.connect();
    await engine.runCycle();
    expect(engine.openPositionCount()).toBe(1);

    fillEntry = false;
    prices.set('AAA', 9.5); // through the stop
    const result = await engine.runCycle();

    expect(result.exited).toEqual([]);
    // Still held. The engine must not believe it is flat.
    expect(engine.openPositionCount()).toBe(1);
    expect(log.readTrades()).toHaveLength(0);
    expect(risk.isHalted()).toBe(false); // one failure, not yet five
  });

  it('reduces the position on a partial exit instead of closing it', async () => {
    let entering = true;
    const broker = new AsyncBroker((o) =>
      entering
        ? { ...o, status: 'FILLED', filledQuantity: o.requestedQuantity, averageFillPrice: 10.01 }
        : { ...o, status: 'PARTIAL', filledQuantity: 30, averageFillPrice: 9.7 });
    const { engine, log } = build(broker);
    await broker.connect();
    await engine.runCycle();
    const opened = engine.snapshot().positions[0].quantity;
    expect(opened).toBe(200);

    entering = false;
    prices.set('AAA', 9.5);
    await engine.runCycle();

    // 30 sold, 170 still held and still managed.
    expect(engine.snapshot().positions[0].quantity).toBe(170);
    // Not booked as a closed trade: the trade is not over.
    expect(log.readTrades()).toHaveLength(0);
  });
});

describe('adopting a position found at the broker', () => {
  /** A broker holding stock the engine has no record of — i.e. after a restart. */
  class HoldingBroker extends AsyncBroker {
    constructor(private readonly held: Position[]) {
      super((o) => ({
        ...o, status: 'FILLED', filledQuantity: o.requestedQuantity, averageFillPrice: 9.7,
      }));
    }
    override async getPositions(): Promise<Position[]> {
      return this.held.map((p) => ({ ...p }));
    }
  }

  function orphan(): Position {
    return {
      symbol: 'AAA', quantity: 50, entryPrice: 10, entryAt: AT.toISOString(),
      entryReasons: ['discovered from the broker at startup'],
      // This is what a broker actually reports: it knows the holding, not the
      // plan. Zero here previously meant no stop at all.
      stopPrice: 0, initialStopPrice: 0, targetPrice: 0,
      highWaterMark: 10, stopRaised: false, entryOrderId: 'unknown',
      entryCommission: 0, lastKnownPrice: 10, updatedAt: AT.toISOString(),
    };
  }

  it('gives an adopted position a stop instead of leaving it unprotected', async () => {
    const broker = new HoldingBroker([orphan()]);
    const { engine } = build(broker);
    await broker.connect();

    await engine.resume();

    const [position] = engine.snapshot().positions;
    expect(position.stopPrice).toBeCloseTo(9.7, 2); // 3% under the $10 cost basis
    expect(position.initialStopPrice).toBe(position.stopPrice);
  });

  it('then actually closes it when price breaches that stop', async () => {
    const broker = new HoldingBroker([orphan()]);
    const { engine, log } = build(broker);
    await broker.connect();
    await engine.resume();

    prices.set('AAA', 9.5);
    const result = await engine.runCycle();

    expect(result.exited).toEqual(['AAA']);
    expect(log.readTrades()[0].exitReason).toBe('STOP_LOSS');
  });
});
