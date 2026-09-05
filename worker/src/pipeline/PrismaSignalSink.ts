/**
 * Persists signals and news to Postgres.
 *
 * Redis already holds everything the live UI needs, so this is the durable
 * record for history and, later, signal-performance analysis. Failures are
 * logged and swallowed by the caller — losing a history row is much cheaper
 * than stalling the live feed.
 */

import type { Prisma, PrismaClient } from '../../../generated/prisma/client';
import type { NewsHeadline, Signal } from '../../../shared/types';
import type { SignalSink } from './MarketPipeline';
import { Logger } from '../utils/logger';

export class PrismaSignalSink implements SignalSink {
  constructor(private readonly prisma: PrismaClient) {}

  async persist(signals: Signal[]): Promise<void> {
    if (signals.length === 0) return;
    await this.prisma.signal.createMany({
      data: signals.map((s) => ({
        id: s.id,
        symbol: s.symbol,
        // Signals carry the sector *slug*; the column is the sector's uuid, so
        // it is left null here and resolved by the reporting layer. Storing the
        // slug in metadata keeps the association without a lookup per signal on
        // the hot path.
        sectorId: null,
        type: s.type,
        severity: s.severity,
        score: s.score,
        triggerValue: s.triggerValue,
        previousValue: s.previousValue,
        headline: s.headline,
        // SignalMetadata is JSON-safe by construction (numbers, strings and
        // plain arrays), but Prisma's InputJsonValue cannot prove that of an
        // interface with an index signature, so the shape is asserted here.
        metadata: {
          ...s.metadata,
          sectorSlug: s.sectorId,
          sectorName: s.sectorName,
        } as unknown as Prisma.InputJsonObject,
        createdAt: new Date(s.createdAt),
      })),
      skipDuplicates: true,
    });
  }

  async persistNews(item: NewsHeadline): Promise<void> {
    try {
      await this.prisma.newsArticle.upsert({
        where: { url: item.url },
        update: {},
        create: {
          headline: item.headline,
          source: item.source,
          url: item.url,
          publishedAt: new Date(item.publishedAt),
          catalystType: item.catalystType,
          symbols: { create: item.symbols.map((symbol) => ({ symbol })) },
        },
      });
    } catch (error) {
      Logger.warn('News persistence failed', { url: item.url, error: String(error) });
    }
  }
}

/** Used when no database is configured. */
export class NullSignalSink implements SignalSink {
  async persist(): Promise<void> {}
  async persistNews(): Promise<void> {}
}
