import { rmSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { StockMetrics } from '../shared/types';
import { TradeLog } from '../trader/src/audit/TradeLog';
import { PaperBroker } from '../trader/src/broker/PaperBroker';
import { DEFAULT_TRADER_CONFIG, mergeTraderConfig, type TraderConfig } from '../trader/src/config';
import { RiskManager } from '../trader/src/engine/RiskManager';
import { TradingEngine, type MarketDataSource } from '../trader/src/engine/TradingEngine';
import { NullNotifier } from '../trader/src/notify/Notifier';

/** 10:30 ET on Tuesday 15 September 2026 — an hour into a normal session. */
const OPEN_ISH = new Date('2026-09-15T14:30:00Z');

const prices = new Map<string, number>();
let dir: string;

function metrics(symbol: string, overrides: Partial<StockMetrics> = {}): StockMetrics {
  const price = prices.get(symbol) ?? 10;
  return {
    symbol,
    price,
    previousClose: price / 1.09,
    changePercent: 9,
    change1m: 0.3,
    change5m: 1.2,
    change15m: 3,
    volume: 2_000_000,
    rvol: 5,
    volumeAcceleration: 1.8,
    vwap: price * 0.97,
    vwapDistance: 3,
    aboveVwap: true,
    dayHigh: price * 1.005,
    dayLow: price * 0.9,
    distanceFromHigh: 0.5,
    isNewHigh: true,
    volatility: 1.4,
    momentumScore: 72,
    stage: 'ACCELERATING',
    updatedAt: OPEN_ISH.getTime(),
    ...overrides,
  };
}

/** A data source driven entirely by the test. */
function source(symbols: string[], overrides: Record<string, Partial<StockMetrics>> = {}): MarketDataSource {
  return {
    async getCandidates() {
      return symbols.map((s) => metrics(s, overrides[s]));
    },
    async getMetrics(symbol) {
      if (!prices.has(symbol)) return null;
      return metrics(symbol, overrides[symbol]);
    },
  };
}

function build(opts: {
  symbols: string[];
  overrides?: Record<string, Partial<StockMetrics>>;
  config?: Partial<TraderConfig>;
  cash?: number;
  now?: () => Date;
  data?: MarketDataSource;
}) {
  const config = mergeTraderConfig(
    mergeTraderConfig(DEFAULT_TRADER_CONFIG, {
      // A $100 account cannot buy a single share at most prices, so the tests
      // use a larger one to exercise the logic rather than the account size.
      risk: { accountEquity: 10_000, maxPositionDollars: 2_000, maxPositionPercent: 20 },
    }),
    config_or_empty(opts.config),
  );
  const now = opts.now ?? (() => OPEN_ISH);
  const broker = new PaperBroker({
    startingCash: opts.cash ?? 10_000,
    priceFeed: (s) => prices.get(s) ?? null,
    now,
  });
  const log = new TradeLog(`${dir}/events.jsonl`, `${dir}/trades.jsonl`);
  const risk = new RiskManager(config.risk);
  const engine = new TradingEngine({
    broker,
    data: opts.data ?? source(opts.symbols, opts.overrides),
    risk,
    log,
    notify: new NullNotifier(),
    config,
    now,
  });
  return { engine, broker, risk, log, config };
}

function config_or_empty(c?: Partial<TraderConfig>) {
  return (c ?? {}) as Partial<TraderConfig>;
}

beforeEach(async () => {
  prices.clear();
  dir = `/tmp/thernus-trader-tests/${process.pid}-${Math.random().toString(36).slice(2)}`;
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

describe('a complete trade', () => {
  it('enters on a signal, trails the stop, and closes at the target', async () => {
    prices.set('AAA', 10);
    const { engine, broker } = build({ symbols: ['AAA'] });
    await broker.connect();

    const entry = await engine.runCycle();
    expect(entry.entered).toEqual(['AAA']);

    const [position] = engine.snapshot().positions;
    expect(position.quantity).toBe(200); // $2,000 cap / $10
    expect(position.entryPrice).toBeCloseTo(10.015, 3);
    expect(position.stopPrice).toBeCloseTo(9.71, 2);
    expect(position.entryReasons.length).toBeGreaterThan(5);

    // The stock runs to the target.
    prices.set('AAA', 10.65);
    const exit = await engine.runCycle();
    expect(exit.exited).toEqual(['AAA']);
    expect(engine.openPositionCount()).toBe(0);

    const [trade] = engine.snapshot().positions.length ? [] : new TradeLog(`${dir}/events.jsonl`, `${dir}/trades.jsonl`).readTrades();
    expect(trade.exitReason).toBe('PROFIT_TARGET');
    expect(trade.realizedPnl).toBeGreaterThan(0);
    expect(trade.wasDayTrade).toBe(true);
  });

  it('closes a loser at the stop for about the planned risk', async () => {
    prices.set('BBB', 20);
    const { engine, broker, log } = build({ symbols: ['BBB'] });
    await broker.connect();
    await engine.runCycle();

    // Price drifts down through the stop rather than gapping it.
    prices.set('BBB', 19.42);
    const result = await engine.runCycle();
    expect(result.exited).toEqual(['BBB']);

    const [trade] = log.readTrades();
    expect(trade.exitReason).toBe('STOP_LOSS');
    expect(trade.realizedPnl).toBeLessThan(0);
    // Slippage makes this slightly worse than 1R, but only slightly.
    expect(trade.rMultiple).toBeLessThan(-1);
    expect(trade.rMultiple).toBeGreaterThan(-1.2);
  });

  it('loses more than 1R when price gaps through the stop', async () => {
    // A stop is an instruction to sell, not a promise of a price. This test
    // exists so that the fact is recorded rather than discovered live: a 5%
    // gap against a 3% stop costs well over the nominal risk, which is why
    // the position limits are sized independently of the stop.
    prices.set('BBB', 20);
    const { engine, broker, log } = build({ symbols: ['BBB'] });
    await broker.connect();
    await engine.runCycle();

    prices.set('BBB', 19);
    await engine.runCycle();

    const [trade] = log.readTrades();
    expect(trade.exitReason).toBe('STOP_LOSS');
    expect(trade.rMultiple).toBeLessThan(-1.5);
  });
});

describe('the cycle refuses to trade when it should', () => {
  it('does nothing outside regular hours', async () => {
    prices.set('AAA', 10);
    const { engine, broker } = build({
      symbols: ['AAA'],
      now: () => new Date('2026-09-15T11:00:00Z'), // 07:00 ET, premarket
    });
    await broker.connect();

    const result = await engine.runCycle();
    expect(result.skipped).toContain('premarket');
    expect(result.entered).toEqual([]);
  });

  it('waits out the opening minutes', async () => {
    prices.set('AAA', 10);
    const { engine, broker } = build({
      symbols: ['AAA'],
      now: () => new Date('2026-09-15T13:40:00Z'), // 09:40 ET, ten minutes in
    });
    await broker.connect();

    const result = await engine.runCycle();
    expect(result.skipped).toContain('waiting for the open to settle');
  });

  it('stops entering near the close', async () => {
    prices.set('AAA', 10);
    const { engine, broker } = build({
      symbols: ['AAA'],
      now: () => new Date('2026-09-15T19:45:00Z'), // 15:45 ET
    });
    await broker.connect();

    const result = await engine.runCycle();
    expect(result.skipped).toContain('too close to the bell');
  });

  it('respects the daily trade limit across cycles', async () => {
    for (const s of ['AAA', 'BBB', 'CCC', 'DDD']) prices.set(s, 10);
    const { engine, broker } = build({
      symbols: ['AAA', 'BBB', 'CCC', 'DDD'],
      config: { risk: { ...DEFAULT_TRADER_CONFIG.risk, accountEquity: 10_000, maxPositionDollars: 2_000, maxOpenPositions: 10, maxTradesPerDay: 2 } },
    });
    await broker.connect();

    const result = await engine.runCycle();
    expect(result.entered).toHaveLength(2);
  });

  it('will not buy the same symbol twice', async () => {
    prices.set('AAA', 10);
    const { engine, broker } = build({ symbols: ['AAA'] });
    await broker.connect();

    await engine.runCycle();
    const second = await engine.runCycle();
    expect(second.entered).toEqual([]);
    expect(engine.openPositionCount()).toBe(1);
  });
});

describe('the kill switch', () => {
  it('blocks new entries and flattens what is open', async () => {
    prices.set('AAA', 10);
    const { engine, broker, risk, log } = build({ symbols: ['AAA'] });
    await broker.connect();
    await engine.runCycle();
    expect(engine.openPositionCount()).toBe(1);

    risk.trip('manual halt');
    const result = await engine.runCycle();

    expect(result.exited).toEqual(['AAA']);
    expect(result.entered).toEqual([]);
    expect(engine.openPositionCount()).toBe(0);
    expect(log.readTrades()[0].exitReason).toBe('KILL_SWITCH');
  });

  it('exits even when the price feed has failed', async () => {
    prices.set('AAA', 10);
    const failing: MarketDataSource = {
      async getCandidates() { return [metrics('AAA')]; },
      async getMetrics() { throw new Error('feed down'); },
    };
    const { engine, broker, risk } = build({ symbols: ['AAA'], data: failing });
    await broker.connect();

    // First cycle: candidates work, so the position opens.
    await engine.runCycle();
    expect(engine.openPositionCount()).toBe(1);

    risk.trip('halt');
    const result = await engine.runCycle();
    expect(result.exited).toEqual(['AAA']);
  });
});

describe('failure handling', () => {
  it('keeps managing positions when the scan fails', async () => {
    prices.set('AAA', 10);
    let failScan = false;
    const flaky: MarketDataSource = {
      async getCandidates() {
        if (failScan) throw new Error('scan exploded');
        return [metrics('AAA')];
      },
      async getMetrics(symbol) { return prices.has(symbol) ? metrics(symbol) : null; },
    };
    const { engine, broker, log } = build({ symbols: ['AAA'], data: flaky });
    await broker.connect();
    await engine.runCycle();

    failScan = true;
    prices.set('AAA', 10.65); // would hit the target
    const result = await engine.runCycle();

    // The scan failed, but the exit still ran.
    expect(result.exited).toEqual(['AAA']);
    expect(result.entered).toEqual([]);
    expect(log.readTrades()[0].exitReason).toBe('PROFIT_TARGET');
  });

  it('trips the kill switch after repeated failures', async () => {
    const broken: MarketDataSource = {
      async getCandidates() { throw new Error('down'); },
      async getMetrics() { return null; },
    };
    const { engine, broker, risk, config } = build({ symbols: [], data: broken });
    await broker.connect();

    for (let i = 0; i < config.execution.maxConsecutiveFailures; i += 1) {
      await engine.runCycle();
    }
    expect(risk.haltReason()).toContain('consecutive failures');
  });
});

describe('restart safety', () => {
  it('reloads open positions and the day\'s trades', async () => {
    prices.set('AAA', 10);
    const first = build({ symbols: ['AAA'] });
    await first.broker.connect();
    await first.engine.runCycle();
    prices.set('AAA', 10.65);
    await first.engine.runCycle(); // closes at target

    prices.set('BBB', 10);
    const second = build({ symbols: ['BBB'] });
    await second.broker.connect();
    await second.engine.resume();

    // The closed trade is on disk, so the restart knows one trade is spent.
    expect(second.engine.snapshot().tradesToday).toBe(1);
    expect(second.engine.snapshot().realizedPnlToday).toBeGreaterThan(0);
  });
});
