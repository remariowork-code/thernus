/**
 * The subset of Redis this system actually uses, behind an interface.
 *
 * Two implementations ship:
 *   - `IoRedisClient`  — real Redis / Upstash over TCP, used in production.
 *   - `MemoryRedisClient` — in-process, used by the test suite and by single
 *     process local development where no Redis is running.
 *
 * Keeping this narrow matters: it is the only thing that has to be true of a
 * backing store for the engines to work.
 */

export type RedisMessageHandler = (channel: string, message: string) => void;

export interface RedisClient {
  hset(key: string, values: Record<string, string | number>): Promise<void>;
  hgetall(key: string): Promise<Record<string, string>>;
  hget(key: string, field: string): Promise<string | null>;
  del(key: string): Promise<void>;
  expire(key: string, seconds: number): Promise<void>;

  set(key: string, value: string, ttlSeconds?: number): Promise<void>;
  get(key: string): Promise<string | null>;
  keys(pattern: string): Promise<string[]>;

  /** ZSET used for bar series and sector leader boards. */
  zadd(key: string, score: number, member: string): Promise<void>;
  zrange(key: string, start: number, stop: number): Promise<string[]>;
  zrevrange(key: string, start: number, stop: number): Promise<string[]>;
  /** Trim to the newest `count` members by score. */
  ztrim(key: string, count: number): Promise<void>;

  /** Capped list standing in for a Redis Stream — the signal log. */
  xadd(key: string, entry: string, maxLen: number): Promise<void>;
  xrevrange(key: string, count: number): Promise<string[]>;

  publish(channel: string, message: string): Promise<void>;
  subscribe(channel: string, handler: RedisMessageHandler): Promise<void>;
  unsubscribe(channel: string): Promise<void>;

  quit(): Promise<void>;
}

// ---------------------------------------------------------------------------
// In-process implementation
// ---------------------------------------------------------------------------

interface MemoryState {
  hashes: Map<string, Map<string, string>>;
  strings: Map<string, string>;
  zsets: Map<string, Array<{ score: number; member: string }>>;
  streams: Map<string, string[]>;
  subscribers: Map<string, Set<RedisMessageHandler>>;
}

/**
 * Process-global so that several `MemoryRedisClient` instances — the worker's
 * writer and the SSE route's subscriber, for instance — genuinely share state
 * when they run inside one Node process.
 */
const globalKey = Symbol.for('marketpulse.memoryRedis');
type GlobalWithStore = typeof globalThis & { [globalKey]?: MemoryState };

function sharedState(): MemoryState {
  const g = globalThis as GlobalWithStore;
  if (!g[globalKey]) {
    g[globalKey] = {
      hashes: new Map(),
      strings: new Map(),
      zsets: new Map(),
      streams: new Map(),
      subscribers: new Map(),
    };
  }
  return g[globalKey]!;
}

/** Glob-to-RegExp for the small subset of patterns we pass to `keys`. */
function globToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${escaped.replace(/\*/g, '.*').replace(/\?/g, '.')}$`);
}

export class MemoryRedisClient implements RedisClient {
  private state = sharedState();
  private ownSubscriptions = new Map<string, RedisMessageHandler>();

  async hset(key: string, values: Record<string, string | number>): Promise<void> {
    let hash = this.state.hashes.get(key);
    if (!hash) {
      hash = new Map();
      this.state.hashes.set(key, hash);
    }
    for (const [field, value] of Object.entries(values)) hash.set(field, String(value));
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    const hash = this.state.hashes.get(key);
    return hash ? Object.fromEntries(hash) : {};
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.state.hashes.get(key)?.get(field) ?? null;
  }

  async del(key: string): Promise<void> {
    this.state.hashes.delete(key);
    this.state.strings.delete(key);
    this.state.zsets.delete(key);
    this.state.streams.delete(key);
  }

  // TTLs are a memory-reclamation concern; nothing in the engines reads them back.
  async expire(): Promise<void> {}

  async set(key: string, value: string): Promise<void> {
    this.state.strings.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.state.strings.get(key) ?? null;
  }

  async keys(pattern: string): Promise<string[]> {
    const re = globToRegExp(pattern);
    const all = new Set([
      ...this.state.hashes.keys(),
      ...this.state.strings.keys(),
      ...this.state.zsets.keys(),
    ]);
    return [...all].filter((k) => re.test(k));
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    let zset = this.state.zsets.get(key);
    if (!zset) {
      zset = [];
      this.state.zsets.set(key, zset);
    }
    const existing = zset.findIndex((e) => e.member === member);
    if (existing >= 0) zset[existing].score = score;
    else zset.push({ score, member });
    zset.sort((a, b) => a.score - b.score);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    const zset = this.state.zsets.get(key) ?? [];
    return sliceRange(zset.map((e) => e.member), start, stop);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    const zset = this.state.zsets.get(key) ?? [];
    const reversed = [...zset].reverse().map((e) => e.member);
    return sliceRange(reversed, start, stop);
  }

  async ztrim(key: string, count: number): Promise<void> {
    const zset = this.state.zsets.get(key);
    if (!zset || zset.length <= count) return;
    this.state.zsets.set(key, zset.slice(zset.length - count));
  }

  async xadd(key: string, entry: string, maxLen: number): Promise<void> {
    let stream = this.state.streams.get(key);
    if (!stream) {
      stream = [];
      this.state.streams.set(key, stream);
    }
    stream.push(entry);
    if (stream.length > maxLen) stream.splice(0, stream.length - maxLen);
  }

  async xrevrange(key: string, count: number): Promise<string[]> {
    const stream = this.state.streams.get(key) ?? [];
    return [...stream].reverse().slice(0, count);
  }

  async publish(channel: string, message: string): Promise<void> {
    const handlers = this.state.subscribers.get(channel);
    if (!handlers) return;
    // Copy first: a handler may unsubscribe while we iterate.
    for (const handler of [...handlers]) {
      try {
        handler(channel, message);
      } catch {
        // A broken subscriber must not stall the publisher.
      }
    }
  }

  async subscribe(channel: string, handler: RedisMessageHandler): Promise<void> {
    let handlers = this.state.subscribers.get(channel);
    if (!handlers) {
      handlers = new Set();
      this.state.subscribers.set(channel, handlers);
    }
    handlers.add(handler);
    this.ownSubscriptions.set(channel, handler);
  }

  async unsubscribe(channel: string): Promise<void> {
    const handler = this.ownSubscriptions.get(channel);
    if (!handler) return;
    this.state.subscribers.get(channel)?.delete(handler);
    this.ownSubscriptions.delete(channel);
  }

  async quit(): Promise<void> {
    for (const channel of [...this.ownSubscriptions.keys()]) {
      await this.unsubscribe(channel);
    }
  }

  /** Test helper — wipes shared state. */
  static reset(): void {
    const g = globalThis as GlobalWithStore;
    delete g[globalKey];
  }
}

/** Redis range semantics: inclusive stop, negative indices from the end. */
function sliceRange(items: string[], start: number, stop: number): string[] {
  const len = items.length;
  const from = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
  const toInclusive = stop < 0 ? len + stop : Math.min(stop, len - 1);
  if (toInclusive < from) return [];
  return items.slice(from, toInclusive + 1);
}
