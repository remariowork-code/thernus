/**
 * Universe access.
 *
 * The spec requires the universe to be editable without a code change, so the
 * database is the source of truth when one is configured. Without a database
 * we serve the static seed instead — same shape, same code paths downstream —
 * which is what lets the system boot with nothing installed.
 *
 * Server-only: this pulls in Prisma and must never reach the browser bundle.
 */

import type { PrismaClient } from '../../generated/prisma/client';
import type { Universe } from '../types';
import { seedUniverse } from '../market/universe';

export interface UniverseSource {
  readonly kind: 'database' | 'static';
  load(): Promise<Universe>;
}

export class StaticUniverseSource implements UniverseSource {
  readonly kind = 'static' as const;
  async load(): Promise<Universe> {
    return seedUniverse();
  }
}

export class DatabaseUniverseSource implements UniverseSource {
  readonly kind = 'database' as const;
  constructor(private readonly prisma: PrismaClient) {}

  async load(): Promise<Universe> {
    const rows = await this.prisma.sector.findMany({
      where: { active: true },
      include: { stocks: { include: { stock: true } } },
      orderBy: { name: 'asc' },
    });

    const stocks = new Map<string, Universe['stocks'][number]>();
    const sectors = rows.map((sector) => {
      const constituents: Array<{ symbol: string; weight: number }> = [];
      for (const link of sector.stocks) {
        // An inactive stock stays in the database but leaves the scan, so a
        // symbol can be parked without deleting its history.
        if (!link.stock.active) continue;
        constituents.push({ symbol: link.stock.symbol, weight: link.weight });
        if (!stocks.has(link.stock.symbol)) {
          stocks.set(link.stock.symbol, {
            symbol: link.stock.symbol,
            name: link.stock.name,
            exchange: link.stock.exchange,
            active: link.stock.active,
          });
        }
      }
      return {
        // The slug is the stable key used in Redis and URLs.
        id: sector.slug,
        name: sector.name,
        description: sector.description ?? '',
        active: sector.active,
        constituents,
      };
    }).filter((s) => s.constituents.length > 0);

    return { sectors, stocks: [...stocks.values()] };
  }
}

/**
 * Load the universe, preferring the database and degrading to the seed.
 *
 * A database that is configured but unreachable falls back rather than
 * crashing the worker — a scanner that runs on a slightly stale universe is
 * more useful than one that will not start.
 */
/**
 * Narrow the universe to named sectors.
 *
 * UNIVERSE_SECTORS is a comma-separated list of sector ids. This exists
 * because some plans cap how many symbols may be streamed at once — Alpaca's
 * free tier allows 30 — and a capped subscription silently computes breadth
 * over an incomplete constituent set, which is worse than watching fewer
 * sectors properly.
 */
export function restrictUniverse(universe: Universe, sectorIds: string[]): Universe {
  if (sectorIds.length === 0) return universe;

  const wanted = new Set(sectorIds.map((id) => id.trim()).filter(Boolean));
  const sectors = universe.sectors.filter((sector) => wanted.has(sector.id));
  const symbols = new Set(sectors.flatMap((s) => s.constituents.map((c) => c.symbol)));

  return {
    sectors,
    stocks: universe.stocks.filter((stock) => symbols.has(stock.symbol)),
  };
}

export async function loadUniverse(
  prisma: PrismaClient | null,
  onFallback?: (reason: string) => void,
): Promise<{ universe: Universe; source: 'database' | 'static' }> {
  const restrict = (universe: Universe): Universe => {
    const configured = (process.env.UNIVERSE_SECTORS ?? '')
      .split(',').map((s) => s.trim()).filter(Boolean);
    if (configured.length === 0) return universe;

    const restricted = restrictUniverse(universe, configured);
    if (restricted.sectors.length === 0) {
      onFallback?.(
        `UNIVERSE_SECTORS matched no sectors (${configured.join(', ')}); watching everything instead.`,
      );
      return universe;
    }
    return restricted;
  };

  if (!prisma) {
    onFallback?.('No DATABASE_URL configured; using the built-in seed universe.');
    return { universe: restrict(await new StaticUniverseSource().load()), source: 'static' };
  }
  try {
    const universe = await new DatabaseUniverseSource(prisma).load();
    if (universe.sectors.length === 0) {
      onFallback?.('Database has no active sectors; using the built-in seed universe. Run `npm run db:seed`.');
      return { universe: restrict(await new StaticUniverseSource().load()), source: 'static' };
    }
    return { universe: restrict(universe), source: 'database' };
  } catch (error) {
    onFallback?.(`Database unreachable (${String(error)}); using the built-in seed universe.`);
    return { universe: restrict(await new StaticUniverseSource().load()), source: 'static' };
  }
}
