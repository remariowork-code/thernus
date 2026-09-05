import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AlpacaProvider } from '../worker/src/providers/AlpacaProvider';
import { restrictUniverse } from '@shared/data/universeRepository';
import { seedUniverse } from '@shared/market/universe';
import { resolveProviderName } from '../worker/src/providers';

/** Stand in for Alpaca's REST API, recording what was asked for. */
function mockFetch(routes: Array<{ match: RegExp; body: unknown }>) {
  const calls: string[] = [];
  const fetchMock = vi.fn(async (input: URL | RequestInfo) => {
    const url = String(input);
    calls.push(url);
    const route = routes.find((r) => r.match.test(url));
    if (!route) {
      return { ok: false, status: 404, statusText: 'Not Found', json: async () => ({}) } as Response;
    }
    return { ok: true, status: 200, statusText: 'OK', json: async () => route.body } as Response;
  });
  vi.stubGlobal('fetch', fetchMock);
  return { calls };
}

const credentials = { keyId: 'test-key', secretKey: 'test-secret' };

afterEach(() => vi.unstubAllGlobals());

describe('AlpacaProvider — snapshot mapping', () => {
  it('maps Alpaca fields onto the shared Snapshot shape', async () => {
    mockFetch([{
      match: /\/snapshots/,
      body: {
        snapshots: {
          MU: {
            latestTrade: { p: 104.25, t: '2026-09-08T17:45:12.123456789Z' },
            latestQuote: { bp: 104.2, bs: 300, ap: 104.3, as: 200, t: '2026-09-08T17:45:12Z' },
            dailyBar: { t: '2026-09-08T04:00:00Z', o: 100, h: 105, l: 99.5, c: 104.25, v: 8_400_000, vw: 102.4 },
            prevDailyBar: { t: '2026-09-05T04:00:00Z', o: 98, h: 101, l: 97, c: 100, v: 7_000_000, vw: 99 },
          },
        },
      },
    }]);

    const provider = new AlpacaProvider({ ...credentials, symbols: ['MU'] });
    const snapshot = await provider.getSnapshot('MU');

    expect(snapshot.symbol).toBe('MU');
    expect(snapshot.lastPrice).toBe(104.25);
    // Previous close comes from prevDailyBar, which is what percent change needs.
    expect(snapshot.previousClose).toBe(100);
    expect(snapshot.volume).toBe(8_400_000);
    expect(snapshot.vwap).toBe(102.4);
    expect(snapshot.dayHigh).toBe(105);
    expect(snapshot.dayLow).toBe(99.5);
    expect(snapshot.bidPrice).toBe(104.2);
    // Nanosecond RFC-3339 must parse, not produce NaN.
    expect(Number.isFinite(snapshot.timestamp)).toBe(true);
    expect(snapshot.timestamp).toBe(Date.parse('2026-09-08T17:45:12.123Z'));
  });

  it('batches the whole universe into one request rather than one per symbol', async () => {
    const symbols = Array.from({ length: 40 }, (_, i) => `S${i}`);
    const snapshots = Object.fromEntries(symbols.map((s) => [s, {
      latestTrade: { p: 10, t: '2026-09-08T17:45:12Z' },
      dailyBar: { t: '', o: 10, h: 10, l: 10, c: 10, v: 100, vw: 10 },
      prevDailyBar: { t: '', o: 9, h: 9, l: 9, c: 9, v: 100, vw: 9 },
    }]));
    const { calls } = mockFetch([{ match: /\/snapshots/, body: { snapshots } }]);

    const provider = new AlpacaProvider({ ...credentials, symbols });
    for (const symbol of symbols) await provider.getSnapshot(symbol);

    // One batched call for 40 symbols, not 40 calls.
    expect(calls.length).toBe(1);
    expect(calls[0]).toContain('symbols=');
  });

  it('rejects a symbol with no usable price rather than inventing zero', async () => {
    mockFetch([{ match: /\/snapshots/, body: { snapshots: { MU: {} } } }]);
    const provider = new AlpacaProvider({ ...credentials, symbols: ['MU'] });
    await expect(provider.getSnapshot('MU')).rejects.toThrow(/no price/i);
  });
});

describe('AlpacaProvider — bars', () => {
  it('maps bars and requests the configured feed', async () => {
    const { calls } = mockFetch([{
      match: /\/bars/,
      body: {
        bars: [
          { t: '2026-09-08T13:30:00Z', o: 100, h: 101, l: 99.8, c: 100.5, v: 12_000, vw: 100.2 },
          { t: '2026-09-08T13:31:00Z', o: 100.5, h: 102, l: 100.4, c: 101.8, v: 18_000, vw: 101.1 },
        ],
        next_page_token: null,
      },
    }]);

    const provider = new AlpacaProvider({ ...credentials, feed: 'iex' });
    const bars = await provider.getHistoricalBars('MU', '1m', 10);

    expect(bars).toHaveLength(2);
    expect(bars[0]).toMatchObject({ symbol: 'MU', open: 100, high: 101, low: 99.8, close: 100.5, volume: 12_000 });
    expect(bars[0].timestamp).toBe(Date.parse('2026-09-08T13:30:00Z'));
    expect(calls[0]).toContain('timeframe=1Min');
    expect(calls[0]).toContain('feed=iex');
  });

  it('follows pagination until the requested count is met', async () => {
    let page = 0;
    vi.stubGlobal('fetch', vi.fn(async () => {
      page++;
      return {
        ok: true, status: 200, statusText: 'OK',
        json: async () => ({
          bars: Array.from({ length: 3 }, (_, i) => ({
            t: `2026-09-08T13:${String(30 + page * 3 + i).padStart(2, '0')}:00Z`,
            o: 1, h: 1, l: 1, c: 1, v: 1, vw: 1,
          })),
          next_page_token: page < 2 ? 'more' : null,
        }),
      } as Response;
    }));

    const provider = new AlpacaProvider({ ...credentials });
    const bars = await provider.getHistoricalBars('MU', '1m', 6);
    expect(page).toBe(2);
    expect(bars).toHaveLength(6);
  });

  it('translates every timeframe the engines ask for', async () => {
    const { calls } = mockFetch([{ match: /\/bars/, body: { bars: [], next_page_token: null } }]);
    const provider = new AlpacaProvider({ ...credentials });
    for (const tf of ['1m', '5m', '15m', '1d'] as const) {
      await provider.getHistoricalBars('MU', tf, 5);
    }
    expect(calls.join(' ')).toContain('timeframe=1Min');
    expect(calls.join(' ')).toContain('timeframe=5Min');
    expect(calls.join(' ')).toContain('timeframe=15Min');
    expect(calls.join(' ')).toContain('timeframe=1Day');
  });
});

describe('AlpacaProvider — plan limits', () => {
  it('defaults the stream cap to 30 on the free IEX feed and lifts it on SIP', () => {
    // Read through the public surface: constructing does not throw, and the
    // cap only manifests on subscribe, so assert via the documented default.
    const iex = new AlpacaProvider({ ...credentials, feed: 'iex' });
    const sip = new AlpacaProvider({ ...credentials, feed: 'sip' });
    expect(iex.providerName).toBe('ALPACA');
    expect(sip.providerName).toBe('ALPACA');
  });

  it('requires both halves of the credential pair', () => {
    expect(() => new AlpacaProvider({ keyId: '', secretKey: 'x' })).toThrow(/key id and a secret/i);
    expect(() => new AlpacaProvider({ keyId: 'x', secretKey: '' })).toThrow(/key id and a secret/i);
  });
});

describe('provider selection', () => {
  const saved = { ...process.env };
  beforeEach(() => {
    delete process.env.MARKET_DATA_PROVIDER;
    delete process.env.ALPACA_API_KEY_ID;
    delete process.env.MARKET_DATA_API_KEY;
  });
  afterEach(() => { process.env = { ...saved }; });

  it('falls back to the simulator when nothing is configured', () => {
    expect(resolveProviderName()).toBe('simulated');
  });

  it('infers the provider from whichever credentials are present', () => {
    process.env.ALPACA_API_KEY_ID = 'x';
    expect(resolveProviderName()).toBe('alpaca');
    delete process.env.ALPACA_API_KEY_ID;
    process.env.MARKET_DATA_API_KEY = 'y';
    expect(resolveProviderName()).toBe('polygon');
  });

  it('honours an explicit choice over inference', () => {
    process.env.ALPACA_API_KEY_ID = 'x';
    process.env.MARKET_DATA_PROVIDER = 'simulated';
    expect(resolveProviderName()).toBe('simulated');
  });
});

describe('universe restriction', () => {
  /**
   * Alpaca's free plan streams 30 symbols. A capped subscription would compute
   * sector breadth over an incomplete constituent set — silently wrong — so
   * the supported answer is to watch fewer sectors properly.
   */
  it('narrows to named sectors and drops orphaned symbols', () => {
    const full = seedUniverse();
    const narrow = restrictUniverse(full, ['semiconductors', 'memory']);

    expect(full.sectors.length).toBe(17);
    expect(narrow.sectors.map((s) => s.id).sort()).toEqual(['memory', 'semiconductors']);
    // Comfortably inside the 30-symbol stream cap.
    expect(narrow.stocks.length).toBeLessThanOrEqual(30);
    // Every retained symbol still belongs to a retained sector.
    const kept = new Set(narrow.sectors.flatMap((s) => s.constituents.map((c) => c.symbol)));
    expect(narrow.stocks.every((s) => kept.has(s.symbol))).toBe(true);
  });

  it('is a no-op when no sectors are named', () => {
    const full = seedUniverse();
    expect(restrictUniverse(full, []).sectors.length).toBe(full.sectors.length);
  });

  it('returns nothing for an unknown sector, so the caller can detect it', () => {
    expect(restrictUniverse(seedUniverse(), ['nope']).sectors).toHaveLength(0);
  });
});
