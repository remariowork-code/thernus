import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRedisClient } from '@shared/redis/client';
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
