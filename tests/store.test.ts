import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRedisClient } from '@shared/redis/client';
import { isUnencryptedRemote } from '@shared/redis';
import { MarketStore } from '@shared/redis/store';

describe('sector score history', () => {
  let store: MarketStore;
  let redis: MemoryRedisClient;

  beforeEach(() => {
    MemoryRedisClient.reset();
    redis = new MemoryRedisClient();
    store = new MarketStore(redis);
  });

  const write = async (ts: number, score: number) => {
    await redis.zadd('sector:s:history', ts, `${ts}:${score}`);
  };

  it('returns the newest sample at or before the lookback', async () => {
    const now = 1_700_000_000_000;
    await write(now - 600_000, 20);
    await write(now - 300_000, 40);
    await write(now - 60_000, 70);
    expect(await store.readHistoricalScore('s', 5 * 60_000, now)).toBe(40);
  });

  /**
   * Regression: with less than the full lookback of history the reader
   * returned null, so acceleration was pinned at zero for the worker's first
   * five minutes — blinding the ranking exactly when detecting a move early
   * matters most.
   */
  it('falls back to the oldest sample when the full lookback is unavailable', async () => {
    const now = 1_700_000_000_000;
    await write(now - 120_000, 25);
    await write(now - 30_000, 60);
    expect(await store.readHistoricalScore('s', 5 * 60_000, now)).toBe(25);
  });

  it('still returns null when history is too short to mean anything', async () => {
    const now = 1_700_000_000_000;
    await write(now - 5_000, 25);
    expect(await store.readHistoricalScore('s', 5 * 60_000, now)).toBeNull();
  });

  it('returns null with no history at all', async () => {
    expect(await store.readHistoricalScore('s', 5 * 60_000)).toBeNull();
  });
});

describe('metric round-trip', () => {
  beforeEach(() => MemoryRedisClient.reset());

  it('preserves booleans, numbers and nested arrays through the hash', async () => {
    const store = new MarketStore(new MemoryRedisClient());
    await store.writeSector({
      sectorId: 'semis', sectorName: 'AI / Semiconductors',
      score: 82.5, changePercent: 3.4, breadth: 0.8, advancing: 8, active: 10,
      avgRvol: 2.8, avgMomentum: 79, aboveVwapCount: 8, newHighCount: 3,
      volumeAcceleration: 2.1, acceleration: 18, strongLeaderCount: 4,
      leaders: [{ symbol: 'MU', changePercent: 5.8, rvol: 3.4, momentumScore: 95, isNewHigh: true }],
      stage: 'BREAKOUT', updatedAt: 1_700_000_000_000,
    });

    const read = (await store.readSector('semis'))!;
    expect(read.score).toBeCloseTo(82.5, 6);
    expect(read.stage).toBe('BREAKOUT');
    expect(read.sectorName).toBe('AI / Semiconductors');
    expect(read.leaders).toHaveLength(1);
    expect(read.leaders[0].isNewHigh).toBe(true);
    expect(typeof read.leaders[0].momentumScore).toBe('number');
  });
});

describe('data provenance', () => {
  beforeEach(() => MemoryRedisClient.reset());

  /**
   * The web app never speaks to a market data vendor, so its own environment
   * says nothing about where the numbers came from. Provenance is reported by
   * the worker, and unknown provenance must read as simulated — claiming live
   * data wrongly is far worse than the reverse.
   */
  it('round-trips what the worker reported', async () => {
    const store = new MarketStore(new MemoryRedisClient());
    expect(await store.readProviderInfo()).toBeNull();

    await store.writeProviderInfo({
      providerName: 'POLYGON', simulated: false, startedAt: 1_700_000_000_000,
    });
    const live = (await store.readProviderInfo())!;
    expect(live.providerName).toBe('POLYGON');
    expect(live.simulated).toBe(false);

    await store.writeProviderInfo({
      providerName: 'SIMULATED', simulated: true, startedAt: 1_700_000_000_000,
    });
    expect((await store.readProviderInfo())!.simulated).toBe(true);
  });

  it('treats a malformed or absent record as simulated', async () => {
    const redis = new MemoryRedisClient();
    const store = new MarketStore(redis);

    // Nothing written at all.
    expect(await store.readProviderInfo()).toBeNull();

    // A record missing the flag must not be read as live.
    await redis.hset('market:provider', { providerName: 'MYSTERY' });
    expect((await store.readProviderInfo())!.simulated).toBe(true);
  });
});

describe('connection safety', () => {
  /**
   * Regression: this used to construct a real client to observe a console
   * warning, which opened a socket to a non-existent host. That is slow, and
   * it made the result depend on how the runner resolves DNS — it passed on a
   * laptop and failed on a CI runner.
   */
  it('flags a plain redis:// endpoint on a remote host', () => {
    expect(isUnencryptedRemote('redis://default:secret@example.db.redis.io:17732')).toBe(true);
    expect(isUnencryptedRemote('redis://example.com:6379')).toBe(true);
  });

  it('accepts TLS endpoints', () => {
    expect(isUnencryptedRemote('rediss://default:x@host.upstash.io:6379')).toBe(false);
  });

  it('accepts local endpoints, with or without credentials', () => {
    for (const url of [
      'redis://127.0.0.1:6379',
      'redis://localhost:6379',
      'redis://default:x@localhost:6379',
      'redis://[::1]:6379',
    ]) {
      expect(isUnencryptedRemote(url)).toBe(false);
    }
  });

  it('does not flag a malformed URL, which fails at connect time instead', () => {
    expect(isUnencryptedRemote('not-a-url')).toBe(false);
  });
});

describe('pruning state after the universe changes', () => {
  beforeEach(() => MemoryRedisClient.reset());

  /**
   * Regression: narrowing UNIVERSE_SECTORS left the dropped symbols in Redis
   * for the rest of their 24-hour TTL, and the dashboard rendered those frozen
   * figures as current — worse than showing nothing.
   */
  it('removes symbols and sectors that are no longer scanned', async () => {
    const redis = new MemoryRedisClient();
    const store = new MarketStore(redis);

    const write = async (symbol: string) => {
      await redis.hset(`metrics:${symbol}`, { symbol, price: 100 });
      await redis.hset(`quote:${symbol}`, { bidPrice: 99 });
      await redis.hset(`rvol_profile:${symbol}`, { '0': 1000 });
      await redis.zadd(`bars:${symbol}:1m`, 1, 'x');
    };
    await write('MU');
    await write('NVDA');
    await redis.hset('sector:semiconductors:metrics', { sectorId: 'semiconductors' });
    await redis.zadd('sector:semiconductors:leaders', 90, 'MU');
    await redis.hset('sector:memory:metrics', { sectorId: 'memory' });

    // The new universe keeps MU and memory, drops NVDA and semiconductors.
    const pruned = await store.pruneStaleState(['MU'], ['memory']);

    expect(pruned).toEqual({ symbols: 1, sectors: 1 });
    expect(await store.readMetrics('MU')).not.toBeNull();
    expect(await store.readMetrics('NVDA')).toBeNull();
    expect(await store.readSector('memory')).not.toBeNull();
    expect(await store.readSector('semiconductors')).toBeNull();

    // Every satellite key for the dropped symbol goes too, not just metrics.
    expect(await redis.hgetall('quote:NVDA')).toEqual({});
    expect(await redis.hgetall('rvol_profile:NVDA')).toEqual({});
    expect(await redis.zrange('bars:NVDA:1m', 0, -1)).toEqual([]);
    // ...and the surviving symbol keeps its own.
    expect(await redis.hgetall('quote:MU')).not.toEqual({});
  });

  it('is a no-op when nothing has changed', async () => {
    const redis = new MemoryRedisClient();
    const store = new MarketStore(redis);
    await redis.hset('metrics:MU', { symbol: 'MU' });
    await redis.hset('sector:memory:metrics', { sectorId: 'memory' });

    expect(await store.pruneStaleState(['MU'], ['memory'])).toEqual({ symbols: 0, sectors: 0 });
    expect(await store.readMetrics('MU')).not.toBeNull();
  });
});

describe('signal feed is scoped to the trading day', () => {
  beforeEach(() => MemoryRedisClient.reset());

  /**
   * Regression: the stream is capped by length, not age, so signals from a
   * previous session survived into the next and the live feed presented them
   * as current — a Friday close appearing at Tuesday's open.
   */
  it('excludes signals from earlier trading days', async () => {
    const redis = new MemoryRedisClient();
    const store = new MarketStore(redis);

    const at = (iso: string, id: string) => ({
      id, symbol: null, sectorId: 'memory', sectorName: 'Memory', type: 'SECTOR_AWAKENING',
      severity: 'INFO', score: 50, triggerValue: 1, previousValue: null,
      headline: `signal ${id}`, metadata: {}, createdAt: iso,
    });

    // 14:00 UTC is 10:00 New York on both dates, so neither is a boundary case.
    await store.appendSignal(at('2026-09-04T14:00:00Z', 'friday') as never);
    await store.appendSignal(at('2026-09-08T14:00:00Z', 'tuesday') as never);

    const now = Date.parse('2026-09-08T15:00:00Z');
    const signals = await store.readSignals(50, false, now);

    expect(signals.map((s) => s.id)).toEqual(['tuesday']);
  });

  it('keeps every signal from the current day, newest first', async () => {
    const redis = new MemoryRedisClient();
    const store = new MarketStore(redis);
    for (const hour of ['14', '15', '16']) {
      await store.appendSignal({
        id: hour, symbol: null, sectorId: 'm', sectorName: 'M', type: 'SECTOR_AWAKENING',
        severity: 'INFO', score: 1, triggerValue: 1, previousValue: null,
        headline: hour, metadata: {}, createdAt: `2026-09-08T${hour}:00:00Z`,
      } as never);
    }
    const signals = await store.readSignals(50, false, Date.parse('2026-09-08T17:00:00Z'));
    expect(signals.map((s) => s.id)).toEqual(['16', '15', '14']);
  });
});
