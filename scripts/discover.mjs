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
 * Before the opening bell the scan switches to a premarket mode, because the
 * regular-hours arithmetic silently reports nothing then: today's volume is
 * read from dailyBar, which is still *yesterday's* bar until 09:30, so every
 * symbol fails the volume floor and the screen stays empty during exactly the
 * hours when the overnight gaps are visible.
 *
 *   npm run discover                 one scan, ranked
 *   npm run discover -- --watch      rescan every 3 minutes, flag new entrants
 *   npm run discover -- --watch --interval 1      rescan every minute
 *   npm run discover -- --min-price 1 --min-volume 100000
 *   npm run discover -- --pm-min-pct 10           premarket move floor
 *   npm run discover -- --premarket               force premarket arithmetic
 */
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : fallback;
};
const WATCH = args.includes('--watch');
/** Force premarket arithmetic regardless of the clock. */
const FORCE_PREMARKET = args.includes('--premarket');
const INTERVAL_MIN = flag('interval', 3);
const TOP = flag('top', 25);

/**
 * Floors, not preferences. Sub-dollar names on a few hundred shares produce
 * enormous percentages from a single print, and a list dominated by those is
 * unusable — the move has to be visible in money as well as percent.
 */
const MIN_PRICE = flag('min-price', 0.5);
const MIN_VOLUME = flag('min-volume', 50_000);

/**
 * Premarket floors are different in kind, not just degree.
 *
 * There is no meaningful cumulative volume to threshold on at 06:00, so the
 * move itself has to do the filtering, and the volume floor only exists to
 * discard names where a single odd-lot print produced the percentage. Note
 * that IEX is a few percent of the consolidated tape, so a premarket volume of
 * a few thousand here is tens of thousands in reality — these numbers are for
 * ranking, not for sizing.
 */
const PM_MIN_PCT = flag('pm-min-pct', 5);
const PM_MIN_VOLUME = flag('pm-min-volume', 1_000);
/** Symbols promoted from the cheap snapshot pass to the bar-fetching pass. */
const PM_SHORTLIST = flag('pm-shortlist', 60);

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
const nyDate = (d = Date.now()) =>
  new Date(d).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

/** Minutes past midnight, New York. */
function nyMinutes(d = Date.now()) {
  const [h, m] = ny(d).split(':').map(Number);
  return h * 60 + m;
}

/**
 * Which arithmetic applies right now. Premarket runs 04:00-09:30 New York;
 * before 04:00 there is nothing to see and the regular path's empty output is
 * the honest answer.
 */
function sessionMode(d = Date.now()) {
  if (FORCE_PREMARKET) return 'premarket';
  const minutes = nyMinutes(d);
  if (minutes >= 4 * 60 && minutes < 9 * 60 + 30) return 'premarket';
  return 'regular';
}

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
 * Premarket scan.
 *
 * Two passes, because the snapshot carries no premarket volume. The first is
 * the same cheap sweep of the whole universe and filters on the move alone;
 * the second fetches today's minute bars for the leaders only, which is where
 * the premarket volume actually lives. Roughly twenty-seven calls plus two.
 */
async function scanPremarket(symbols) {
  const todayNY = nyDate();
  const candidates = [];

  for (let i = 0; i < symbols.length; i += CHUNK) {
    const res = await fetch(
      `https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbols.slice(i, i + CHUNK).join(',')}&feed=${FEED}`,
      { headers: H },
    );
    if (!res.ok) continue;
    const body = await res.json();

    for (const [sym, d] of Object.entries(body)) {
      const price = d?.latestTrade?.p;
      const stamp = d?.latestTrade?.t;
      if (!price || !stamp) continue;

      // The print must be from today. Otherwise it is simply yesterday's close
      // quoted back, which would show every dormant symbol as unchanged and,
      // worse, price a stale name against the wrong reference.
      if (nyDate(Date.parse(stamp)) !== todayNY) continue;

      // dailyBar is yesterday before the open, which makes it the reference
      // close. On the rare occasion a bar for today already exists, fall back
      // to prevDailyBar so the comparison is still to the last full session.
      const dailyIsToday = d?.dailyBar?.t?.slice(0, 10) === todayNY;
      const prev = dailyIsToday ? d?.prevDailyBar?.c : d?.dailyBar?.c;
      const prevVol = (dailyIsToday ? d?.prevDailyBar?.v : d?.dailyBar?.v) ?? 0;
      if (!prev || prev <= 0 || price < MIN_PRICE) continue;

      const pct = ((price - prev) / prev) * 100;
      if (pct < PM_MIN_PCT) continue;

      candidates.push({ sym, price, prev, prevVol, pct, at: stamp });
    }
  }

  const shortlist = candidates.sort((a, b) => b.pct - a.pct).slice(0, PM_SHORTLIST);
  if (shortlist.length === 0) return [];

  // Second pass: today's minute bars carry the premarket volume.
  const volume = new Map();
  for (let i = 0; i < shortlist.length; i += 40) {
    const chunk = shortlist.slice(i, i + 40).map((r) => r.sym).join(',');
    let token = null;
    do {
      const url =
        `https://data.alpaca.markets/v2/stocks/bars?symbols=${chunk}&timeframe=1Min` +
        `&start=${todayNY}&limit=10000&adjustment=all&feed=${FEED}` +
        `${token ? `&page_token=${token}` : ''}`;
      const res = await fetch(url, { headers: H });
      if (!res.ok) break;
      const body = await res.json();
      for (const [sym, bars] of Object.entries(body.bars ?? {})) {
        volume.set(sym, (volume.get(sym) ?? 0) + bars.reduce((sum, b) => sum + b.v, 0));
      }
      token = body.next_page_token ?? null;
    } while (token);
  }

  return shortlist
    .map((r) => {
      const vol = volume.get(r.sym) ?? 0;
      return {
        ...r, d: r.price - r.prev, vol,
        // Premarket volume against yesterday's whole session: a rough read on
        // how much of a normal day has already traded before the bell.
        volRatio: r.prevVol > 0 ? vol / r.prevVol : 0,
      };
    })
    .filter((r) => r.vol >= PM_MIN_VOLUME);
}

/**
 * Rank on move *and* participation. Percentage alone surfaces illiquid names
 * that gapped and stopped; volume alone surfaces heavily traded mega-caps
 * going nowhere.
 */
const score = (r) => Math.abs(r.pct) * Math.min(Math.max(r.volRatio, 0.1), 10);

function render(rows, previousTop, mode) {
  const premarket = mode === 'premarket';
  // Premarket ranks on the move alone. The volume figure there is a sample of
  // a sample — a few hours of IEX prints — and weighting by it would mostly
  // rank by which names happen to route to IEX.
  const ranked = rows.filter((r) => r.pct > 0)
    .sort((a, b) => (premarket ? b.pct - a.pct : score(b) - score(a)))
    .slice(0, TOP);

  console.log(
    `\n${ny()} ET   ${premarket ? 'PREMARKET   ' : ''}` +
    `${rows.length} symbols passed the floors   feed=${FEED}`,
  );
  if (rows.length === 0) {
    console.log(premarket
      ? `  (nothing up ${PM_MIN_PCT}%+ with at least ${PM_MIN_VOLUME.toLocaleString()} shares traded)`
      : '  (nothing yet — today\'s volume floor is not met)');
  }
  console.log(premarket
    ? '      SYMBOL     PRICE   PREV CLOSE        %    PM VOL vs PREV DAY      PM VOL   LAST'
    : '      SYMBOL     PRICE     $ CHG        %     VOL vs PREV DAY   TODAY VOL');
  for (const [i, r] of ranked.entries()) {
    const isNew = previousTop && !previousTop.has(r.sym);
    const head = `  ${String(i + 1).padStart(2)}. ${r.sym.padEnd(7)} ${r.price.toFixed(2).padStart(8)}`;
    const tail = `${(r.volRatio.toFixed(2) + 'x').padStart(8)}      ${r.vol.toLocaleString().padStart(11)}`;
    console.log(premarket
      ? `${head}  ${('$' + r.prev.toFixed(2)).padStart(10)}  ${('+' + r.pct.toFixed(1) + '%').padStart(8)}   ${tail}   ${ny(Date.parse(r.at)).slice(0, 5)}${isNew ? '  << NEW' : ''}`
      : `${head}  ${('+$' + r.d.toFixed(2)).padStart(9)}  ${('+' + r.pct.toFixed(1) + '%').padStart(7)}   ${tail}${isNew ? '   << NEW' : ''}`);
  }
  if (premarket && ranked.length > 0) {
    console.log('  IEX is a few percent of the tape: premarket volumes rank, they do not size.');
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
let previousMode = null;
for (;;) {
  const started = Date.now();
  const mode = sessionMode();
  // The two modes rank different things, so a leaderboard carried across the
  // bell would mark every symbol as new. Start the comparison fresh instead.
  if (mode !== previousMode) {
    previousTop = null;
    previousMode = mode;
    if (mode === 'premarket') {
      console.log(`\npremarket mode: up ${PM_MIN_PCT}%+ vs yesterday's close, ` +
        `at least ${PM_MIN_VOLUME.toLocaleString()} shares traded on IEX`);
    } else {
      console.log('\nregular-hours mode');
    }
  }
  const rows = mode === 'premarket' ? await scanPremarket(symbols) : await scan(symbols);
  previousTop = render(rows, previousTop, mode);
  console.log(`  scan took ${((Date.now() - started) / 1000).toFixed(0)}s`);
  if (!WATCH) break;
  // Subtract the scan's own duration, otherwise a 40-second scan turns a
  // 3-minute interval into 3 minutes 40 — and the drift compounds all session.
  const wait = Math.max(5_000, INTERVAL_MIN * 60_000 - (Date.now() - started));
  await new Promise((r) => setTimeout(r, wait));
}
