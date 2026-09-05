/**
 * Market worker entry point.
 *
 * Runs as a persistent process on Railway/Fly — deliberately not on Vercel,
 * because a market-data WebSocket cannot live inside a serverless function.
 *
 * Resilience model:
 *   - Provider drops trigger exponential backoff with jitter, then reconnect.
 *   - A silent socket (connected, no prints during regular hours) is treated as
 *     a drop, because that failure is far more common than a clean close.
 *   - After the retry budget is exhausted the process exits non-zero and lets
 *     the orchestrator restart it with a clean slate.
 */

import 'dotenv/config';
import { getConfig } from '../../shared/config';
import { loadUniverse } from '../../shared/data/universeRepository';
import { createMarketStore, createRedisClient, usingMemoryFallback } from '../../shared/redis';
import { getCurrentSession } from '../../shared/market/session';
import { getPrisma } from '../../src/lib/prisma';
import { createProvider, resolveProviderName, scenariosFromEnv } from './providers';
import { MarketPipeline } from './pipeline/MarketPipeline';
import { NullSignalSink, PrismaSignalSink } from './pipeline/PrismaSignalSink';
import { Logger } from './utils/logger';

/** Host only — never the password embedded in the connection string. */
function redisHost(): string | null {
  const url = process.env.REDIS_URL ?? process.env.UPSTASH_REDIS_URL;
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return 'unparseable';
  }
}

const MAX_RETRIES = Number(process.env.WORKER_MAX_RETRIES ?? 10);
const STALL_TIMEOUT_MS = Number(process.env.WORKER_STALL_TIMEOUT_MS ?? 30_000);
const HEALTH_INTERVAL_MS = 5_000;

let shuttingDown = false;

async function main(): Promise<void> {
  Logger.info('MarketPulse worker starting', {
    provider: resolveProviderName(),
    redis: usingMemoryFallback() ? 'in-process (no REDIS_URL)' : 'external',
    // The host, so a mismatch with the web app's Redis is visible at a glance
    // rather than deduced from an empty dashboard. Credentials stripped.
    redisHost: redisHost(),
    database: process.env.DATABASE_URL ? 'configured' : 'none',
  });

  if (usingMemoryFallback()) {
    Logger.warn(
      'No REDIS_URL set. The worker will use in-process state, which the Next.js app cannot read. ' +
      'Set REDIS_URL, or run the app with EMBEDDED_WORKER=true for a single-process demo.',
    );
  }

  const config = getConfig();
  const prisma = getPrisma();
  const { universe, source } = await loadUniverse(prisma, (reason) => Logger.warn(reason));
  Logger.info('Universe loaded', {
    source,
    sectors: universe.sectors.length,
    symbols: universe.stocks.length,
  });

  const store = createMarketStore(createRedisClient());
  const sink = prisma ? new PrismaSignalSink(prisma) : new NullSignalSink();

  let attempt = 0;
  while (attempt <= MAX_RETRIES && !shuttingDown) {
    const provider = createProvider(universe.stocks.map((s) => s.symbol), scenariosFromEnv(universe));
    const pipeline = new MarketPipeline({ provider, store, universe, config, sink });

    try {
      await provider.connect();
      Logger.info('Provider connected', { provider: provider.providerName });
      attempt = 0; // A successful connection resets the budget.

      await pipeline.warmUp();
      await pipeline.start();

      await waitForFailure(pipeline, provider);
    } catch (error) {
      Logger.error('Provider session ended', error, { attempt });
    } finally {
      await pipeline.stop().catch(() => {});
    }

    if (shuttingDown) break;

    attempt++;
    if (attempt > MAX_RETRIES) break;

    // Exponential backoff with jitter, so a provider-wide outage does not
    // produce a synchronised reconnect stampede across every deployment.
    const backoff = Math.min(1000 * 2 ** attempt, 30_000);
    const jitter = Math.random() * 1000;
    Logger.warn('Reconnecting', { attempt, maxRetries: MAX_RETRIES, delayMs: Math.round(backoff + jitter) });
    await sleep(backoff + jitter);
  }

  if (!shuttingDown) {
    Logger.fatal('Retry budget exhausted; exiting for orchestrator restart', undefined, { attempt });
    process.exit(1);
  }
}

/**
 * Resolves when the session should be torn down: either the provider reports a
 * drop, or the tape goes quiet during regular hours.
 */
function waitForFailure(
  pipeline: MarketPipeline,
  provider: { onDisconnect(handler: (reason: string) => void): void },
): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (reason: string) => {
      if (settled) return;
      settled = true;
      clearInterval(health);
      Logger.warn('Session ending', { reason });
      resolve();
    };

    provider.onDisconnect((reason) => finish(reason));

    const health = setInterval(() => {
      if (shuttingDown) return finish('shutdown requested');

      const session = getCurrentSession();
      const stats = pipeline.stats();

      // Only regular hours guarantee a continuous tape; a quiet premarket is
      // normal and must not be mistaken for a dead socket.
      if (session === 'REGULAR' && stats.lastTickAgoMs > STALL_TIMEOUT_MS && stats.tracked > 0) {
        return finish(`stall: no prints for ${Math.round(stats.lastTickAgoMs / 1000)}s`);
      }

      Logger.debug('health', { session, ...stats });
    }, HEALTH_INTERVAL_MS);

    health.unref?.();
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    Logger.info('Shutdown signal received', { signal });
    shuttingDown = true;
    setTimeout(() => process.exit(0), 2_000).unref?.();
  });
}

process.on('unhandledRejection', (reason) => {
  Logger.error('Unhandled rejection', reason);
});

main().catch((error) => {
  Logger.fatal('Worker crashed', error);
  process.exit(1);
});
