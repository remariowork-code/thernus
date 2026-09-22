/**
 * Float and short-interest scanner.
 *
 * Built after looking at what professional scanners filter on and finding that
 * none of it was in our data. Two variables, doing two different jobs:
 *
 *   FLOAT decides whether a stock CAN move. GLND carried 27M shares against
 *   GRML's 2.9M, took the identical Greenland catalyst, and sat flat from the
 *   open while GRML ran another 38%.
 *
 *   SHORT INTEREST decides whether it KEEPS moving. The names that held had
 *   22% (GRML) and 42% (VEEA) of float short; the names that faded had 1.28%
 *   (LHSW) and 2.31% (DCOY). Shorts are forced buyers — without them the bid
 *   is entirely discretionary and disappears when enthusiasm does.
 *
 * And the setup condition underneath both: a recent reverse split. All seven
 * names examined did one in 2026, JAGX twice — the second, 15-to-1 on 17
 * September, five days before it rose 516% on an FDA fee waiver. A distressed
 * company compressing its share count to hold a listing manufactures exactly
 * the float conditions that make a violent move possible.
 *
 *   npm run squeeze                    today, ranked
 *   npm run squeeze -- --symbols GRML,VEEA,JAGX
 *   npm run squeeze -- --min-short 15  only heavily shorted names
 */
import { readFileSync } from 'node:fs';
import {
  loadReverseSplits, loadSharesOutstanding, loadShortInterest, makeAlpacaHeaders, reconcile,
} from './lib/fundamentals.mjs';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? Number(args[i + 1]) : d; };
const str = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

const MIN_PRICE = flag('min-price', 0.5);
const MAX_PRICE = flag('max-price', 100);
const MIN_CHANGE = flag('min-change', 10);
const MIN_VOLUME = flag('min-volume', 10_000);
/** Names promoted from the price screen to the (slower) fundamentals lookup. */
const SHORTLIST = flag('shortlist', 25);
const MIN_SHORT = flag('min-short', 0);
const ONLY = (() => { const s = str('symbols', null); return s ? s.split(',').map((x) => x.trim().toUpperCase()) : null; })();

let env = {};
try {
  env = Object.fromEntries(
    readFileSync(new URL('../.env.worker', import.meta.url), 'utf8')
      .split('\n').map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
  );
} catch { /* environment may carry the values */ }

const KEY = process.env.ALPACA_API_KEY_ID || env.ALPACA_API_KEY_ID;
const SECRET = process.env.ALPACA_API_SECRET_KEY || env.ALPACA_API_SECRET_KEY;
if (!KEY || !SECRET) {
  console.error('ALPACA_API_KEY_ID and ALPACA_API_SECRET_KEY must be set (.env.worker or environment)');
  process.exit(1);
}
const H = makeAlpacaHeaders(KEY, SECRET);
const FEED = env.ALPACA_FEED || 'iex';
const TODAY = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

async function get(url, attempt = 0) {
  const res = await fetch(url, { headers: H });
  if (res.status === 429 && attempt < 5) {
    await new Promise((r) => setTimeout(r, 2_000 * 2 ** attempt));
    return get(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

/** Cheap pass: who is moving enough to be worth looking up. */
async function priceScreen() {
  let symbols;
  if (ONLY) symbols = ONLY;
  else {
    const assets = await get('https://paper-api.alpaca.markets/v2/assets?status=active&asset_class=us_equity');
    symbols = assets.filter((a) => a.tradable && !a.symbol.includes('/')).map((a) => a.symbol);
  }

  const rows = [];
  for (let i = 0; i < symbols.length; i += 500) {
    let body;
    try {
      body = await get(`https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbols.slice(i, i + 500).join(',')}&feed=${FEED}`);
    } catch { continue; }
    for (const [sym, d] of Object.entries(body)) {
      const price = d?.latestTrade?.p;
      if (!price) continue;
      const dailyIsToday = d.dailyBar?.t?.slice(0, 10) === TODAY;
      const prev = dailyIsToday ? d.prevDailyBar?.c : d.dailyBar?.c;
      const volume = dailyIsToday ? (d.dailyBar?.v ?? 0) : 0;
      if (!prev || prev <= 0) continue;
      const change = ((price - prev) / prev) * 100;
      if (!ONLY) {
        if (price < MIN_PRICE || price > MAX_PRICE) continue;
        if (volume < MIN_VOLUME) continue;
        if (change < MIN_CHANGE) continue;
      }
      rows.push({ sym, price, prev, change, volume });
    }
  }
  return rows.sort((a, b) => b.change - a.change);
}

function fmtShares(n) {
  if (n === null || !Number.isFinite(n)) return '   —';
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  return `${Math.round(n / 1000)}K`;
}

async function main() {
  console.log(`\nFloat and short interest — ${TODAY}`);
  if (!ONLY) console.log(`price screen: $${MIN_PRICE}-$${MAX_PRICE}, up >= ${MIN_CHANGE}%, volume >= ${MIN_VOLUME.toLocaleString()}`);

  const moving = await priceScreen();
  if (!moving.length) { console.log('\n  nothing passed the price screen\n'); return; }
  const shortlist = moving.slice(0, SHORTLIST);
  const symbols = shortlist.map((r) => r.sym);
  process.stderr.write(`  ${moving.length} moving; looking up fundamentals for ${symbols.length}…\n`);

  // A two-year window: these names split repeatedly, and a split that predates
  // the share count still has to be excluded, not missed.
  const splits = await loadReverseSplits(H, '2025-01-01', TODAY);
  const shares = await loadSharesOutstanding(symbols);
  const { settlementDate, data: shorts } = await loadShortInterest(symbols);

  const rows = shortlist.map((r) => ({
    ...r,
    ...reconcile({
      symbol: r.sym, shares: shares.get(r.sym), shortInfo: shorts.get(r.sym),
      splits: splits.get(r.sym), todayVolume: r.volume,
    }),
  })).filter((r) => MIN_SHORT === 0 || (r.shortPercent ?? 0) >= MIN_SHORT);

  if (!rows.length) { console.log('\n  nothing left after the fundamentals filter\n'); return; }

  // Rank on the two variables that mattered, not on the size of the move.
  rows.sort((a, b) => ((b.shortPercent ?? 0) + (b.floatRotation ?? 0) * 2) - ((a.shortPercent ?? 0) + (a.floatRotation ?? 0) * 2));

  console.log(`short interest as of ${settlementDate ?? 'unavailable'}\n`);
  console.log('  SYMBOL    PRICE    DAY %     FLOAT   ROTATION   SHORT %   D2C   LAST REVERSE SPLIT');
  for (const r of rows) {
    const rot = r.floatRotation === null ? '     —' : `${r.floatRotation.toFixed(1)}x`.padStart(6);
    const sp = r.shortPercent === null ? '     —' : `${r.shortPercent.toFixed(1)}%`.padStart(6);
    const split = r.lastSplit ? `${r.lastSplit.ratio}->1 on ${r.lastSplit.date}` : '—';
    console.log(
      `  ${r.sym.padEnd(8)} ${('$' + r.price.toFixed(2)).padStart(7)} ${('+' + r.change.toFixed(0) + '%').padStart(7)} ` +
      `${fmtShares(r.floatShares).padStart(8)}${r.sharesStale ? '*' : ' '} ${rot}    ${sp}  ${String(r.daysToCover ?? '—').padStart(4)}   ${split}`,
    );
  }

  const stale = rows.filter((r) => r.sharesStale).length;
  console.log('\n  FLOAT is shares outstanding from the last SEC filing, adjusted for every');
  console.log('  reverse split since. It is not strictly float — insider and restricted stock');
  console.log('  is not excluded — but for these companies the two are usually close.');
  if (stale) console.log(`  * ${stale} name(s) have an SEC filing over a year old: treat the float as unreliable.`);
  console.log('  ROTATION is today\'s volume divided by that float: 1.0x means the entire');
  console.log('  tradeable supply changed hands once today.');
  console.log(`  SHORT % is split-adjusted from the ${settlementDate ?? 'latest'} settlement, so it is`);
  console.log('  two to three weeks old by construction — FINRA publishes on that lag.');
  console.log('  High short interest is the variable that separated the moves that held');
  console.log('  from the ones that faded. It is a hypothesis from six observations.\n');
}

main().catch((e) => { console.error(`\nsqueeze failed: ${e.message}\n`); process.exit(1); });
