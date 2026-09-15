import { beforeEach, describe, expect, it } from 'vitest';
import { PaperBroker } from '../trader/src/broker/PaperBroker';

const prices = new Map<string, number>();

function broker(overrides: Partial<ConstructorParameters<typeof PaperBroker>[0]> = {}) {
  return new PaperBroker({
    startingCash: 1_000,
    commission: () => 1,
    slippagePercent: 0.15,
    priceFeed: (symbol) => prices.get(symbol) ?? null,
    now: () => new Date('2026-09-15T14:00:00Z'),
    ...overrides,
  });
}

beforeEach(() => {
  prices.clear();
  prices.set('AAA', 10);
});

describe('fills', () => {
  it('fills a buy above the quote and a sell below it', async () => {
    const b = broker();
    await b.connect();

    const buy = await b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 10, clientOrderId: 'b1' });
    expect(buy.status).toBe('FILLED');
    // Slippage must always cost us: 10 * 1.0015.
    expect(buy.averageFillPrice).toBeCloseTo(10.015, 4);

    const sell = await b.placeOrder({ symbol: 'AAA', side: 'SELL', quantity: 10, clientOrderId: 's1' });
    expect(sell.averageFillPrice).toBeCloseTo(9.985, 4);

    // Round trip at a flat price loses the spread twice plus both commissions.
    const account = await b.getAccount();
    expect(account.cash).toBeLessThan(1_000);
    expect(b.stats().commissionPaid).toBe(2);
  });

  it('rejects an order it cannot price', async () => {
    const b = broker();
    await b.connect();
    const order = await b.placeOrder({ symbol: 'NOPE', side: 'BUY', quantity: 1, clientOrderId: 'x' });
    expect(order.status).toBe('REJECTED');
    expect(order.message).toContain('no price');
  });

  it('refuses to spend cash it does not have', async () => {
    const b = broker({ startingCash: 50 });
    await b.connect();
    const order = await b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 10, clientOrderId: 'b1' });
    expect(order.status).toBe('REJECTED');
    expect(order.message).toContain('insufficient cash');
    expect((await b.getAccount()).cash).toBe(50);
  });

  it('will not short a symbol it does not hold', async () => {
    const b = broker();
    await b.connect();
    const order = await b.placeOrder({ symbol: 'AAA', side: 'SELL', quantity: 5, clientOrderId: 's1' });
    expect(order.status).toBe('REJECTED');
    expect(order.message).toContain('cannot sell');
    expect(await b.getPositions()).toHaveLength(0);
  });

  it('rests a limit order the slipped price cannot satisfy', async () => {
    const b = broker();
    await b.connect();
    const order = await b.placeOrder({
      symbol: 'AAA', side: 'BUY', quantity: 5, limitPrice: 9.5, clientOrderId: 'b1',
    });
    expect(order.status).toBe('SUBMITTED');
    expect(order.filledQuantity).toBe(0);
    expect(await b.getPositions()).toHaveLength(0);
  });

  it('fills a marketable limit at the limit price', async () => {
    const b = broker();
    await b.connect();
    const order = await b.placeOrder({
      symbol: 'AAA', side: 'BUY', quantity: 5, limitPrice: 10.5, clientOrderId: 'b1',
    });
    expect(order.status).toBe('FILLED');
    expect(order.averageFillPrice).toBe(10.5);
  });
});

describe('positions and accounting', () => {
  it('averages the entry price when adding to a position', async () => {
    const b = broker();
    await b.connect();
    await b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 10, clientOrderId: 'b1' });
    prices.set('AAA', 12);
    await b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 10, clientOrderId: 'b2' });

    const [position] = await b.getPositions();
    expect(position.quantity).toBe(20);
    expect(position.entryPrice).toBeCloseTo(11.0165, 4);
  });

  it('clears the position when fully sold', async () => {
    const b = broker();
    await b.connect();
    await b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 10, clientOrderId: 'b1' });
    await b.placeOrder({ symbol: 'AAA', side: 'SELL', quantity: 4, clientOrderId: 's1' });
    expect((await b.getPositions())[0].quantity).toBe(6);

    await b.placeOrder({ symbol: 'AAA', side: 'SELL', quantity: 6, clientOrderId: 's2' });
    expect(await b.getPositions()).toHaveLength(0);
  });

  it('marks equity to the live price', async () => {
    const b = broker();
    await b.connect();
    await b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 10, clientOrderId: 'b1' });

    prices.set('AAA', 20);
    const account = await b.getAccount();
    // ~$899 cash left plus 10 shares now worth $200.
    expect(account.equity).toBeCloseTo(1_098.85, 1);
    expect(account.equity).toBeGreaterThan(account.cash);
  });
});

describe('guards', () => {
  it('will not place an order while disconnected', async () => {
    const b = broker();
    await expect(
      b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 1, clientOrderId: 'b1' }),
    ).rejects.toThrow('not connected');
  });

  it('rejects a reused client order id', async () => {
    const b = broker();
    await b.connect();
    await b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 1, clientOrderId: 'b1' });
    await expect(
      b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 1, clientOrderId: 'b1' }),
    ).rejects.toThrow('duplicate order id');
  });

  it('rejects a non-positive quantity', async () => {
    const b = broker();
    await b.connect();
    await expect(
      b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 0, clientOrderId: 'b1' }),
    ).rejects.toThrow('quantity must be positive');
  });

  it('will not cancel an order that already filled', async () => {
    const b = broker();
    await b.connect();
    await b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 1, clientOrderId: 'b1' });
    await expect(b.cancelOrder('b1')).rejects.toThrow('already filled');
  });

  it('cancels a resting order', async () => {
    const b = broker();
    await b.connect();
    await b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 1, limitPrice: 9, clientOrderId: 'b1' });
    await b.cancelOrder('b1');
    expect((await b.getOrder('b1'))?.status).toBe('CANCELLED');
  });

  it('is never live', () => {
    expect(broker().isLive).toBe(false);
  });
});
