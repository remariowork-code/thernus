import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AlpacaBroker } from '../trader/src/broker/AlpacaBroker';
import { DEFAULT_TRADER_CONFIG, ZERO_COMMISSION, estimateCommission } from '../trader/src/config';

/** Captured requests, so the shape sent to Alpaca can be asserted on. */
let calls: Array<{ url: string; method: string; body: unknown }> = [];
let responder: (url: string, init: RequestInit) => { status: number; body: unknown };

function broker(isLive = false) {
  return new AlpacaBroker({ keyId: 'k', secretKey: 's', isLive, requestTimeoutMs: 1000 });
}

const ORDER = {
  id: 'abc-123', client_order_id: 'e-AAA-1', symbol: 'AAA', side: 'buy',
  qty: '10', filled_qty: '0', filled_avg_price: null, status: 'new',
  submitted_at: '2026-09-22T14:30:00Z', updated_at: '2026-09-22T14:30:00Z',
};

beforeEach(() => {
  calls = [];
  responder = () => ({ status: 200, body: {} });
  vi.stubGlobal('fetch', async (url: string, init: RequestInit = {}) => {
    calls.push({ url, method: init.method ?? 'GET', body: init.body ? JSON.parse(String(init.body)) : null });
    const { status, body } = responder(url, init);
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: String(status),
      text: async () => (body === null ? '' : JSON.stringify(body)),
    } as Response;
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('endpoint selection', () => {
  it('uses the paper host unless live', async () => {
    responder = () => ({ status: 200, body: { status: 'ACTIVE', trading_blocked: false, account_blocked: false } });
    await broker(false).connect();
    expect(calls[0].url).toContain('paper-api.alpaca.markets');
  });

  it('uses the live host when live', async () => {
    responder = () => ({ status: 200, body: { status: 'ACTIVE', trading_blocked: false, account_blocked: false } });
    await broker(true).connect();
    expect(calls[0].url).toContain('https://api.alpaca.markets');
    expect(calls[0].url).not.toContain('paper');
  });

  it('refuses to connect to a blocked account', async () => {
    responder = () => ({ status: 200, body: { status: 'ACTIVE', trading_blocked: true, account_blocked: false } });
    await expect(broker().connect()).rejects.toThrow('blocked from trading');
  });

  it('refuses to connect when the account is not ACTIVE', async () => {
    responder = () => ({ status: 200, body: { status: 'ONBOARDING', trading_blocked: false, account_blocked: false } });
    await expect(broker().connect()).rejects.toThrow('not ACTIVE');
  });
});

describe('order submission', () => {
  async function connected() {
    responder = () => ({ status: 200, body: { status: 'ACTIVE', trading_blocked: false, account_blocked: false } });
    const b = broker();
    await b.connect();
    calls = [];
    return b;
  }

  it('sends a day market order with the caller\'s id', async () => {
    const b = await connected();
    responder = () => ({ status: 200, body: ORDER });
    await b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 10, clientOrderId: 'e-AAA-1' });

    const sent = calls[0].body as Record<string, unknown>;
    expect(sent.type).toBe('market');
    expect(sent.side).toBe('buy');
    expect(sent.client_order_id).toBe('e-AAA-1');
    // Day only: a GTC order would outlive the session and keep working after
    // the engine has stopped managing it.
    expect(sent.time_in_force).toBe('day');
  });

  it('sends a limit order when a price is given', async () => {
    const b = await connected();
    responder = () => ({ status: 200, body: ORDER });
    await b.placeOrder({ symbol: 'AAA', side: 'SELL', quantity: 5, limitPrice: 9.5, clientOrderId: 'x-1' });
    const sent = calls[0].body as Record<string, unknown>;
    expect(sent.type).toBe('limit');
    expect(sent.limit_price).toBe('9.5');
  });

  it('reports a reused client id as a duplicate, not a generic failure', async () => {
    // These decide opposite actions: "already sent" means do nothing, "never
    // arrived" means retry.
    const b = await connected();
    responder = () => ({ status: 422, body: { message: 'client_order_id must be unique' } });
    await expect(
      b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 1, clientOrderId: 'dup' }),
    ).rejects.toThrow('duplicate order id');
  });

  it('refuses a non-positive quantity before sending anything', async () => {
    const b = await connected();
    await expect(
      b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 0, clientOrderId: 'z' }),
    ).rejects.toThrow('quantity must be positive');
    expect(calls).toHaveLength(0);
  });

  it('will not submit while disconnected', async () => {
    await expect(
      broker().placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 1, clientOrderId: 'z' }),
    ).rejects.toThrow('not connected');
  });
});

describe('status mapping', () => {
  async function orderWith(status: string, filled: string, qty = '10') {
    responder = () => ({ status: 200, body: { status: 'ACTIVE', trading_blocked: false, account_blocked: false } });
    const b = broker();
    await b.connect();
    responder = () => ({ status: 200, body: { ...ORDER, status, filled_qty: filled, qty, filled_avg_price: filled === '0' ? null : '10.5' } });
    return (await b.getOrder('e-AAA-1'))!;
  }

  it('maps the ordinary states', async () => {
    expect((await orderWith('filled', '10')).status).toBe('FILLED');
    expect((await orderWith('new', '0')).status).toBe('SUBMITTED');
    expect((await orderWith('accepted', '0')).status).toBe('SUBMITTED');
    expect((await orderWith('rejected', '0')).status).toBe('REJECTED');
    expect((await orderWith('canceled', '0')).status).toBe('CANCELLED');
  });

  it('calls a cancellation after a partial fill PARTIAL, not CANCELLED', async () => {
    // Shares are held. Reporting CANCELLED would tell the engine it owns
    // nothing while the account holds four shares.
    const o = await orderWith('canceled', '4');
    expect(o.status).toBe('PARTIAL');
    expect(o.filledQuantity).toBe(4);
  });

  it('treats done_for_day with no fill as cancelled', async () => {
    expect((await orderWith('done_for_day', '0')).status).toBe('CANCELLED');
    expect((await orderWith('done_for_day', '3')).status).toBe('PARTIAL');
  });

  it('parses the fill price and quantities', async () => {
    const o = await orderWith('filled', '10');
    expect(o.averageFillPrice).toBe(10.5);
    expect(o.requestedQuantity).toBe(10);
    expect(o.brokerOrderId).toBe('abc-123');
  });
});

describe('waitForFill', () => {
  it('returns once the order reaches a terminal state', async () => {
    responder = () => ({ status: 200, body: { status: 'ACTIVE', trading_blocked: false, account_blocked: false } });
    const b = broker();
    await b.connect();

    let polls = 0;
    responder = () => {
      polls += 1;
      const status = polls < 3 ? 'new' : 'filled';
      return { status: 200, body: { ...ORDER, status, filled_qty: polls < 3 ? '0' : '10', filled_avg_price: polls < 3 ? null : '10.5' } };
    };
    const settled = await b.waitForFill('e-AAA-1', 5_000);
    expect(settled?.status).toBe('FILLED');
    expect(polls).toBeGreaterThanOrEqual(3);
  });

  it('returns the working order on timeout rather than throwing', async () => {
    // Not-yet-filled is a fact the caller acts on, not an error.
    responder = () => ({ status: 200, body: { status: 'ACTIVE', trading_blocked: false, account_blocked: false } });
    const b = broker();
    await b.connect();
    responder = () => ({ status: 200, body: ORDER });
    const settled = await b.waitForFill('e-AAA-1', 900);
    expect(settled?.status).toBe('SUBMITTED');
  });
});

describe('the cost model', () => {
  it('charges nothing on Alpaca', () => {
    expect(estimateCommission(100, 5, ZERO_COMMISSION)).toBe(0);
    expect(estimateCommission(1, 20, ZERO_COMMISSION)).toBe(0);
  });

  it('is the whole point: IBKR charges 2% round trip on a $20 position', () => {
    const ibkr = estimateCommission(1, 20, DEFAULT_TRADER_CONFIG.costs) * 2;
    const alpaca = estimateCommission(1, 20, ZERO_COMMISSION) * 2;
    expect(ibkr / 20).toBeCloseTo(0.02, 4);
    expect(alpaca).toBe(0);
  });
});

describe('transient failure at startup', () => {
  async function connected(b = broker()) {
    responder = () => ({ status: 200, body: { status: 'ACTIVE', trading_blocked: false, account_blocked: false } });
    await b.connect();
    calls = [];
    return b;
  }

  it('retries a dropped connection instead of killing the session', async () => {
    // The defect this guards: one failed /v2/positions during resume() ended
    // the process with "Fatal: fetch failed". resume() runs before the
    // engine's own failure handling exists, so nothing absorbed it.
    const b = await connected();
    let n = 0;
    responder = () => {
      n += 1;
      if (n < 3) return { status: 500, body: { message: 'upstream' } };
      return { status: 200, body: [] };
    };
    await expect(b.getPositions()).resolves.toEqual([]);
    expect(n).toBe(3);
  });

  it('does not retry a rejection that will never succeed', async () => {
    const b = await connected();
    let n = 0;
    responder = () => { n += 1; return { status: 403, body: { message: 'forbidden' } }; };
    await expect(b.getPositions()).rejects.toThrow('403');
    expect(n).toBe(1);
  });

  it('gives up after the attempt budget', async () => {
    const b = await connected(new AlpacaBroker({ keyId: 'k', secretKey: 's', isLive: false, maxRetries: 3, retryBaseMs: 1 }));
    let n = 0;
    responder = () => { n += 1; return { status: 503, body: {} }; };
    await expect(b.getPositions()).rejects.toThrow('503');
    expect(n).toBe(3);
  });
});

describe('retrying an order submission', () => {
  async function connected() {
    responder = () => ({ status: 200, body: { status: 'ACTIVE', trading_blocked: false, account_blocked: false } });
    const b = new AlpacaBroker({ keyId: 'k', secretKey: 's', isLive: false, maxRetries: 4, retryBaseMs: 1 });
    await b.connect();
    calls = [];
    return b;
  }

  it('treats a duplicate on a RETRY as confirmation the order landed', async () => {
    // The dangerous case. A network failure on POST is ambiguous: the order
    // may have reached the exchange with only the reply lost. Resending the
    // same client_order_id either succeeds or returns 422 duplicate — and the
    // duplicate proves the first attempt worked, so the order is fetched
    // rather than reported as a failure.
    const b = await connected();
    let n = 0;
    responder = (url) => {
      if (url.includes('by_client_order_id')) {
        return { status: 200, body: { ...ORDER, status: 'filled', filled_qty: '10', filled_avg_price: '10.5' } };
      }
      n += 1;
      if (n === 1) return { status: 500, body: { message: 'gateway' } };
      return { status: 422, body: { message: 'client_order_id must be unique' } };
    };

    const order = await b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 10, clientOrderId: 'e-AAA-1' });
    expect(order.status).toBe('FILLED');
    expect(order.filledQuantity).toBe(10);
  });

  it('still reports a caller-reused id as a duplicate on the FIRST attempt', async () => {
    // Same broker response, opposite meaning: nothing of ours was in flight,
    // so this is the caller reusing an id and must not be swallowed.
    const b = await connected();
    responder = () => ({ status: 422, body: { message: 'client_order_id must be unique' } });
    await expect(
      b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 1, clientOrderId: 'dup' }),
    ).rejects.toThrow('duplicate order id');
  });

  it('does not submit twice when the first attempt succeeds', async () => {
    const b = await connected();
    let posts = 0;
    responder = (url) => {
      if (url.endsWith('/v2/orders')) posts += 1;
      return { status: 200, body: ORDER };
    };
    await b.placeOrder({ symbol: 'AAA', side: 'BUY', quantity: 10, clientOrderId: 'e-1' });
    expect(posts).toBe(1);
  });
});
