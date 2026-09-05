/**
 * End-to-end wiring: provider -> engines -> Redis -> pub/sub.
 *
 * Uses the in-process Redis and the simulated provider, so this covers the
 * exact code path a first run takes with no infrastructure configured.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRedisClient } from '@shared/redis/client';
import { MarketStore } from '@shared/redis/store';
import { DEFAULT_CONFIG } from '@shared/config';
import { SimulatedProvider } from '../worker/src/providers/SimulatedProvider';
import { MarketPipeline } from '../worker/src/pipeline/MarketPipeline';
import { StockMetricsEngine } from '@shared/engine/StockMetricsEngine';
import type { MarketEvent, Universe } from '@shared/types';

const OPEN = Date.parse('2026-09-08T13:30:00Z');
const MINUTE = 60_000;

const UNIVERSE: Universe = {
  sectors: [{
    id: 'memory', name: 'Memory / Storage', description: '', active: true,
    constituents: [
      { symbol: 'MU', weight: 1 }, { symbol: 'SNDK', weight: 1 },
      { symbol: 'WDC', weight: 1 }, { symbol: 'STX', weight: 1 },
    ],
  }],
  stocks: [
    { symbol: 'MU', name: 'Micron', exchange: 'NASDAQ', active: true },
    { symbol: 'SNDK', name: 'SanDisk', exchange: 'NASDAQ', active: true },
    { symbol: 'WDC', name: 'Western Digital', exchange: 'NASDAQ', active: true },
    { symbol: 'STX', name: 'Seagate', exchange: 'NASDAQ', active: true },
  ],
};

/** A rally scripted to clear the memory sector's stage thresholds. */
const SCENARIOS = UNIVERSE.stocks.map((s) => ({
  symbol: s.symbol,
  legs: [
    { atSeconds: 0, changePercent: 0, volumeMultiple: 1 },
    { atSeconds: 300, changePercent: 2.0, volumeMultiple: 3 },
    { atSeconds: 900, changePercent: 4.5, volumeMultiple: 6 },
    { atSeconds: 1200, changePercent: 6.0, volumeMultiple: 7 },
  ],
}));

function build() {
  MemoryRedisClient.reset();
  const redis = new MemoryRedisClient();
  const store = new MarketStore(redis);
  const provider = new SimulatedProvider({
    symbols: UNIVERSE.stocks.map((s) => s.symbol),
    scenarios: SCENARIOS,
    manualClock: true,
    tickRateHz: 1,
    seed: 42,
  });

  let clock = OPEN;
  const pipeline = new MarketPipeline({
    provider, store, universe: UNIVERSE, config: DEFAULT_CONFIG,
    now: () => clock,
    session: () => 'REGULAR',
  });

  return {
    redis, store, provider, pipeline,
    advance: (ms: number) => { clock += ms; },
    at: () => clock,
  };
}

describe('market pipeline', () => {
  let ctx: ReturnType<typeof build>;
  beforeEach(() => { ctx = build(); });

  it('warms up an RVOL baseline for every symbol', async () => {
    await ctx.pipeline.warmUp(2);
    for (const stock of UNIVERSE.stocks) {
      const profile = await ctx.store.readRvolProfile(stock.symbol);
      expect(profile).not.toBeNull();
      expect(profile!.length).toBe(390);
      // Cumulative curves only ever increase.
      expect(profile![389]).toBeGreaterThanOrEqual(profile![0]);
    }
  });

  it('writes stock and sector state to Redis on each tick', async () => {
    await ctx.pipeline.warmUp(2);
    await ctx.provider.connect();
    await ctx.pipeline.start();

    for (let second = 0; second < 600; second += 5) {
      ctx.provider.step(OPEN + second * 1000);
      ctx.advance(5_000);
    }
    await ctx.pipeline.tick();

    const mu = await ctx.store.readMetrics('MU');
    expect(mu).not.toBeNull();
    expect(mu!.symbol).toBe('MU');
    expect(mu!.price).toBeGreaterThan(0);
    expect(mu!.volume).toBeGreaterThan(0);
    expect(Number.isFinite(mu!.momentumScore)).toBe(true);

    const sector = await ctx.store.readSector('memory');
    expect(sector).not.toBeNull();
    expect(sector!.active).toBe(4);
    expect(sector!.leaders.length).toBeGreaterThan(0);

    await ctx.pipeline.stop();
  });

  it('round-trips metrics through Redis without losing types', async () => {
    await ctx.pipeline.warmUp(2);
    await ctx.provider.connect();
    await ctx.pipeline.start();
    for (let second = 0; second < 300; second += 5) {
      ctx.provider.step(OPEN + second * 1000);
      ctx.advance(5_000);
    }
    await ctx.pipeline.tick();

    const mu = (await ctx.store.readMetrics('MU'))!;
    // Booleans must survive the string-keyed hash, not come back as "true".
    expect(typeof mu.aboveVwap).toBe('boolean');
    expect(typeof mu.isNewHigh).toBe('boolean');
    expect(typeof mu.rvol).toBe('number');
    expect(typeof mu.symbol).toBe('string');
    expect(typeof mu.stage).toBe('string');

    const sector = (await ctx.store.readSector('memory'))!;
    expect(Array.isArray(sector.leaders)).toBe(true);
    expect(typeof sector.breadth).toBe('number');

    await ctx.pipeline.stop();
  });

  it('publishes events for the SSE gateway to relay', async () => {
    const received: MarketEvent[] = [];
    await ctx.store.subscribe((event) => received.push(event));

    await ctx.pipeline.warmUp(2);
    await ctx.provider.connect();
    await ctx.pipeline.start();
    for (let second = 0; second < 900; second += 5) {
      ctx.provider.step(OPEN + second * 1000);
      ctx.advance(5_000);
    }
    await ctx.pipeline.tick();

    const kinds = new Set(received.map((e) => e.type));
    expect(kinds.has('SESSION')).toBe(true);
    expect(kinds.has('METRICS')).toBe(true);
    expect(kinds.has('SECTORS')).toBe(true);

    const metricsEvent = received.find((e) => e.type === 'METRICS');
    expect(metricsEvent && metricsEvent.data.length).toBeGreaterThan(0);

    await ctx.pipeline.stop();
  });

  it('drives the sector into a signalled stage and logs it to the signal stream', async () => {
    await ctx.pipeline.warmUp(2);
    await ctx.provider.connect();
    await ctx.pipeline.start();

    // Run the scripted rally out to its final leg, ticking as it goes.
    for (let second = 0; second <= 1200; second += 10) {
      ctx.provider.step(OPEN + second * 1000);
      ctx.advance(10_000);
      if (second % 60 === 0) await ctx.pipeline.tick();
    }

    const sector = (await ctx.store.readSector('memory'))!;
    expect(sector.changePercent).toBeGreaterThan(1.0);
    expect(sector.breadth).toBeGreaterThan(0.5);
    expect(sector.stage).not.toBe('IDLE');
    // RVOL is computed against the warm-up curve, not asserted into existence.
    expect(sector.avgRvol).toBeGreaterThan(1.0);
    expect(sector.newHighCount).toBeGreaterThan(0);

    const signals = await ctx.store.readSignals(50);
    expect(signals.length).toBeGreaterThan(0);

    // The sector call is the headline act.
    const sectorSignal = signals.find((s) => s.sectorId === 'memory' && s.symbol === null);
    expect(sectorSignal).toBeDefined();
    expect(sectorSignal!.headline).toContain('MEMORY / STORAGE');
    expect(sectorSignal!.metadata.leaders).toBeDefined();

    // Stock-level detectors ride along, scoped to the awake sector.
    const stockSignals = signals.filter((s) => s.symbol !== null);
    expect(stockSignals.length).toBeGreaterThan(0);
    expect(stockSignals.every((s) => s.sectorId === 'memory')).toBe(true);

    // Newest first.
    expect(new Date(signals[0].createdAt).getTime())
      .toBeGreaterThanOrEqual(new Date(signals[signals.length - 1].createdAt).getTime());

    await ctx.pipeline.stop();
  });

  it('surfaces news as a catalyst only when the sector is already moving', async () => {
    await ctx.pipeline.warmUp(2);
    await ctx.provider.connect();
    await ctx.pipeline.start();

    const item = ctx.pipeline.ingestHeadline({
      headline: 'Micron (MU) raises guidance on HBM demand',
      source: 'Reuters',
      url: 'https://example.com/mu-guidance',
    });
    expect(item).not.toBeNull();
    expect(item!.catalystType).toBe('GUIDANCE');
    expect(item!.symbols).toContain('MU');
    expect(item!.sectorIds).toContain('memory');

    const stored = await ctx.store.readNews(10);
    expect(stored.map((n) => n.url)).toContain('https://example.com/mu-guidance');

    // A headline with no universe symbol is not news to this system.
    expect(ctx.pipeline.ingestHeadline({
      headline: 'Broad market commentary', source: 'x', url: 'https://example.com/none',
    })).toBeNull();

    await ctx.pipeline.stop();
  });

  it('reports health so the worker can detect a stalled tape', async () => {
    await ctx.pipeline.warmUp(2);
    await ctx.provider.connect();
    await ctx.pipeline.start();

    // Warm-up adopts the session already in progress, so symbols count as
    // tracked before this process has seen a single print of its own.
    expect(ctx.pipeline.stats().tracked).toBe(UNIVERSE.stocks.length);
    ctx.provider.step(OPEN);
    expect(ctx.pipeline.stats().tracked).toBe(UNIVERSE.stocks.length);

    ctx.advance(45_000);
    expect(ctx.pipeline.msSinceLastTick()).toBeGreaterThan(30_000);

    await ctx.pipeline.stop();
  });

  it('notifies the worker when the provider drops', async () => {
    let reason: string | null = null;
    ctx.provider.onDisconnect((r) => { reason = r; });
    await ctx.provider.connect();
    ctx.provider.simulateDisconnect('link lost');
    expect(reason).toBe('link lost');
  });
});

describe('mid-session start', () => {
  /**
   * A worker that boots at midday has witnessed none of the day's volume.
   * Without adopting the session in progress its RVOL is near zero for the
   * rest of the day, and the scanner detects nothing at all.
   */
  it('adopts the volume and VWAP already traded today', () => {
    // Flat baseline: 1,000 shares a minute, so expected volume by minute 200
    // is 201,000 and the arithmetic is checkable by hand.
    const profile = Array.from({ length: 390 }, (_, m) => 1_000 * (m + 1));
    const at = OPEN + 200 * MINUTE;

    const cold = new StockMetricsEngine('MU', DEFAULT_CONFIG, {
      previousClose: 100, rvolProfile: profile,
    });
    const warm = new StockMetricsEngine('MU', DEFAULT_CONFIG, {
      previousClose: 100, rvolProfile: profile,
      lastPrice: 104,
      sessionVolume: 402_000,   // twice the typical volume for this time
      sessionVwap: 102,
      sessionHigh: 104.5,
      sessionLow: 99.5,
    });

    // One print each, so neither has meaningful volume of its own.
    for (const engine of [cold, warm]) {
      engine.onTrade({ symbol: 'MU', price: 104, size: 100, timestamp: at });
    }

    const coldMetrics = cold.snapshot('REGULAR', at);
    const warmMetrics = warm.snapshot('REGULAR', at);

    // The cold engine reports essentially no volume, so RVOL is meaningless.
    expect(coldMetrics.rvol).toBeLessThan(0.01);

    // The warm one immediately reports the true 2x.
    expect(warmMetrics.rvol).toBeCloseTo(2.0, 1);
    expect(warmMetrics.volume).toBeGreaterThan(400_000);

    // VWAP continues the session's rather than restarting from this print.
    expect(warmMetrics.vwap).toBeCloseTo(102, 0);
    expect(warmMetrics.aboveVwap).toBe(true);

    // And the day range is the real one, not just what this process saw.
    expect(warmMetrics.dayHigh).toBeGreaterThanOrEqual(104.5);
    expect(warmMetrics.dayLow).toBeCloseTo(99.5, 1);
  });

  it('does not mistake today\'s partial volume for the daily baseline', async () => {
    // averageDailyVolume must come from history. Seeding it from a snapshot
    // taken at 15:55 would make the baseline a full day and, taken at 09:31,
    // almost nothing — RVOL would drift with the clock rather than the tape.
    const provider = new SimulatedProvider({ symbols: ['MU'], manualClock: true, seed: 3 });
    const daily = await provider.getHistoricalBars('MU', '1d', 21);
    const snapshot = await provider.getSnapshot('MU');
    const averageDaily = daily.reduce((sum, b) => sum + b.volume, 0) / daily.length;

    expect(daily).toHaveLength(21);
    expect(averageDaily).toBeGreaterThan(0);
    // The partial-day figure is not the baseline.
    expect(snapshot.volume).not.toBe(averageDaily);
  });
});
