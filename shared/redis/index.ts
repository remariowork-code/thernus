import { MemoryRedisClient, type RedisClient } from './client';
import { IoRedisClient } from './ioredis';
import { MarketStore } from './store';
import { getConfig } from '../config';

export * from './client';
export * from './store';
export { IoRedisClient } from './ioredis';

/**
 * Pick a backing store from the environment.
 *
 * REDIS_URL (or UPSTASH_REDIS_URL) selects real Redis. With neither set we fall
 * back to the in-process client so the system boots with no infrastructure —
 * that path is single-process only, and `usingMemoryFallback` reports it so the
 * worker and the UI can both say so out loud rather than quietly pretending.
 */
export function createRedisClient(): RedisClient {
  const url = process.env.REDIS_URL ?? process.env.UPSTASH_REDIS_URL;
  return url ? new IoRedisClient(url) : new MemoryRedisClient();
}

export function usingMemoryFallback(): boolean {
  return !(process.env.REDIS_URL ?? process.env.UPSTASH_REDIS_URL);
}

export function createMarketStore(client: RedisClient = createRedisClient()): MarketStore {
  const { engine } = getConfig();
  return new MarketStore(client, {
    bars1m: engine.bars1mRetention,
    bars5m: engine.bars5mRetention,
    signalStreamMaxLen: engine.signalStreamMaxLen,
  });
}
