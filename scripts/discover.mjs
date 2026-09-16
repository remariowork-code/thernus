/**
 * Market-wide discovery scan.
 *
 * The websocket scanner answers "is the sector I chose moving?". It cannot
 * answer "what is moving?", because the free plan streams thirty symbols. That
 * cap is on the *stream*: REST snapshots take five hundred symbols per call, so
 * the whole tradable universe is about twenty-seven calls and under a minute.
 *
 * Resolution is a scan interval rather than a tick, which is the trade. It is
 * enough to surface a name climbing on heavy volume while it is still climbing
 * — VEEA ran for six hours on thirty-six times its normal volume before it
 * gapped overnight.
 *
 *   npm run discover                 one scan, ranked
 *   npm run discover -- --watch      rescan every 3 minutes, flag new entrants
 *   npm run discover -- --watch --interval 1      rescan every minute
 *   npm run discover -- --min-price 1 --min-volume 100000
 */
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : fallback;
};
const WATCH = args.includes('--watch');
const INTERVAL_MIN = flag('interval', 3);
const TOP = flag('top', 25);

/**
 * Floors, not preferences. Sub-dollar names on a few hundred shares produce
 * enormous percentages from a single print, and a list dominated by those is
 * unusable — the move has to be visible in money as well as percent.
 */
const MIN_PRICE = flag('min-price', 0.5);
const MIN_VOLUME = flag('min-volume', 50_000);

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
const H = { 'APCA-API-KEY-ID': KEY, 'APCA-API-SECRET-KEY': SECRET };
const FEED = env.ALPACA_FEED || 'iex';
const CHUNK = 500;

const ny = (d = Date.now()) =>
  new Date(d).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false });

async function tradableSymbols() {
  const res = await fetch('https://paper-api.alpaca.markets/v2/assets?status=active&asset_class=us_equity', { headers: H });
  if (!res.ok) throw new Error(`assets: ${res.status} ${res.statusText}`);
  const assets = await res.json();
  return assets.filter((a) => a.tradable && !a.symbol.includes('/')).map((a) => a.symbol);
}

async function scan(symbols) {
  const todayNY = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const rows = [];
  for (let i = 0; i < symbols.length; i += CHUNK) {
    const res = await fetch(
      `https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbols.slice(i, i + CHUNK).join(',')}&feed=${FEED}`,
      { headers: H },
    );
    if (!res.ok) continue;            // one bad chunk must not abandon the scan
    const body = await res.json();

    for (const [sym, d] of Object.entries(body)) {
      const price = d?.latestTrade?.p;

      // Before the open there is no bar for today: dailyBar is the previous
      // session and prevDailyBar the one before it. Reading prevDailyBar as
      // the previous close then reports a two-session move as today's, and
      // the volume ratio compares two past days and never changes.
      const dailyIsToday = d?.dailyBar?.t?.slice(0, 10) === todayNY;
      const prev = (dailyIsToday ? d?.prevDailyBar?.c : d?.dailyBar?.c);
      const today = dailyIsToday ? (d?.dailyBar?.v ?? 0) : 0;
      const prevVol = (dailyIsToday ? d?.prevDailyBar?.v : d?.dailyBar?.v) ?? 0;

      if (!price || !prev || price < MIN_PRICE || today < MIN_VOLUME) continue;

      // A stale print is last session's close, not today's move.
      const ageMin = (Date.now() - Date.parse(d.latestTrade.t)) / 60000;
      if (ageMin > 30) continue;

      // Today's volume so far against yesterday's whole day. Crude, but it
      // needs no extra request, and mid-morning anything above 1 means the
      // name has already traded a full day's worth.
      const volRatio = prevVol > 0 ? today / prevVol : 0;
      rows.push({
        sym, price, prev, d: price - prev,
        pct: ((price - prev) / prev) * 100,
        vol: today, volRatio,
      });
    }
  }
  return rows;
}

/**
 * Rank on move *and* participation. Percentage alone surfaces illiquid names
 * that gapped and stopped; volume alone surfaces heavily traded mega-caps
 * going nowhere.
 */
const score = (r) => Math.abs(r.pct) * Math.min(Math.max(r.volRatio, 0.1), 10);

function render(rows, previousTop) {
  const ranked = rows.filter((r) => r.pct > 0).sort((a, b) => score(b) - score(a)).slice(0, TOP);

  console.log(`\n${ny()} ET   ${rows.length} symbols passed the floors   feed=${FEED}`);
  if (rows.length === 0) {
    console.log('  (nothing yet — today\'s volume floor is not met before the open)');
  }
  console.log('      SYMBOL     PRICE     $ CHG        %     VOL vs PREV DAY   TODAY VOL');
  for (const [i, r] of ranked.entries()) {
    const isNew = previousTop && !previousTop.has(r.sym);
    console.log(
      `  ${String(i + 1).padStart(2)}. ${r.sym.padEnd(7)} ${r.price.toFixed(2).padStart(8)}  ${('+$' + r.d.toFixed(2)).padStart(9)}  ${('+' + r.pct.toFixed(1) + '%').padStart(7)}   ${(r.volRatio.toFixed(2) + 'x').padStart(8)}      ${r.vol.toLocaleString().padStart(11)}${isNew ? '   << NEW' : ''}`,
    );
  }
  return new Set(ranked.map((r) => r.sym));
}

const symbols = await tradableSymbols();
console.log(`scanning ${symbols.length} tradable US equities`);
console.log(`floors: price >= $${MIN_PRICE}, today volume >= ${MIN_VOLUME.toLocaleString()}`);
if (WATCH) {
  console.log(`watching: rescan every ${INTERVAL_MIN} minute${INTERVAL_MIN === 1 ? '' : 's'}` +
    ' (change with --interval N)');
}

let previousTop = null;
for (;;) {
  const started = Date.now();
  previousTop = render(await scan(symbols), previousTop);
  console.log(`  scan took ${((Date.now() - started) / 1000).toFixed(0)}s`);
  if (!WATCH) break;
  // Subtract the scan's own duration, otherwise a 40-second scan turns a
  // 3-minute interval into 3 minutes 40 — and the drift compounds all session.
  const wait = Math.max(5_000, INTERVAL_MIN * 60_000 - (Date.now() - started));
  await new Promise((r) => setTimeout(r, wait));
}
