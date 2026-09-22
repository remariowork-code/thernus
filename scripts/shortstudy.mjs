/**
 * Does short interest predict whether a move holds?
 *
 * Six observations suggested it: the moves that held had 22% (GRML) and 42%
 * (VEEA) of float short, the ones that faded had 1.28% (LHSW) and 2.31%
 * (DCOY). Six is a story, not a finding. This measures it across every large
 * move in a window and buckets the outcomes.
 *
 * The one thing that would invalidate it is lookahead. FINRA publishes short
 * interest about two weeks after it settles, so an event on 18 September must
 * be scored against the settlement of 31 August — the snapshot a trader could
 * actually have had — not against the mid-September one that describes the
 * move itself. Every event here is matched to the latest settlement strictly
 * before it.
 *
 *   npm run shortstudy -- --days 25
 *   npm run shortstudy -- --days 25 --min-change 30
 */
import { readFileSync } from 'node:fs';
import { loadReverseSplits, loadSharesOutstanding, makeAlpacaHeaders, splitFactorAfter } from './lib/fundamentals.mjs';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? Number(args[i + 1]) : d; };

const DAYS = flag('days', 25);
const MIN_CHANGE = flag('min-change', 20);
const MIN_VOLUME = flag('min-volume', 20_000);
const MIN_PRICE = flag('min-price', 0.5);
const MAX_PRICE = flag('max-price', 100);
/** Cap the fundamentals lookups; SEC asks for under ten requests a second. */
const MAX_SYMBOLS = flag('max-symbols', 400);

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
if (!KEY || !SECRET) { console.error('ALPACA credentials required'); process.exit(1); }
const H = makeAlpacaHeaders(KEY, SECRET);
const FEED = env.ALPACA_FEED || 'iex';
const TODAY = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

async function get(url, attempt = 0) {
  const res = await fetch(url, { headers: H });
  if (res.status === 429 && attempt < 6) {
    await new Promise((r) => setTimeout(r, Math.min(60_000, 2_000 * 2 ** attempt)));
    return get(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
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

/** Every published settlement in the window, newest first. */
async function loadAllSettlements(fromIso) {
  const dates = [];
  const now = new Date();
  for (let back = 0; back < 120; back += 1) {
    const d = new Date(now.getTime() - back * 86_400_000);
    const iso = d.toISOString().slice(0, 10);
    if (iso < fromIso) break;
    const day = d.getUTCDate();
    const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    if (day === 15 || day === last) dates.push(iso);
  }

  const snapshots = new Map();
  for (const date of dates) {
    const rows = await finraAll(date);
    if (rows?.length) {
      const m = new Map();
      for (const r of rows) m.set(r.symbolCode, Number(r.currentShortPositionQuantity));
      snapshots.set(date, m);
      process.stderr.write(`  short interest ${date}: ${m.size.toLocaleString()} symbols\n`);
    }
  }
  return snapshots;
}

async function finraAll(settlementDate) {
  const rows = [];
  let offset = 0;
  for (let page = 0; page < 20; page += 1) {
    const body = {
      limit: 5000, offset,
      compareFilters: [{ fieldName: 'settlementDate', fieldValue: settlementDate, compareType: 'EQUAL' }],
    };
    let res;
    try {
      res = await fetch('https://api.finra.org/data/group/otcMarket/name/consolidatedShortInterest', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
    } catch { break; }
    if (res.status === 204 || !res.ok) break;
    const text = await res.text();
    if (!text.trim()) break;
    let chunk;
    try { chunk = JSON.parse(text); } catch { break; }
    if (!chunk.length) break;
    rows.push(...chunk);
    if (chunk.length < 5000) break;
    offset += chunk.length;
  }
  return rows;
}

function describe(label, events) {
  const gaps = events.map((e) => (typeof e === 'number' ? e : e.gap));
  const syms = new Set(events.map((e) => (typeof e === 'number' ? null : e.sym)).filter(Boolean));
  if (!gaps.length) return `  ${label.padEnd(22)} (none)`;
  const s = [...gaps].sort((a, b) => a - b);
  const up = s.filter((g) => g > 0).length;
  const mean = s.reduce((a, b) => a + b, 0) / s.length;
  const med = s[Math.floor(s.length / 2)];
  return `  ${label.padEnd(22)} n=${String(s.length).padStart(4)}${syms.size ? `/${String(syms.size).padStart(3)}sym` : ''}  up ${String(Math.round((up / s.length) * 100)).padStart(3)}%  ` +
    `mean ${(mean >= 0 ? '+' : '') + mean.toFixed(1)}%`.padEnd(14) +
    `median ${(med >= 0 ? '+' : '') + med.toFixed(1)}%`.padEnd(16) +
    `p10 ${s[Math.floor(s.length * 0.1)].toFixed(0)}%  p90 +${s[Math.floor(s.length * 0.9)].toFixed(0)}%`;
}

async function main() {
  const start = new Date(Date.now() - (DAYS + 20) * 86_400_000).toISOString().slice(0, 10);
  console.log(`\nDoes short interest predict the next-session gap?`);
  console.log(`events: up >= ${MIN_CHANGE}% on >= ${MIN_VOLUME.toLocaleString()} shares, $${MIN_PRICE}-$${MAX_PRICE}, ${DAYS} sessions\n`);

  const assets = await get('https://paper-api.alpaca.markets/v2/assets?status=active&asset_class=us_equity');
  const symbols = assets.filter((a) => a.tradable && !a.symbol.includes('/')).map((a) => a.symbol);
  process.stderr.write(`  fetching daily bars for ${symbols.length.toLocaleString()} symbols…\n`);
  const daily = await dailyBars(symbols, start, TODAY);

  // Events, with the outcome already attached.
  const sessions = [...new Set(Object.values(daily).flatMap((l) => l.map((b) => b.t.slice(0, 10))))].sort();
  const recent = new Set(sessions.slice(-(DAYS + 1)));
  const events = [];
  for (const [sym, list] of Object.entries(daily)) {
    for (let i = 1; i + 1 < list.length; i += 1) {
      const day = list[i].t.slice(0, 10);
      if (!recent.has(day)) continue;
      const b = list[i], prev = list[i - 1], next = list[i + 1];
      if (!prev.c || prev.c <= 0 || b.c < MIN_PRICE || b.c > MAX_PRICE || b.v < MIN_VOLUME) continue;
      const change = ((b.c - prev.c) / prev.c) * 100;
      if (change < MIN_CHANGE) continue;
      events.push({
        sym, day, change, volume: b.v, close: b.c,
        gap: ((next.o - b.c) / b.c) * 100,
        nextDay: ((next.c - b.c) / b.c) * 100,
      });
    }
  }
  console.log(`  ${events.length} events across ${[...new Set(events.map((e) => e.sym))].length} symbols`);
  if (!events.length) return;

  // Fundamentals for the symbols involved, most active first if capped.
  const counts = new Map();
  for (const e of events) counts.set(e.sym, (counts.get(e.sym) ?? 0) + 1);
  const wanted = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a)).slice(0, MAX_SYMBOLS);

  const splits = await loadReverseSplits(H, '2025-01-01', TODAY);
  process.stderr.write(`  looking up SEC share counts for ${wanted.length}…\n`);
  const shares = await loadSharesOutstanding(wanted);
  const settlements = await loadAllSettlements(start);
  const settlementDates = [...settlements.keys()].sort();

  let scored = 0;
  for (const e of events) {
    const sh = shares.get(e.sym);
    if (!sh) continue;
    // Refuse a stale share count: the denominator decides the answer.
    if (Date.now() - Date.parse(sh.asOf) > 400 * 86_400_000) continue;
    const symSplits = splits.get(e.sym);
    const floatShares = sh.shares / splitFactorAfter(symSplits, sh.asOf);
    if (!(floatShares > 0)) continue;

    // The latest settlement STRICTLY BEFORE the event — what was knowable.
    const usable = settlementDates.filter((d) => d < e.day);
    if (!usable.length) continue;
    const date = usable[usable.length - 1];
    const raw = settlements.get(date)?.get(e.sym);
    if (raw === undefined) continue;

    const pct = ((raw / splitFactorAfter(symSplits, date)) / floatShares) * 100;
    // Short interest above the entire share count is not a squeeze, it is a
    // broken denominator. HQ came through at 113,013,300% against a float
    // rounding to zero; PCLA, AEHL, SXTC and JZXN all cleared 80%. Letting
    // those into a bucket mean is how a study talks itself into a result.
    if (!Number.isFinite(pct) || pct > 60 || floatShares < 100_000) continue;
    e.shortPercent = pct;
    e.floatShares = floatShares;
    e.rotation = e.volume / floatShares;
    e.shortAsOf = date;
    scored += 1;
  }

  const withShort = events.filter((e) => e.shortPercent !== undefined);
  console.log(`  ${scored} events scored with a short-interest snapshot predating them\n`);
  if (!withShort.length) { console.log('  nothing scorable\n'); return; }

  console.log('BY SHORT INTEREST (% of shares outstanding, as known before the event)');
  const buckets = [['under 2%', 0, 2], ['2-5%', 2, 5], ['5-10%', 5, 10], ['10-15%', 10, 15], ['15-25%', 15, 25], ['over 25%', 25, Infinity]];
  for (const [label, lo, hi] of buckets) {
    console.log(describe(label, withShort.filter((e) => e.shortPercent >= lo && e.shortPercent < hi)));
  }
  console.log(describe('ALL', withShort));

  console.log('\nBY FLOAT');
  for (const [label, lo, hi] of [['under 2M', 0, 2e6], ['2M-10M', 2e6, 1e7], ['10M-50M', 1e7, 5e7], ['over 50M', 5e7, Infinity]]) {
    console.log(describe(label, withShort.filter((e) => e.floatShares >= lo && e.floatShares < hi)));
  }

  console.log('\nBY FLOAT ROTATION (volume / shares outstanding on the event day)');
  for (const [label, lo, hi] of [['under 0.25x', 0, 0.25], ['0.25-1x', 0.25, 1], ['1-3x', 1, 3], ['over 3x', 3, Infinity]]) {
    console.log(describe(label, withShort.filter((e) => e.rotation >= lo && e.rotation < hi)));
  }

  // List the heavily shorted events individually. A bucket mean of +20% on
  // twelve observations is one outlier away from meaning nothing, and the
  // cases that generated the hypothesis may well be sitting inside it.
  console.log('\nEVERY EVENT AT >=15% SHORT');
  console.log('  DATE         SYMBOL   DAY %   SHORT %   FLOAT      GAP');
  for (const e of withShort.filter((x) => x.shortPercent >= 15).sort((a, b) => b.gap - a.gap)) {
    console.log(`  ${e.day}   ${e.sym.padEnd(7)} ${('+' + e.change.toFixed(0) + '%').padStart(6)} ` +
      `${(e.shortPercent.toFixed(1) + '%').padStart(8)}  ${(e.floatShares / 1e6).toFixed(2)}M`.padEnd(22) +
      `${((e.gap >= 0 ? '+' : '') + e.gap.toFixed(1) + '%').padStart(8)}`);
  }

  const high = withShort.filter((e) => e.shortPercent >= 15).map((e) => e.gap);
  const low = withShort.filter((e) => e.shortPercent < 5).map((e) => e.gap);
  // VEEA on the 14th and GRML on the 21st are the observations the hypothesis
  // was built from. Leaving them in the test that is supposed to confirm it
  // makes the test circular, so the number is reported both ways.
  const seeded = new Set(['VEEA|2026-09-14', 'GRML|2026-09-21']);
  const highClean = withShort.filter((e) => e.shortPercent >= 15 && !seeded.has(`${e.sym}|${e.day}`)).map((e) => e.gap);
  const m = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  console.log(`\nThe hypothesis was that heavily shorted names hold and lightly shorted ones fade.`);
  console.log(`  >=15% short: n=${high.length}, mean gap ${(m(high) >= 0 ? '+' : '') + m(high).toFixed(1)}%`);
  console.log(`  <5%  short: n=${low.length}, mean gap ${(m(low) >= 0 ? '+' : '') + m(low).toFixed(1)}%`);
  console.log(`  difference: ${((m(high) - m(low)) >= 0 ? '+' : '') + (m(high) - m(low)).toFixed(1)} points.`);
  console.log(`  excluding VEEA 14 Sep and GRML 21 Sep, the two cases the hypothesis`);
  console.log(`  was built from: n=${highClean.length}, mean ${(m(highClean) >= 0 ? '+' : '') + m(highClean).toFixed(1)}%, ` +
    `difference ${((m(highClean) - m(low)) >= 0 ? '+' : '') + (m(highClean) - m(low)).toFixed(1)} points.`);
  console.log('\nShares outstanding is used where float is meant, so percentages sit below');
  console.log('what Finviz reports. Stale SEC filings are excluded rather than guessed at.\n');
}

main().catch((e) => { console.error(`\nshortstudy failed: ${e.message}\n`); process.exit(1); });
