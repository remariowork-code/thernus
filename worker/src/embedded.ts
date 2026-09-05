/**
 * The embedded worker, isolated in its own module.
 *
 * Kept separate from `src/instrumentation.ts` because that file is compiled
 * for the Edge runtime as well as Node, and everything below — signal
 * handlers, sockets, Redis — is Node-only. Reaching it solely through a
 * dynamic import keeps those APIs out of the Edge bundle entirely.
 */

import { getConfig } from '../../shared/config';
import { loadUniverse } from '../../shared/data/universeRepository';
import { createMarketStore, createRedisClient } from '../../shared/redis';
import { getPrisma } from '../../src/lib/prisma';
import { MarketPipeline } from './pipeline/MarketPipeline';
import { NullSignalSink, PrismaSignalSink } from './pipeline/PrismaSignalSink';
import { createProvider, scenariosFromEnv } from './providers';
import { Logger } from './utils/logger';

export async function startEmbeddedWorker(): Promise<void> {
  Logger.warn(
    'Embedded worker enabled. This runs the market pipeline inside the Next.js process — ' +
    'convenient for local development, not the production topology. ' +
    'Deploy worker/src/index.ts separately and set REDIS_URL for the real thing.',
  );

  const config = getConfig();
  const prisma = getPrisma();
  const { universe, source } = await loadUniverse(prisma, (reason) => Logger.warn(reason));

  const store = createMarketStore(createRedisClient());
  const provider = createProvider(universe.stocks.map((s) => s.symbol), scenariosFromEnv(universe));
  const sink = prisma ? new PrismaSignalSink(prisma) : new NullSignalSink();

  const pipeline = new MarketPipeline({ provider, store, universe, config, sink });

  await provider.connect();
  await pipeline.warmUp(8);
  await pipeline.start();

  Logger.info('Embedded worker running', {
    universeSource: source,
    sectors: universe.sectors.length,
    symbols: universe.stocks.length,
  });

  const shutdown = () => { void pipeline.stop(); };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}
