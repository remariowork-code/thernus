/**
 * The Redis key schema, in one place.
 *
 * Redis holds everything that changes faster than a human can read it. Postgres
 * only ever sees discrete, meaningful events. No engine composes a key string
 * itself — they all go through here, so the schema below is the whole contract.
 *
 *   quote:{SYMBOL}              Hash    last price, bid/ask, volume, vwap, high/low   TTL 24h
 *   metrics:{SYMBOL}            Hash    computed indicators (1m/5m/15m, RVOL, score)  TTL 24h
 *   bars:{SYMBOL}:1m            ZSET    score=ts, member=ts:O:H:L:C:V:VWAP   cap 390
 *   bars:{SYMBOL}:5m            ZSET    same shape                           cap 78
 *   rvol_profile:{SYMBOL}       Hash    minute-of-session -> expected cum volume  TTL 7d
 *   sector:{SECTOR_ID}:metrics  Hash    breadth, avg RVOL, score, stage
 *   sector:{SECTOR_ID}:leaders  ZSET    score=momentum, member=symbol
 *   sector:{SECTOR_ID}:history  ZSET    score=ts, member=ts:score   (drives acceleration)
 *   signals:latest              Stream  capped signal log
 *   signals:critical            Stream  HIGH/CRITICAL only, so the UI can hydrate fast
 *   news:latest                 Stream  recent classified headlines
 *   market:session              String  current session label
 *   market:provider             Hash    which provider the worker actually used
 *   market:events               PubSub  worker -> SSE gateway broadcast
 */

import type {
  MarketEvent, NewsHeadline, SectorMetrics, Signal, StockMetrics, MarketSession,
} from '../types';
import { nyWallClock } from '../market/nyClock';
import type { RedisClient } from './client';

export const KEYS = {
  quote: (symbol: string) => `quote:${symbol}`,
  metrics: (symbol: string) => `metrics:${symbol}`,
  bars: (symbol: string, tf: '1m' | '5m') => `bars:${symbol}:${tf}`,
  rvolProfile: (symbol: string) => `rvol_profile:${symbol}`,
  sectorMetrics: (sectorId: string) => `sector:${sectorId}:metrics`,
  sectorLeaders: (sectorId: string) => `sector:${sectorId}:leaders`,
  sectorHistory: (sectorId: string) => `sector:${sectorId}:history`,
  signalsLatest: 'signals:latest',
  signalsCritical: 'signals:critical',
  newsLatest: 'news:latest',
  marketSession: 'market:session',
  marketProvider: 'market:provider',
  eventsChannel: 'market:events',
} as const;

const DAY_SECONDS = 24 * 60 * 60;
const WEEK_SECONDS = 7 * DAY_SECONDS;

/** Sector score samples retained — 5 minutes of acceleration lookback plus slack. */
const SECTOR_HISTORY_CAP = 600;

export class MarketStore {
  constructor(
    private readonly redis: RedisClient,
    private readonly limits = {
      bars1m: 390,
      bars5m: 78,
      signalStreamMaxLen: 10_000,
    },
  ) {}

  // -------------------------------------------------------------------------
  // Stock state
  // -------------------------------------------------------------------------

  async writeMetrics(metrics: StockMetrics): Promise<void> {
    const key = KEYS.metrics(metrics.symbol);
    await this.redis.hset(key, flatten(metrics));
    await this.redis.expire(key, DAY_SECONDS);
  }

  async readMetrics(symbol: string): Promise<StockMetrics | null> {
    const raw = await this.redis.hgetall(KEYS.metrics(symbol));
    if (!raw || Object.keys(raw).length === 0) return null;
    return inflate<StockMetrics>(raw);
  }

  async readManyMetrics(symbols: string[]): Promise<StockMetrics[]> {
    const results = await Promise.all(symbols.map((s) => this.readMetrics(s)));
    return results.filter((m): m is StockMetrics => m !== null);
  }

  /**
   * Drop state for symbols and sectors no longer being scanned.
   *
   * Keys carry a 24-hour TTL, so narrowing the universe would otherwise leave
   * yesterday's symbols in Redis for the rest of the day. The dashboard reads
   * whatever is there and would present those frozen figures as current, which
   * is worse than showing nothing.
   *
   * Safe because exactly one worker owns this Redis. Sharding the universe
   * across workers would need this to become scoped rather than absolute.
   */
  async pruneStaleState(
    activeSymbols: string[],
    activeSectorIds: string[],
  ): Promise<{ symbols: number; sectors: number }> {
    const keepSymbols = new Set(activeSymbols);
    const keepSectors = new Set(activeSectorIds);

    const metricKeys = await this.redis.keys('metrics:*');
    let symbols = 0;
    for (const key of metricKeys) {
      const symbol = key.slice('metrics:'.length);
      if (keepSymbols.has(symbol)) continue;
      await this.redis.del(key);
      await this.redis.del(KEYS.quote(symbol));
      await this.redis.del(KEYS.rvolProfile(symbol));
      await this.redis.del(KEYS.bars(symbol, '1m'));
      await this.redis.del(KEYS.bars(symbol, '5m'));
      symbols++;
    }

    const sectorKeys = await this.redis.keys('sector:*:metrics');
    let sectors = 0;
    for (const key of sectorKeys) {
      const id = key.slice('sector:'.length, -':metrics'.length);
      if (keepSectors.has(id)) continue;
      await this.redis.del(key);
      await this.redis.del(KEYS.sectorLeaders(id));
      await this.redis.del(KEYS.sectorHistory(id));
      sectors++;
    }

    return { symbols, sectors };
  }

  /** Every symbol currently carrying computed metrics. */
  async listMetricSymbols(): Promise<string[]> {
    const keys = await this.redis.keys('metrics:*');
    return keys.map((k) => k.slice('metrics:'.length));
  }

  async writeQuote(
    symbol: string,
    quote: Record<string, string | number>,
  ): Promise<void> {
    const key = KEYS.quote(symbol);
    await this.redis.hset(key, quote);
    await this.redis.expire(key, DAY_SECONDS);
  }

  async readQuote(symbol: string): Promise<Record<string, string>> {
    return this.redis.hgetall(KEYS.quote(symbol));
  }

  // -------------------------------------------------------------------------
  // Bars
  // -------------------------------------------------------------------------

  async appendBar(
    symbol: string,
    timeframe: '1m' | '5m',
    bar: { timestamp: number; open: number; high: number; low: number; close: number; volume: number; vwap: number },
  ): Promise<void> {
    const key = KEYS.bars(symbol, timeframe);
    const member = [bar.timestamp, bar.open, bar.high, bar.low, bar.close, bar.volume, bar.vwap].join(':');
    await this.redis.zadd(key, bar.timestamp, member);
    await this.redis.ztrim(key, timeframe === '1m' ? this.limits.bars1m : this.limits.bars5m);
    await this.redis.expire(key, DAY_SECONDS);
  }

  async readBars(
    symbol: string,
    timeframe: '1m' | '5m',
    count = 100,
  ): Promise<Array<{ timestamp: number; open: number; high: number; low: number; close: number; volume: number; vwap: number }>> {
    const members = await this.redis.zrange(KEYS.bars(symbol, timeframe), -count, -1);
    return members.map((m) => {
      const [timestamp, open, high, low, close, volume, vwap] = m.split(':').map(Number);
      return { timestamp, open, high, low, close, volume, vwap };
    });
  }

  // -------------------------------------------------------------------------
  // RVOL profile
  // -------------------------------------------------------------------------

  async writeRvolProfile(symbol: string, profile: number[]): Promise<void> {
    const key = KEYS.rvolProfile(symbol);
    const payload: Record<string, number> = {};
    profile.forEach((value, minute) => { payload[String(minute)] = value; });
    await this.redis.hset(key, payload);
    await this.redis.expire(key, WEEK_SECONDS);
  }

  async readRvolProfile(symbol: string, sessionMinutes = 390): Promise<number[] | null> {
    const raw = await this.redis.hgetall(KEYS.rvolProfile(symbol));
    if (!raw || Object.keys(raw).length === 0) return null;
    const profile = new Array<number>(sessionMinutes).fill(0);
    for (const [minute, value] of Object.entries(raw)) {
      const index = Number(minute);
      if (index >= 0 && index < sessionMinutes) profile[index] = Number(value);
    }
    return profile;
  }

  // -------------------------------------------------------------------------
  // Sector state
  // -------------------------------------------------------------------------

  async writeSector(metrics: SectorMetrics): Promise<void> {
    const { leaders, ...scalar } = metrics;
    await this.redis.hset(KEYS.sectorMetrics(metrics.sectorId), {
      ...flatten(scalar),
      leaders: JSON.stringify(leaders),
    });

    const leaderKey = KEYS.sectorLeaders(metrics.sectorId);
    await this.redis.del(leaderKey);
    for (const leader of leaders) {
      await this.redis.zadd(leaderKey, leader.momentumScore, leader.symbol);
    }

    const historyKey = KEYS.sectorHistory(metrics.sectorId);
    await this.redis.zadd(historyKey, metrics.updatedAt, `${metrics.updatedAt}:${metrics.score}`);
    await this.redis.ztrim(historyKey, SECTOR_HISTORY_CAP);
    await this.redis.expire(historyKey, DAY_SECONDS);
  }

  async readSector(sectorId: string): Promise<SectorMetrics | null> {
    const raw = await this.redis.hgetall(KEYS.sectorMetrics(sectorId));
    if (!raw || Object.keys(raw).length === 0) return null;
    const { leaders, ...rest } = raw;
    const metrics = inflate<SectorMetrics>(rest);
    metrics.leaders = leaders ? JSON.parse(leaders) : [];
    return metrics;
  }

  async readAllSectors(): Promise<SectorMetrics[]> {
    const keys = await this.redis.keys('sector:*:metrics');
    const ids = keys.map((k) => k.slice('sector:'.length, -':metrics'.length));
    const all = await Promise.all(ids.map((id) => this.readSector(id)));
    return all.filter((s): s is SectorMetrics => s !== null);
  }

  /**
   * The sector score as of `msAgo` milliseconds back, for the acceleration term.
   *
   * When the worker has not been running for the full lookback there is no
   * sample that old. Rather than reporting zero acceleration — which would
   * blind the ranking during exactly the first minutes of a session, when
   * detecting a move earliest matters most — the oldest available sample is
   * used, provided history spans at least `minSpanMs`. Below that the past is
   * genuinely unknown and null is returned.
   */
  async readHistoricalScore(
    sectorId: string,
    msAgo: number,
    now = Date.now(),
    minSpanMs = 45_000,
  ): Promise<number | null> {
    const members = await this.redis.zrange(KEYS.sectorHistory(sectorId), 0, -1);
    if (!members.length) return null;

    const samples = members
      .map((member) => {
        const [ts, score] = member.split(':').map(Number);
        return { ts, score };
      })
      .filter((sample) => Number.isFinite(sample.ts) && Number.isFinite(sample.score));
    if (!samples.length) return null;

    const cutoff = now - msAgo;
    let best: { ts: number; score: number } | null = null;
    for (const sample of samples) {
      if (sample.ts <= cutoff && (!best || sample.ts > best.ts)) best = sample;
    }
    if (best) return best.score;

    // Not enough history for the full window: fall back to the oldest sample.
    const oldest = samples.reduce((a, b) => (a.ts < b.ts ? a : b));
    return now - oldest.ts >= minSpanMs ? oldest.score : null;
  }

  // -------------------------------------------------------------------------
  // Signals & news
  // -------------------------------------------------------------------------

  async appendSignal(signal: Signal): Promise<void> {
    const payload = JSON.stringify(signal);
    await this.redis.xadd(KEYS.signalsLatest, payload, this.limits.signalStreamMaxLen);
    if (signal.severity === 'HIGH' || signal.severity === 'CRITICAL') {
      await this.redis.xadd(KEYS.signalsCritical, payload, 1_000);
    }
  }

  /**
   * Recent signals, scoped to the current trading day.
   *
   * The stream is capped by length, not by age, so yesterday's signals survive
   * into today and the live feed would present them as current — which is
   * exactly how a Friday close ends up on screen at Tuesday's open. History
   * belongs in Postgres; this feed is about now.
   */
  async readSignals(count = 50, criticalOnly = false, now = Date.now()): Promise<Signal[]> {
    const raw = await this.redis.xrevrange(
      criticalOnly ? KEYS.signalsCritical : KEYS.signalsLatest,
      // Over-fetch, because filtering by day may discard most of the window.
      count * 4,
    );

    const today = nyWallClock(now).dateKey;
    const signals: Signal[] = [];
    for (const entry of raw) {
      let signal: Signal;
      try {
        signal = JSON.parse(entry) as Signal;
      } catch {
        continue; // A malformed entry must not break the feed.
      }
      const at = Date.parse(signal.createdAt);
      if (!Number.isFinite(at)) continue;
      if (nyWallClock(at).dateKey !== today) continue;
      signals.push(signal);
      if (signals.length >= count) break;
    }
    return signals;
  }

  async appendNews(item: NewsHeadline): Promise<void> {
    await this.redis.xadd(KEYS.newsLatest, JSON.stringify(item), 500);
  }

  async readNews(count = 50): Promise<NewsHeadline[]> {
    const raw = await this.redis.xrevrange(KEYS.newsLatest, count);
    return raw.map((r) => JSON.parse(r) as NewsHeadline);
  }

  // -------------------------------------------------------------------------
  // Session & broadcast
  // -------------------------------------------------------------------------

  async writeSession(session: MarketSession): Promise<void> {
    await this.redis.set(KEYS.marketSession, session);
  }

  async readSession(): Promise<MarketSession | null> {
    return (await this.redis.get(KEYS.marketSession)) as MarketSession | null;
  }

  /**
   * Record which provider is actually feeding the system.
   *
   * Data provenance is a property of the worker, not of whoever happens to
   * hold an API key. The web app must not infer "this is live data" from its
   * own environment — it has never spoken to a market data vendor.
   */
  async writeProviderInfo(info: {
    providerName: string; simulated: boolean; startedAt: number;
  }): Promise<void> {
    await this.redis.hset(KEYS.marketProvider, {
      providerName: info.providerName,
      simulated: String(info.simulated),
      startedAt: info.startedAt,
    });
    await this.redis.expire(KEYS.marketProvider, DAY_SECONDS);
  }

  async readProviderInfo(): Promise<
    { providerName: string; simulated: boolean; startedAt: number } | null
  > {
    const raw = await this.redis.hgetall(KEYS.marketProvider);
    if (!raw || !raw.providerName) return null;
    return {
      providerName: raw.providerName,
      simulated: raw.simulated !== 'false',
      startedAt: Number(raw.startedAt) || 0,
    };
  }

  /** Fan out to every connected SSE gateway. */
  async publish(event: MarketEvent): Promise<void> {
    await this.redis.publish(KEYS.eventsChannel, JSON.stringify(event));
  }

  async subscribe(handler: (event: MarketEvent) => void): Promise<void> {
    await this.redis.subscribe(KEYS.eventsChannel, (_channel, message) => {
      try {
        handler(JSON.parse(message) as MarketEvent);
      } catch {
        // A malformed frame must not tear down the subscription.
      }
    });
  }

  async unsubscribe(): Promise<void> {
    await this.redis.unsubscribe(KEYS.eventsChannel);
  }
}

// ---------------------------------------------------------------------------
// Hash (de)serialisation — Redis hashes are string-to-string
// ---------------------------------------------------------------------------

function flatten(obj: object): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    out[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
  return out;
}

/**
 * Restore a flattened hash. Field names are trusted (we wrote them), so the
 * coercion is driven by the string shape: "true"/"false" to boolean, anything
 * fully numeric to number, everything else left alone.
 */
function inflate<T>(raw: Record<string, string>): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === 'true') out[key] = true;
    else if (value === 'false') out[key] = false;
    else if (value !== '' && !Number.isNaN(Number(value))) out[key] = Number(value);
    else out[key] = value;
  }
  return out as T;
}
