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
  if (!url) return new MemoryRedisClient();
  warnIfUnencrypted(url);
  return new IoRedisClient(url);
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0']);

let warnedAboutTls = false;

/**
 * Whether a connection string would send credentials in the clear.
 *
 * Pure and exported so it can be tested without opening a socket — the check
 * is about the URL, and a unit test that constructs a real client to observe a
 * console warning is both slower and dependent on how the runner resolves DNS.
 */
export function isUnencryptedRemote(url: string): boolean {
  if (url.startsWith('rediss://')) return false;
  try {
    return !LOCAL_HOSTS.has(new URL(url).hostname);
  } catch {
    // A malformed URL fails loudly at connect time instead.
    return false;
  }
}

/**
 * A `redis://` endpoint sends AUTH — and everything after it — in cleartext.
 * Over a public network that exposes the password to anyone on the path. Some
 * providers hand out non-TLS endpoints by default, so this is easy to adopt
 * without noticing.
 */
function warnIfUnencrypted(url: string): void {
  if (warnedAboutTls || !isUnencryptedRemote(url)) return;
  warnedAboutTls = true;
  console.warn(
    '[marketpulse] REDIS_URL uses redis:// over a non-local host. The connection, ' +
    'including the password, is unencrypted. Prefer a rediss:// endpoint.',
  );
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
