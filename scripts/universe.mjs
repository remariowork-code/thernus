/**
 * Inspect and edit the scanned universe.
 *
 * The universe lives in Postgres, not in code — the seed file only populates a
 * fresh install. This edits the database, so both the worker and the deployed
 * app see the change.
 *
 *   npm run universe -- list
 *   npm run universe -- show semiconductors
 *   npm run universe -- set my-focus "My Focus" MU,NVDA,DELL,AVGO
 *   npm run universe -- delete my-focus
 *
 * Changing a sector's constituents does not restart anything: the worker reads
 * the universe once at startup, so restart it to pick the change up.
 */
import { readFileSync } from 'node:fs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// Credentials come from .env.worker, falling back to the environment.
let fileEnv = {};
try {
  fileEnv = Object.fromEntries(
    readFileSync(new URL('../.env.worker', import.meta.url), 'utf8')
      .split('\n').map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
  );
} catch { /* environment may carry it */ }

const connectionString = process.env.DATABASE_URL || fileEnv.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set (checked the environment and .env.worker)');
  process.exit(1);
}

const scanned = (process.env.UNIVERSE_SECTORS || fileEnv.UNIVERSE_SECTORS || '')
  .split(',').map((s) => s.trim()).filter(Boolean);

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const [command, ...args] = process.argv.slice(2);

/** Alpaca's free plan streams this many; exceeding it is rejected outright. */
const STREAM_CAP = 30;

async function list() {
  const sectors = await prisma.sector.findMany({
    where: { active: true },
    include: { _count: { select: { stocks: true } } },
    orderBy: { name: 'asc' },
  });

  console.log('\n  scanned  id                      symbols  name');
  for (const s of sectors) {
    const on = scanned.includes(s.slug);
    console.log(`  ${on ? '  [on]  ' : '        '} ${s.slug.padEnd(22)} ${String(s._count.stocks).padStart(7)}  ${s.name}`);
  }

  if (scanned.length) {
    const total = await countSymbols(scanned);
    console.log(`\n  UNIVERSE_SECTORS = ${scanned.join(',')}`);
    console.log(`  unique symbols scanned: ${total}${total > STREAM_CAP ? `  OVER the ${STREAM_CAP} cap` : ` (cap ${STREAM_CAP})`}`);
  } else {
    console.log('\n  UNIVERSE_SECTORS is unset — every sector would be scanned.');
  }
  console.log();
}

/** Unique symbols across a set of sector slugs — overlaps counted once. */
async function countSymbols(slugs) {
  const rows = await prisma.sector.findMany({
    where: { slug: { in: slugs } },
    include: { stocks: { include: { stock: true } } },
  });
  return new Set(rows.flatMap((s) => s.stocks.map((l) => l.stock.symbol))).size;
}

async function show(slug) {
  const sector = await prisma.sector.findUnique({
    where: { slug },
    include: { stocks: { include: { stock: true } } },
  });
  if (!sector) { console.error(`\n  No sector with id "${slug}". Try: npm run universe -- list\n`); process.exitCode = 1; return; }

  const symbols = sector.stocks.map((l) => l.stock.symbol).sort();
  console.log(`\n  ${sector.name}  (${slug})`);
  console.log(`  ${sector.description ?? ''}`);
  console.log(`\n  ${symbols.length} symbols:`);
  for (let i = 0; i < symbols.length; i += 10) console.log('    ' + symbols.slice(i, i + 10).join(' '));
  console.log();
}

async function set(slug, name, symbolList) {
  const symbols = [...new Set(symbolList.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean))];
  if (symbols.length === 0) { console.error('\n  No symbols given.\n'); process.exitCode = 1; return; }

  if (symbols.length > STREAM_CAP) {
    console.log(`\n  Warning: ${symbols.length} symbols exceeds the ${STREAM_CAP}-symbol stream cap.`);
    console.log('  The provider will reject the subscription rather than truncating it.');
  }

  const sector = await prisma.sector.upsert({
    where: { slug },
    update: { name, active: true },
    create: { slug, name, description: 'Custom sector', active: true },
  });

  // A symbol the database has never seen needs a Stock row before it can be
  // linked. The name is a placeholder; nothing in the engines reads it.
  const created = [];
  for (const symbol of symbols) {
    const existing = await prisma.stock.findUnique({ where: { symbol } });
    if (!existing) {
      await prisma.stock.create({ data: { symbol, name: symbol, exchange: 'UNKNOWN', active: true } });
      created.push(symbol);
    }
  }

  // Replace the membership wholesale, so this is idempotent.
  await prisma.sectorStock.deleteMany({ where: { sectorId: sector.id } });
  for (const symbol of symbols) {
    const stock = await prisma.stock.findUnique({ where: { symbol } });
    await prisma.sectorStock.create({ data: { sectorId: sector.id, stockId: stock.id, weight: 1.0 } });
  }

  console.log(`\n  ${sector.name} (${slug}) now has ${symbols.length} symbols.`);
  if (created.length) console.log(`  Created new stock rows for: ${created.join(', ')}`);
  console.log(`\n  To scan it:  UNIVERSE_SECTORS=${slug}`);
  console.log('  Then restart the worker — the universe is read once at startup.\n');
}

async function remove(slug) {
  const sector = await prisma.sector.findUnique({ where: { slug } });
  if (!sector) { console.error(`\n  No sector with id "${slug}".\n`); process.exitCode = 1; return; }
  await prisma.sector.delete({ where: { slug } });
  console.log(`\n  Deleted ${sector.name} (${slug}). Stock rows were left in place.\n`);
}

try {
  switch (command) {
    case 'list': await list(); break;
    case 'show': await show(args[0]); break;
    case 'set': await set(args[0], args[1], args[2]); break;
    case 'delete': await remove(args[0]); break;
    default:
      console.log(`
  npm run universe -- list
  npm run universe -- show <sector-id>
  npm run universe -- set <sector-id> "<Display Name>" SYM,SYM,SYM
  npm run universe -- delete <sector-id>
`);
  }
} finally {
  await prisma.$disconnect();
}
