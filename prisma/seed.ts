/**
 * Seeds the configurable universe.
 *
 * Idempotent throughout — every write is an upsert — so it is safe to re-run
 * after editing shared/market/universe.ts, which is the single source both this
 * script and the no-database fallback read from.
 */

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { SECTOR_SEED, seedSymbols } from '../shared/market/universe';

const DEMO_EMAIL = 'trader@marketpulse.io';

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set. Seeding needs a database.');
    process.exit(1);
  }

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
  console.log(`Seeding ${SECTOR_SEED.length} sectors / ${seedSymbols().length} symbols…`);

  for (const sectorDef of SECTOR_SEED) {
    const sector = await prisma.sector.upsert({
      where: { slug: sectorDef.id },
      update: { name: sectorDef.name, description: sectorDef.description, active: true },
      create: {
        slug: sectorDef.id,
        name: sectorDef.name,
        description: sectorDef.description,
        active: true,
      },
    });

    for (const stockDef of sectorDef.symbols) {
      const stock = await prisma.stock.upsert({
        where: { symbol: stockDef.symbol },
        update: { name: stockDef.name, exchange: stockDef.exchange },
        create: {
          symbol: stockDef.symbol,
          name: stockDef.name,
          exchange: stockDef.exchange,
          active: true,
        },
      });

      await prisma.sectorStock.upsert({
        where: { sectorId_stockId: { sectorId: sector.id, stockId: stock.id } },
        update: { weight: stockDef.weight ?? 1.0 },
        create: { sectorId: sector.id, stockId: stock.id, weight: stockDef.weight ?? 1.0 },
      });
    }

    console.log(`  ${sectorDef.name} — ${sectorDef.symbols.length} constituents`);
  }

  // A default user so watchlists and alert rules have somewhere to live before
  // authentication is added.
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, name: 'Default Trader' },
  });

  const watchlist = await prisma.watchlist.upsert({
    where: { userId_name: { userId: user.id, name: 'Memory & AI Hotlist' } },
    update: {},
    create: { userId: user.id, name: 'Memory & AI Hotlist' },
  });

  for (const symbol of ['MU', 'SNDK', 'WDC', 'STX', 'NVDA', 'AVGO']) {
    await prisma.watchlistSymbol.upsert({
      where: { watchlistId_symbol: { watchlistId: watchlist.id, symbol } },
      update: {},
      create: { watchlistId: watchlist.id, symbol },
    });
  }

  // Default alert rules: sector-level events at LOW and above, which is the
  // "tell me when a sector starts moving" default the product is built around.
  for (const type of ['SECTOR_AWAKENING', 'SECTOR_BREAKOUT', 'SECTOR_ACCELERATION', 'CATALYST'] as const) {
    const existing = await prisma.alertRule.findFirst({ where: { userId: user.id, type } });
    if (!existing) {
      await prisma.alertRule.create({
        data: { userId: user.id, type, minSeverity: 'LOW', enabled: true },
      });
    }
  }

  const [sectors, stocks] = await Promise.all([prisma.sector.count(), prisma.stock.count()]);
  console.log(`Done. ${sectors} sectors, ${stocks} stocks, watchlist "${watchlist.name}".`);
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
