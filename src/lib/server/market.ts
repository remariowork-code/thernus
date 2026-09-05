import 'server-only';

/**
 * Server-side access to live market state.
 *
 * Every route handler reads through here rather than constructing its own
 * Redis client, so a single process holds one connection regardless of how
 * many routes are hit.
 */

import { createMarketStore, createRedisClient, usingMemoryFallback, type MarketStore } from '@shared/redis';
import { loadUniverse } from '@shared/data/universeRepository';
import { getEffectiveSession } from '@shared/market/session';
import type { MarketSession, Universe } from '@shared/types';
import { getPrisma, isDatabaseConfigured } from '@/lib/prisma';

const storeKey = Symbol.for('marketpulse.web.store');
const universeKey = Symbol.for('marketpulse.web.universe');

type GlobalCache = typeof globalThis & {
  [storeKey]?: MarketStore;
  [universeKey]?: { value: Universe; source: string; loadedAt: number };
};

export function marketStore(): MarketStore {
  const g = globalThis as GlobalCache;
  if (!g[storeKey]) g[storeKey] = createMarketStore(createRedisClient());
  return g[storeKey]!;
}

/** Cached for a minute: the universe changes at the pace of a human edit. */
const UNIVERSE_TTL_MS = 60_000;

export async function universe(): Promise<{ value: Universe; source: string }> {
  const g = globalThis as GlobalCache;
  const cached = g[universeKey];
  if (cached && Date.now() - cached.loadedAt < UNIVERSE_TTL_MS) {
    return { value: cached.value, source: cached.source };
  }

  const { universe: value, source } = await loadUniverse(getPrisma());
  g[universeKey] = { value, source, loadedAt: Date.now() };
  return { value, source };
}

export interface SystemStatus {
  session: MarketSession;
  redis: 'external' | 'in-process';
  database: 'configured' | 'none';
  universeSource: string;
  sectors: number;
  symbols: number;
  /** True when no market-data key is set: the numbers on screen are synthetic. */
  simulated: boolean;
}

export async function systemStatus(): Promise<SystemStatus> {
  const { value, source } = await universe();
  const storedSession = await marketStore().readSession().catch(() => null);
  return {
    session: storedSession ?? getEffectiveSession(),
    redis: usingMemoryFallback() ? 'in-process' : 'external',
    database: isDatabaseConfigured() ? 'configured' : 'none',
    universeSource: source,
    sectors: value.sectors.length,
    symbols: value.stocks.length,
    simulated: !process.env.MARKET_DATA_API_KEY,
  };
}
