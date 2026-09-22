/**
 * News vs no-news: drift or reversal?
 *
 * Replicates the central test of Chan (2003), "Stock Price Reaction to News
 * and No-news: Drift and Reversal After Headlines", on our own universe.
 * Chan's finding is that large moves accompanied by a public headline tend to
 * DRIFT in the same direction, while equally large moves with no headline tend
 * to REVERSE — and that both effects concentrate in small, illiquid stocks.
 *
 * The motivating observation is a single session. On 22 September JAGX carried
 * a catalyst (an FDA fee waiver on the wire at 09:05) and climbed all
 * afternoon to close +1215%; IMCC had no identifiable news, spiked, and gave
 * back 26% from its high in the same hour. Two stocks is an anecdote that
 * happens to match a published result, which is a reason to test it rather
 * than a reason to believe it.
 *
 * Also measured, because JAGX's behaviour suggested it: the LATENCY between a
 * headline and the first abnormal price response. JAGX's release was public at
 * 09:05 and the price did not move until 12:52 — 227 minutes in which the
 * information was free. Hou and Moskowitz (2005) formalise the general version
 * of this as price delay and find it concentrated in exactly the names where
 * frictions are highest.
 *
 * Latency itself is deliberately NOT measured here. It only matters if news
 * drives anything at all, and that is what this establishes first; measuring
 * minute-level response times across thousands of events costs a great deal
 * of data for a question that is moot if the answer below is no.
 *
 *   npm run newsdrift -- --days 60
 *   npm run newsdrift -- --days 60 --min-change 30
 */
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? Number(args[i + 1]) : d; };

const DAYS = flag('days', 60);
const MIN_CHANGE = flag('min-change', 20);
const MIN_VOLUME = flag('min-volume', 10_000);
const MIN_PRICE = flag('min-price', 0.5);
const MAX_PRICE = flag('max-price', 100);

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
const H = { 'APCA-API-KEY-ID': KEY, 'APCA-API-SECRET-KEY': SECRET };
const FEED = env.ALPACA_FEED || 'iex';
const TODAY = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

const nyTime = (t) => new Date(t).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }).slice(0, 5);
const nyDay = (t) => new Date(t).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });

async function get(url, attempt = 0) {
  const res = await fetch(url, { headers: H });
  if (res.status === 429 && attempt < 6) {
    await new Promise((r) => setTimeout(r, Math.min(60_000, 2_000 * 2 ** attempt)));
    return get(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function bars(symbols, timeframe, start, end) {
  const out = {};
  for (let i = 0; i < symbols.length; i += 50) {
    const chunk = symbols.slice(i, i + 50).join(',');
    let token = null;
    do {
      const url = `https://data.alpaca.markets/v2/stocks/bars?symbols=${chunk}&timeframe=${timeframe}` +
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
 * Headlines, keyed by symbol and NY date.
 *
 * Round-ups are excluded. A "12 Stocks Moving" piece is published BECAUSE the
 * stock moved, so counting it as the catalyst would classify every large move
 * as news-driven and destroy the comparison the study exists to make.
 */
async function loadNews(start) {
  const roundUp = /\b\d+\s+(stocks?|.*stocks?)\s+moving\b|\bhere\s+are\s+\d+\b|radars?\b|market\s+(summary|wrap)|\b(dow|nasdaq|s&p)\b.*\b(points?|tumbles?|surges?|rises?|falls?)\b|crude\s+oil|why\s+is\s+.*\b(surging|soaring|jumping|trading higher)\b/i;
  const bySymbolDay = new Map();
  let token = null;
  let fetched = 0;
  do {
    const url = `https://data.alpaca.markets/v1beta1/news?start=${start}T00:00:00Z&limit=50&sort=asc${token ? `&page_token=${token}` : ''}`;
    let body;
    try { body = await get(url); } catch { break; }
    const items = body.news ?? [];
    for (const n of items) {
      if (roundUp.test(n.headline)) continue;
      // Tagging more than three symbols means a sector piece, not a catalyst.
      const syms = (n.symbols ?? []).filter((s) => s.length <= 5);
      if (!syms.length || syms.length > 3) continue;
      for (const s of syms) {
        const key = `${s}|${nyDay(n.created_at)}`;
        if (!bySymbolDay.has(key)) bySymbolDay.set(key, []);
        bySymbolDay.get(key).push({ at: n.created_at, headline: n.headline });
      }
    }
    fetched += items.length;
    token = body.next_page_token ?? null;
    if (fetched > 60_000) break;
  } while (token);
  process.stderr.write(`  ${fetched.toLocaleString()} stories, ${bySymbolDay.size.toLocaleString()} symbol-days with a headline\n`);
  return bySymbolDay;
}

function stats(label, values) {
  if (!values.length) return `  ${label.padEnd(26)} (none)`;
  const s = [...values].sort((a, b) => a - b);
  const up = s.filter((v) => v > 0).length;
  const mean = s.reduce((a, b) => a + b, 0) / s.length;
  const med = s[Math.floor(s.length / 2)];
  // Standard error, so "different" can be distinguished from "noisy".
  const sd = Math.sqrt(s.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(s.length - 1, 1));
  const se = sd / Math.sqrt(s.length);
  return `  ${label.padEnd(26)} n=${String(s.length).padStart(4)}  up ${String(Math.round((up / s.length) * 100)).padStart(3)}%  ` +
    `mean ${((mean >= 0 ? '+' : '') + mean.toFixed(1) + '%').padEnd(8)} ±${se.toFixed(1)}  ` +
    `median ${((med >= 0 ? '+' : '') + med.toFixed(1) + '%').padEnd(8)}`;
}

async function main() {
  const start = new Date(Date.now() - (DAYS + 20) * 86_400_000).toISOString().slice(0, 10);
  console.log(`\nNews vs no-news: drift or reversal?`);
  console.log(`Chan (2003) predicts drift after headlines, reversal without them, both`);
  console.log(`strongest in small illiquid names.\n`);
  console.log(`events: up >= ${MIN_CHANGE}% on >= ${MIN_VOLUME.toLocaleString()} shares, $${MIN_PRICE}-$${MAX_PRICE}, ${DAYS} sessions`);

  const assets = await get('https://paper-api.alpaca.markets/v2/assets?status=active&asset_class=us_equity');
  const symbols = assets.filter((a) => a.tradable && !a.symbol.includes('/')).map((a) => a.symbol);
  process.stderr.write(`  fetching daily bars for ${symbols.length.toLocaleString()} symbols…\n`);
  const daily = await bars(symbols, '1Day', start, TODAY);
  const news = await loadNews(start);

  const sessions = [...new Set(Object.values(daily).flatMap((l) => l.map((b) => b.t.slice(0, 10))))].sort();
  const recent = new Set(sessions.slice(-(DAYS + 1)));

  const events = [];
  for (const [sym, list] of Object.entries(daily)) {
    for (let i = 11; i + 1 < list.length; i += 1) {
      const day = list[i].t.slice(0, 10);
      if (!recent.has(day)) continue;
      const b = list[i], prev = list[i - 1], next = list[i + 1];
      if (!prev.c || prev.c <= 0 || b.c < MIN_PRICE || b.c > MAX_PRICE || b.v < MIN_VOLUME) continue;
      const change = ((b.c - prev.c) / prev.c) * 100;
      if (change < MIN_CHANGE) continue;

      // Liquidity before the event, which is what a trader would have known.
      const base = list.slice(i - 10, i);
      const medVol = [...base.map((x) => x.v)].sort((a, b2) => a - b2)[5] ?? 0;

      // A headline on the event day or the evening before counts as the cause.
      const prevDay = list[i - 1].t.slice(0, 10);
      const items = [...(news.get(`${sym}|${day}`) ?? []), ...(news.get(`${sym}|${prevDay}`) ?? [])];

      const after5 = list[i + 5];
      events.push({
        sym, day, change, close: b.c, medVol,
        hasNews: items.length > 0,
        headline: items[0]?.headline ?? null,
        newsAt: items[0]?.at ?? null,
        gap: ((next.o - b.c) / b.c) * 100,
        nextDay: ((next.c - b.c) / b.c) * 100,
        fiveDay: after5 ? ((after5.c - b.c) / b.c) * 100 : null,
      });
    }
  }

  const withNews = events.filter((e) => e.hasNews);
  const without = events.filter((e) => !e.hasNews);
  console.log(`\n${events.length} events; ${withNews.length} with a headline, ${without.length} without\n`);
  if (!events.length) return;

  console.log('NEXT-SESSION GAP');
  console.log(stats('news', withNews.map((e) => e.gap)));
  console.log(stats('no news', without.map((e) => e.gap)));
  console.log('\nNEXT-SESSION TOTAL RETURN (close to close)');
  console.log(stats('news', withNews.map((e) => e.nextDay)));
  console.log(stats('no news', without.map((e) => e.nextDay)));
  console.log('\nFIVE SESSIONS ON — where drift and reversal separate');
  console.log(stats('news', withNews.filter((e) => e.fiveDay !== null).map((e) => e.fiveDay)));
  console.log(stats('no news', without.filter((e) => e.fiveDay !== null).map((e) => e.fiveDay)));

  // Chan's prediction is that the effect is strongest where frictions bite.
  console.log('\nFIVE SESSIONS ON, BY PRE-EVENT LIQUIDITY (median volume over prior 10 sessions)');
  for (const [label, lo, hi] of [['illiquid <50k', 0, 50_000], ['50k-500k', 50_000, 500_000], ['liquid >500k', 500_000, Infinity]]) {
    const inBand = (e) => e.medVol >= lo && e.medVol < hi && e.fiveDay !== null;
    console.log(stats(`  news, ${label}`, withNews.filter(inBand).map((e) => e.fiveDay)));
    console.log(stats(`  no news, ${label}`, without.filter(inBand).map((e) => e.fiveDay)));
  }

  const m = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
  const n5 = withNews.filter((e) => e.fiveDay !== null).map((e) => e.fiveDay);
  const x5 = without.filter((e) => e.fiveDay !== null).map((e) => e.fiveDay);
  console.log(`\nChan's prediction: news drifts, no-news reverses.`);
  console.log(`  five-day, news    ${(m(n5) >= 0 ? '+' : '') + m(n5).toFixed(1)}%  (n=${n5.length})`);
  console.log(`  five-day, no news ${(m(x5) >= 0 ? '+' : '') + m(x5).toFixed(1)}%  (n=${x5.length})`);
  console.log(`  spread ${((m(n5) - m(x5)) >= 0 ? '+' : '') + (m(n5) - m(x5)).toFixed(1)} points, ${m(n5) > m(x5) ? 'in the predicted direction' : 'AGAINST the prediction'}.`);

  console.log('\nCaveats. Alpaca carries wire coverage, not primary releases — the JAGX');
  console.log('fee waiver and the VEEA term sheet never appeared on it — so "no news"');
  console.log('means "no headline on this feed", which understates the news arm and');
  console.log('biases the comparison toward the null. Round-ups are excluded because');
  console.log('they are published as a consequence of the move, not a cause of it.\n');
}

main().catch((e) => { console.error(`\nnewsdrift failed: ${e.message}\n`); process.exit(1); });
