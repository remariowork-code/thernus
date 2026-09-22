/**
 * Dormancy breakouts — the session before the gap.
 *
 * Everything else here looks at what has already moved. This looks at what
 * has stopped moving, and then fires on the first session it wakes up.
 *
 * The pattern came out of nine sessions of observation. Every large gap we
 * logged had a quiet precursor day that was visible and ignored:
 *
 *   VEEA  Mon 14 Sep  +41% on ~100x its normal volume, no news
 *                     -> Tue: gapped +89%, closed +149%
 *   GIPR  Thu 17 Sep  +23% on ~6x normal, no news
 *                     -> Fri: gapped +240%
 *
 * And every explosive name was dormant first, not accumulating: IMCC, DCOY,
 * CELZ and JAGX all printed sessions of literally zero volume in the fortnight
 * before they went. The setup is the ABSENCE of prior trading, which is what
 * no other screen here measures.
 *
 * The honest problem with acting on it: the payoff is the overnight gap, and
 * the trading engine flattens before the close by design. Catching VEEA on the
 * Monday made $0.40 in backtest. So --verify measures the only thing that
 * decides whether this is a strategy or a curiosity: whether a first-burst
 * breakout gaps better than the already-gapped names the overnight scanner
 * finds, which run 9 up / 10 down with a -1.4% median.
 *
 *   npm run dormant                    today's first-burst candidates
 *   npm run dormant -- --date 2026-09-14
 *   npm run dormant -- --verify 20     score against what happened next
 *   npm run dormant -- --burst 5 --verify 20      sweep the trigger
 */
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? Number(args[i + 1]) : d; };
const str = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

/** Sessions of history used to decide whether a name was asleep. */
const BASELINE = flag('baseline', 10);
/** A name counts as dormant when its median session volume is at or under this. */
const DORMANT_MAX = flag('dormant-max', 20_000);
/** Today's volume must beat the median by this multiple. */
const BURST_MULT = flag('burst', 10);
/** ...and clear this in absolute terms, so 200 shares from a base of 5 is not a burst. */
const MIN_BURST_VOL = flag('min-burst-vol', 10_000);
const MIN_PCT = flag('min-pct', 8);
const MIN_PRICE = flag('min-price', 0.5);
const MAX_PRICE = flag('max-price', 100);
/** Sessions to look back over for an earlier burst, so only the first fires. */
const QUIET_AFTER = flag('quiet-after', 3);
const TOP = flag('top', 20);
const DATE = str('date', null);
const VERIFY = flag('verify', 0);

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
const DAY = DATE ?? new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

async function get(url, attempt = 0) {
  const res = await fetch(url, { headers: H });
  if (res.status === 429 && attempt < 6) {
    await new Promise((r) => setTimeout(r, Math.min(60_000, 2_000 * 2 ** attempt)));
    return get(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function tradableSymbols() {
  const a = await get('https://paper-api.alpaca.markets/v2/assets?status=active&asset_class=us_equity');
  return a.filter((x) => x.tradable && !x.symbol.includes('/')).map((x) => x.symbol);
}

async function dailyBars(symbols, start, end) {
  const out = {};
  for (let i = 0; i < symbols.length; i += 50) {
    const chunk = symbols.slice(i, i + 50).join(',');
    let token = null;
    do {
      const url = `https://data.alpaca.markets/v2/stocks/bars?symbols=${chunk}&timeframe=1Day` +
        `&start=${start}&end=${end}&limit=10000&adjustment=all&feed=${FEED}${token ? `&page_token=${token}` : ''}`;
      let body;
      try { body = await get(url); } catch { break; }
      for (const [s, list] of Object.entries(body.bars ?? {})) (out[s] ??= []).push(...list);
      token = body.next_page_token ?? null;
    } while (token);
  }
  return out;
}

/**
 * Median, not mean.
 *
 * A dormant name's history is mostly zeros with the odd print, and one 160,000
 * share day in the window would drag a mean far enough to hide exactly the
 * stocks this is looking for.
 */
function median(values) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/** Was this the first session in a while that woke up? */
function isBurst(list, i) {
  if (i < BASELINE) return null;
  const today = list[i];
  const prev = list[i - 1];
  if (!prev?.c || prev.c <= 0) return null;
  if (today.c < MIN_PRICE || today.c > MAX_PRICE) return null;

  const window = list.slice(i - BASELINE, i);
  const base = median(window.map((b) => b.v));
  if (base > DORMANT_MAX) return null;                    // it was never asleep

  const threshold = Math.max(MIN_BURST_VOL, BURST_MULT * Math.max(base, 1));
  if (today.v < threshold) return null;

  const pct = ((today.c - prev.c) / prev.c) * 100;
  if (pct < MIN_PCT) return null;

  // Only the first wake-up. A name on day three of a run is not this signal,
  // and counting it would quietly double-count the same event.
  for (let j = Math.max(BASELINE, i - QUIET_AFTER); j < i; j += 1) {
    if (isBurstShallow(list, j)) return null;
  }

  return {
    close: today.c, prevClose: prev.c, pct, vol: today.v,
    base, mult: base > 0 ? today.v / base : Infinity,
    open: today.o, high: today.h, low: today.l,
    // How much of the move was still available after the open.
    fromOpen: ((today.c - today.o) / today.o) * 100,
  };
}

/** The burst test without the recursion, for the look-back. */
function isBurstShallow(list, i) {
  if (i < BASELINE) return false;
  const today = list[i];
  const prev = list[i - 1];
  if (!prev?.c || prev.c <= 0) return false;
  const base = median(list.slice(i - BASELINE, i).map((b) => b.v));
  if (base > DORMANT_MAX) return false;
  if (today.v < Math.max(MIN_BURST_VOL, BURST_MULT * Math.max(base, 1))) return false;
  return ((today.c - prev.c) / prev.c) * 100 >= MIN_PCT;
}

function scan(daily, day) {
  const rows = [];
  for (const [sym, list] of Object.entries(daily)) {
    const i = list.findIndex((b) => b.t.slice(0, 10) === day);
    if (i < 0) continue;
    const hit = isBurst(list, i);
    if (hit) rows.push({ sym, ...hit });
  }
  // Rank by how unprecedented the volume is, not by the size of the move —
  // the move is what everyone already sees.
  return rows.sort((a, b) => b.mult - a.mult);
}

function nextSession(list, day) {
  const i = list.findIndex((b) => b.t.slice(0, 10) === day);
  if (i < 0 || i + 1 >= list.length) return null;
  const a = list[i], n = list[i + 1];
  return {
    on: n.t.slice(0, 10),
    gap: ((n.o - a.c) / a.c) * 100,
    nextDay: ((n.c - a.c) / a.c) * 100,
    openToClose: ((n.c - n.o) / n.o) * 100,
  };
}

/**
 * Score the screen against what actually happened next.
 *
 * The comparison that matters is the overnight scanner's already-gapped names:
 * 9 of 19 up, mean +8.6%, median -1.4%. If first-burst breakouts land in the
 * same place, this pattern is a description of the past rather than a signal.
 */
async function verify(daily, days) {
  const sessions = [...new Set(Object.values(daily).flatMap((l) => l.map((b) => b.t.slice(0, 10))))].sort();
  const scored = sessions.slice(-(days + 1), -1);
  const results = [];

  for (const day of scored) {
    for (const r of scan(daily, day)) {
      const out = nextSession(daily[r.sym], day);
      if (out) results.push({ day, ...r, ...out });
    }
  }

  if (!results.length) { console.log('\n  no first-burst candidates in that window\n'); return; }

  console.log('\n  BURST DAY    SYMBOL     BURST %   VOL MULT     GAP   NEXT DAY   OPEN→CLOSE');
  for (const r of results) {
    const f = (v) => ((v >= 0 ? '+' : '') + v.toFixed(1) + '%').padStart(8);
    console.log(`  ${r.day}   ${r.sym.padEnd(8)} ${f(r.pct)} ${(r.mult === Infinity ? '  inf' : r.mult.toFixed(0) + 'x').padStart(9)} ${f(r.gap)} ${f(r.nextDay)} ${f(r.openToClose)}`);
  }

  const gaps = results.map((r) => r.gap).sort((a, b) => a - b);
  const up = gaps.filter((g) => g > 0).length;
  const mean = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const med = gaps[Math.floor(gaps.length / 2)];

  console.log(`\n  ${results.length} first-burst candidates over ${scored.length} sessions.`);
  console.log(`  Gapped up: ${up}/${results.length} (${Math.round((up / results.length) * 100)}%).`);
  console.log(`  Mean gap ${mean >= 0 ? '+' : ''}${mean.toFixed(1)}%, median ${med >= 0 ? '+' : ''}${med.toFixed(1)}%, ` +
    `worst ${gaps[0].toFixed(1)}%, best +${gaps[gaps.length - 1].toFixed(1)}%.`);
  console.log('\n  Benchmark — the overnight scanner, on already-gapped names:');
  console.log('    9/19 up (47%), mean +8.6%, median -1.4%.');
  console.log('  If these numbers are not clearly better, the dormancy setup adds nothing');
  console.log('  over simply watching what already moved, and is not worth trading.\n');
}

async function main() {
  const window = (VERIFY ? VERIFY : 1) + BASELINE + 12;
  const start = new Date(Date.parse(`${DAY}T00:00:00Z`) - window * 86_400_000).toISOString().slice(0, 10);
  const end = new Date(Date.parse(`${DAY}T00:00:00Z`) + 2 * 86_400_000).toISOString().slice(0, 10);

  console.log(`\nDormancy breakouts — ${VERIFY ? `scoring ${VERIFY} sessions to ${DAY}` : DAY}`);
  console.log(`dormant: median volume over ${BASELINE} sessions <= ${DORMANT_MAX.toLocaleString()}`);
  console.log(`burst:   >= ${BURST_MULT}x that median AND >= ${MIN_BURST_VOL.toLocaleString()} shares AND up >= ${MIN_PCT}%`);

  const symbols = await tradableSymbols();
  process.stderr.write(`  fetching daily bars for ${symbols.length.toLocaleString()} symbols…\n`);
  const daily = await dailyBars(symbols, start, end);

  if (VERIFY) { await verify(daily, VERIFY); return; }

  const rows = scan(daily, DAY).slice(0, TOP);
  if (!rows.length) { console.log('\n  nothing woke up today\n'); return; }

  console.log(`\n  SYMBOL     CLOSE    DAY %   FROM OPEN     VOLUME   vs MEDIAN   WAS SLEEPING AT`);
  for (const r of rows) {
    const f = (v) => ((v >= 0 ? '+' : '') + v.toFixed(1) + '%').padStart(9);
    console.log(`  ${r.sym.padEnd(8)} ${('$' + r.close.toFixed(2)).padStart(8)} ${f(r.pct)} ${f(r.fromOpen)} ` +
      `${r.vol.toLocaleString().padStart(10)}  ${(r.mult === Infinity ? 'inf' : r.mult.toFixed(0) + 'x').padStart(8)}   ${Math.round(r.base).toLocaleString()} shares/day`);
  }
  console.log('\n  Ranked by how unprecedented the volume is, not by the size of the move.');
  console.log('  FROM OPEN says how much was still available after the bell; a large day move');
  console.log('  with a small from-open figure was already gone by the time it was visible.');
  console.log('  Run --verify before trading any of this.\n');
}

main().catch((e) => { console.error(`\ndormant failed: ${e.message}\n`); process.exit(1); });
