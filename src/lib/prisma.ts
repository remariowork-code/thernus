/**
 * Prisma client.
 *
 * Prisma 7 takes its connection through a driver adapter rather than a URL in
 * the schema. The client is optional by design: with no DATABASE_URL the
 * system still runs — the universe falls back to the static seed and signals
 * are not persisted — so a first run needs no infrastructure at all.
 */

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

const globalKey = Symbol.for('marketpulse.prisma');
type GlobalWithPrisma = typeof globalThis & { [globalKey]?: PrismaClient | null };

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Returns null when no database is configured. Callers must handle that —
 * it is the supported "runs with no infrastructure" path, not an error.
 *
 * Cached on globalThis so Next.js dev hot-reloads do not open a new pool on
 * every edit until Postgres runs out of connections.
 */
export function getPrisma(): PrismaClient | null {
  if (!isDatabaseConfigured()) return null;

  const g = globalThis as GlobalWithPrisma;
  if (g[globalKey] !== undefined) return g[globalKey] ?? null;

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  const client = new PrismaClient({ adapter });
  g[globalKey] = client;
  return client;
}

export type { PrismaClient };
