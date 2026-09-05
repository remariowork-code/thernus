/**
 * Production Redis, over TCP.
 *
 * Upstash speaks the Redis wire protocol on `rediss://`, so one adapter covers
 * both a local Redis and Upstash. Note the two connections: a Redis client in
 * subscriber mode cannot issue ordinary commands, so publishing and subscribing
 * need separate sockets.
 */

import Redis, { type RedisOptions } from 'ioredis';
import type { RedisClient, RedisMessageHandler } from './client';

export class IoRedisClient implements RedisClient {
  private readonly commands: Redis;
  private subscriberConn: Redis | null = null;
  private readonly handlers = new Map<string, Set<RedisMessageHandler>>();

  constructor(url: string, options: RedisOptions = {}) {
    this.commands = new Redis(url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      // Exponential-ish backoff, capped, so a Redis outage doesn't hot-loop.
      retryStrategy: (times) => Math.min(times * 200, 5_000),
      ...options,
    });
    this.url = url;
    this.options = options;
  }

  private readonly url: string;
  private readonly options: RedisOptions;

  private subscriber(): Redis {
    if (!this.subscriberConn) {
      this.subscriberConn = new Redis(this.url, {
        retryStrategy: (times) => Math.min(times * 200, 5_000),
        ...this.options,
      });
      this.subscriberConn.on('message', (channel: string, message: string) => {
        for (const handler of this.handlers.get(channel) ?? []) {
          try {
            handler(channel, message);
          } catch {
            // Isolate subscriber faults.
          }
        }
      });
    }
    return this.subscriberConn;
  }

  async hset(key: string, values: Record<string, string | number>): Promise<void> {
    if (Object.keys(values).length === 0) return;
    await this.commands.hset(key, values);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.commands.hgetall(key);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.commands.hget(key, field);
  }

  async del(key: string): Promise<void> {
    await this.commands.del(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.commands.expire(key, seconds);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) await this.commands.set(key, value, 'EX', ttlSeconds);
    else await this.commands.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.commands.get(key);
  }

  /**
   * SCAN rather than KEYS — KEYS blocks the server, and this runs against a
   * shared Upstash instance on every dashboard hydration.
   */
  async keys(pattern: string): Promise<string[]> {
    const found: string[] = [];
    let cursor = '0';
    do {
      const [next, batch] = await this.commands.scan(cursor, 'MATCH', pattern, 'COUNT', 500);
      cursor = next;
      found.push(...batch);
    } while (cursor !== '0');
    return found;
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    await this.commands.zadd(key, score, member);
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.commands.zrange(key, String(start), String(stop));
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.commands.zrevrange(key, String(start), String(stop));
  }

  async ztrim(key: string, count: number): Promise<void> {
    // Keep the newest `count` by rank; drop everything older.
    await this.commands.zremrangebyrank(key, 0, -count - 1);
  }

  async xadd(key: string, entry: string, maxLen: number): Promise<void> {
    await this.commands.xadd(key, 'MAXLEN', '~', String(maxLen), '*', 'payload', entry);
  }

  async xrevrange(key: string, count: number): Promise<string[]> {
    const entries = await this.commands.xrevrange(key, '+', '-', 'COUNT', count);
    return entries.map(([, fields]) => {
      const index = fields.indexOf('payload');
      return index >= 0 ? fields[index + 1] : '';
    }).filter(Boolean);
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.commands.publish(channel, message);
  }

  async subscribe(channel: string, handler: RedisMessageHandler): Promise<void> {
    let set = this.handlers.get(channel);
    if (!set) {
      set = new Set();
      this.handlers.set(channel, set);
      await this.subscriber().subscribe(channel);
    }
    set.add(handler);
  }

  async unsubscribe(channel: string): Promise<void> {
    this.handlers.delete(channel);
    if (this.subscriberConn) await this.subscriberConn.unsubscribe(channel);
  }

  async quit(): Promise<void> {
    await Promise.allSettled([
      this.commands.quit(),
      this.subscriberConn?.quit(),
    ]);
  }
}
