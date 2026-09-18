/**
 * Overnight gap candidates — what might open higher tomorrow.
 *
 * The premise comes from VEEA. On Monday 14 September it ran 41% during the
 * session on roughly a hundred times its normal volume, the merger term sheet
 * was released at about 16:42, it added 28.8% after hours, and it opened the
 * next morning up 149%. Every part of that except the last was visible before
 * the close of the after-hours session.
 *
 * So this scans for the three things that were true that evening: an unusual
 * day, continued buying after the bell, and a catalyst on the tape. It ranks
 * on after-hours *participation* rather than the after-hours percentage,
 * because a 60% move on four hundred shares is one order, not a signal.
 *
 * What it cannot do, stated plainly so the output is not over-read:
 *
 *  - It does not predict tomorrow. It reports what already happened this
 *    evening. After-hours moves fade by the open at least as often as they
 *    extend, and the ones that extend are not identifiable here.
 *  - News classification is keyword matching over headlines. It is a sorting
 *    aid, not a reading of the filing.
 *  - A dilutive financing is "news" and reads as a catalyst to a naive filter,
 *    so offerings and splits are flagged separately and negatively.
 *  - IEX is a few percent of the consolidated tape. Volumes rank; they do not
 *    size.
 *
 *   npm run overnight                    scan this evening (run after 16:00 ET)
 *   npm run overnight -- --date 2026-09-14    replay a past evening
 *   npm run overnight -- --min-ah-pct 10 --top 15
 *   npm run overnight -- --verify 15         replay and score the last 15 evenings
 *
 * Use --verify before trusting any of this. On the first seven candidates it
 * produced, one gapped up 89% and six gapped down, two of them by more than a
 * quarter. That distribution is the whole story and it is why the output leads
 * with participation rather than with a prediction.
 */
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : fallback;
};
const str = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const TOP = flag('top', 20);
const MIN_PRICE = flag('min-price', 0.5);
const MAX_PRICE = flag('max-price', 500);
/** The session itself has to have been unusual, or there is nothing to follow. */
const MIN_DAY_PCT = flag('min-day-pct', 10);
const MIN_DAY_VOLUME = flag('min-day-volume', 10_000);
/** After-hours move worth reporting. */
const MIN_AH_PCT = flag('min-ah-pct', 3);
/** Below this, an after-hours percentage is one print and means nothing. */
const MIN_AH_VOLUME = flag('min-ah-volume', 500);
const SHORTLIST = flag('shortlist', 60);
const DATE = str('date', null);
/** Sessions to replay and score against what actually happened next. */
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

const nyDate = (d = Date.now()) => new Date(d).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
const nyTime = (d) => new Date(d).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }).slice(0, 5);
const nyMinutes = (d) => { const [h, m] = nyTime(d).split(':').map(Number); return h * 60 + m; };

const DAY = DATE ?? nyDate();

async function get(url, attempt = 0) {
  const res = await fetch(url, { headers: H });
  if (res.status === 429 && attempt < 6) {
    await new Promise((r) => setTimeout(r, Math.min(60_000, 2_000 * 2 ** attempt)));
    return get(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Headline classification.
 *
 * Deliberately conservative. An earlier version of the sector scanner matched
 * "to buy" and classified "upgrades to buy rating" as an acquisition, so the
 * merger patterns here require the verb forms that actually appear in deal
 * announcements. Anything unmatched stays unlabelled rather than being guessed.
 */
const CATEGORIES = [
  ['DILUTION', /\b(public|registered\s+direct|underwritten)\s+offering|\bprices?\s+\$?[\d.]+\s*m(illion)?\s+(offering|placement)|\bat[- ]the[- ]market\b|\bshelf\s+(registration|offering)|\bwarrant\s+(exercise|inducement)|\breverse\s+(stock\s+)?split\b|\bregistered\s+direct\b/i],
  ['MERGER', /\b(merger|business\s+combination|to\s+merge|agrees?\s+to\s+acquire|agreed\s+to\s+acquire|acquisition\s+of|term\s+sheet|definitive\s+agreement|letter\s+of\s+intent|take[- ]private)\b/i],
  ['REGULATORY', /\b(fda|ema|mhra)\b.*\b(approv|clearance|cleared|designation|fast\s?track|breakthrough|orphan)|\b(approv\w*|clearance)\b.*\bfda\b|\b510\(k\)\b|\bpdufa\b/i],
  ['CLINICAL', /\b(phase\s?[1-3i]{1,3}|topline|interim)\b.*\b(data|results?|endpoint|met\b)|\bmet\s+(the\s+)?primary\s+endpoint\b|\bpositive\s+(results?|data)\b/i],
  ['CONTRACT', /\b(awarded|wins?|secures?|signs?|receives?)\b.*\b(contract|order|agreement|partnership|deal|award)\b|\b\$\d[\d.,]*\s*(m|b)(illion)?\s+(contract|order|award)\b/i],
  ['EARNINGS', /\b(q[1-4]|quarter|fy\d{2,4}|full[- ]year)\b.*\b(results?|earnings|revenue)\b|\b(beats?|misses?|tops?)\b.*\b(estimate|consensus|expectations)\b|\braises?\s+(fy\s?\d*\s*)?guidance\b/i],
  ['ANALYST', /\b(upgrade[sd]?|downgrade[sd]?|initiat\w+\s+coverage|price\s+target)\b/i],
];

/**
 * Classify on headline *and* summary.
 *
 * Alpaca's feed carries wire coverage rather than the primary release: the VEEA
 * term sheet went out on GlobeNewswire at about 16:42 and never appears here,
 * while Benzinga's write-up does — and its headline is "Veea Stock Jumps 83%
 * After Hours: Here Is Why the Stock Is Moving", which names no catalyst at
 * all. The summary is where the merger is actually mentioned, so both are read.
 */
function classify(item) {
  const text = `${item.headline ?? ''} ${item.summary ?? ''}`;
  for (const [name, pattern] of CATEGORIES) if (pattern.test(text)) return name;
  return null;
}

/** Categories that make a gap more credible, and the one that makes it less. */
const BULLISH = new Set(['MERGER', 'REGULATORY', 'CLINICAL', 'CONTRACT']);

async function tradableSymbols() {
  const assets = await get('https://paper-api.alpaca.markets/v2/assets?status=active&asset_class=us_equity');
  return assets.filter((a) => a.tradable && !a.symbol.includes('/')).map((a) => a.symbol);
}

async function bars(symbols, timeframe, start, end) {
  const out = {};
  for (let i = 0; i < symbols.length; i += 50) {
    const chunk = symbols.slice(i, i + 50).join(',');
    let token = null;
    do {
      const url = `https://data.alpaca.markets/v2/stocks/bars?symbols=${chunk}&timeframe=${timeframe}` +
        `&start=${start}${end ? `&end=${end}` : ''}&limit=10000&adjustment=all&feed=${FEED}` +
        `${token ? `&page_token=${token}` : ''}`;
      let body;
      try { body = await get(url); } catch { break; }
      for (const [sym, list] of Object.entries(body.bars ?? {})) (out[sym] ??= []).push(...list);
      token = body.next_page_token ?? null;
    } while (token);
  }
  return out;
}

/** Stage one: which names had a session worth following. */
function findUnusualDays(daily, day) {
  const rows = [];
  for (const [sym, list] of Object.entries(daily)) {
    const i = list.findIndex((b) => b.t.slice(0, 10) === day);
    if (i < 1) continue;                       // need the day and the one before it
    const today = list[i];
    const prev = list[i - 1];
    if (!prev.c || prev.c <= 0) continue;
    if (today.c < MIN_PRICE || today.c > MAX_PRICE) continue;
    if (today.v < MIN_DAY_VOLUME) continue;

    const dayPct = ((today.c - prev.c) / prev.c) * 100;
    if (dayPct < MIN_DAY_PCT) continue;

    // Today's volume against its own recent normal, which is the part that
    // separates a real event from a drifting microcap.
    const baseline = list.slice(Math.max(0, i - 5), i);
    const avgVol = baseline.length ? baseline.reduce((s, b) => s + b.v, 0) / baseline.length : 0;
    rows.push({ sym, close: today.c, prevClose: prev.c, dayPct, dayVol: today.v,
      volRatio: avgVol > 0 ? today.v / avgVol : 0 });
  }
  return rows.sort((a, b) => b.volRatio * Math.abs(b.dayPct) - a.volRatio * Math.abs(a.dayPct));
}

/** Stage two: did buying continue after the bell? */
async function afterHours(shortlist, day) {
  const symbols = shortlist.map((r) => r.sym);
  const end = new Date(Date.parse(`${day}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
  const minute = await bars(symbols, '1Min', day, end);

  for (const row of shortlist) {
    const list = (minute[row.sym] ?? []).filter((b) => b.t.slice(0, 10) === day);
    // 16:00-20:00 New York. Bars before 09:30 belong to this morning, not tonight.
    const ah = list.filter((b) => { const m = nyMinutes(Date.parse(b.t)); return m >= 16 * 60 && m < 20 * 60; });
    row.ahVol = ah.reduce((s, b) => s + b.v, 0);
    row.ahLast = ah.length ? ah[ah.length - 1].c : null;
    row.ahAt = ah.length ? ah[ah.length - 1].t : null;
    row.ahPct = row.ahLast ? ((row.ahLast - row.close) / row.close) * 100 : 0;
  }
  return shortlist;
}

/** Stage three: what was on the tape, and when relative to the close. */
async function attachNews(shortlist, day) {
  const symbols = shortlist.map((r) => r.sym);
  const bysymbol = new Map();
  for (let i = 0; i < symbols.length; i += 40) {
    const chunk = symbols.slice(i, i + 40).join(',');
    const start = `${day}T00:00:00Z`;
    const endDay = new Date(Date.parse(`${day}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
    let body;
    try {
      body = await get(`https://data.alpaca.markets/v1beta1/news?symbols=${chunk}` +
        `&start=${start}&end=${endDay}T12:00:00Z&limit=50&sort=desc`);
    } catch { continue; }
    for (const item of body.news ?? []) {
      for (const sym of item.symbols ?? []) {
        if (!symbols.includes(sym)) continue;
        const list = byymbolGet(bysymbol, sym);
        // Multi-stock round-ups describe moves rather than causing them and
        // would otherwise dominate every row. Single-stock "why is it moving"
        // pieces are kept: they name no catalyst in the headline but usually
        // carry it in the summary, which is what classify() reads.
        const roundUp = /\b\d+\s+(stocks?|.*\s+stocks?)\s+moving\b|\bhere\s+are\s+\d+\s+stocks?\b|\bon\s+investors'?\s+radars?\b|\bmarket\s+(summary|wrap)\b|\b(dow|nasdaq|s&p)\b.*\b(points?|tumbles?|rises?|falls?)\b/i;
        if (roundUp.test(item.headline)) continue;
        list.push({
          headline: item.headline, summary: item.summary ?? '',
          at: item.created_at, category: classify(item),
        });
      }
    }
  }
  for (const row of shortlist) {
    const seen = new Set();
    const items = byymbolGet(bysymbol, row.sym)
      .filter((n) => { const k = n.headline.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
    row.news = items.slice(0, 3);
    row.categories = [...new Set(items.map((n) => n.category).filter(Boolean))];
  }
  return shortlist;
}

function byymbolGet(map, key) {
  if (!map.has(key)) map.set(key, []);
  return map.get(key);
}

/**
 * Rank. After-hours participation first, then the day's own unusualness, with
 * an explicit penalty for financings — a stock up after hours on an offering is
 * up because the offering was priced at a discount to where it traded, which is
 * not a reason to expect a higher open.
 */
function score(r) {
  const ahParticipation = Math.log10(1 + (r.ahVol ?? 0));
  const catalyst = r.categories.some((c) => BULLISH.has(c)) ? 1.5 : 1;
  const dilution = r.categories.includes('DILUTION') ? 0.3 : 1;
  return (Math.max(r.ahPct, 0) + 1) * ahParticipation * catalyst * dilution;
}

async function scanEvening(daily, day) {
  const unusual = findUnusualDays(daily, day);
  if (unusual.length === 0) return { unusual: 0, ranked: [] };
  const shortlist = unusual.slice(0, SHORTLIST);
  await afterHours(shortlist, day);
  await attachNews(shortlist, day);
  const ranked = shortlist
    .filter((r) => (r.ahVol ?? 0) >= MIN_AH_VOLUME && r.ahPct >= MIN_AH_PCT)
    .sort((a, b) => score(b) - score(a))
    .slice(0, TOP);
  return { unusual: unusual.length, ranked };
}

/** What a flagged name actually did on the following session. */
function nextSession(daily, sym, day) {
  const list = daily[sym] ?? [];
  const i = list.findIndex((b) => b.t.slice(0, 10) === day);
  if (i < 0 || i + 1 >= list.length) return null;
  const flagged = list[i];
  const next = list[i + 1];
  return {
    nextDate: next.t.slice(0, 10),
    gap: ((next.o - flagged.c) / flagged.c) * 100,
    // Deliberately not called `day`: the caller already has a `day` holding the
    // flagged date, and spreading this over it silently replaced a date with a
    // percentage.
    nextPct: ((next.c - flagged.c) / flagged.c) * 100,
  };
}

/**
 * Replay N evenings and score them.
 *
 * This is the part that decides whether any of the rest is worth acting on,
 * so it reports the gap distribution rather than a hit rate alone: a strategy
 * of buying every candidate is defined by the size of the winners against the
 * size of the losers, not by how often it is right.
 */
async function verify(daily, days) {
  const sessions = [...new Set(Object.values(daily).flatMap((l) => l.map((b) => b.t.slice(0, 10))))]
    .sort();
  // The last session has no "next" to score against.
  const scored = sessions.slice(-(days + 1), -1);
  const results = [];

  for (const day of scored) {
    const { ranked } = await scanEvening(daily, day);
    for (const r of ranked) {
      const outcome = nextSession(daily, r.sym, day);
      if (outcome) results.push({ flaggedOn: day, sym: r.sym, ...outcome, categories: r.categories });
    }
  }

  if (results.length === 0) { console.log('\n  no candidates over that window\n'); return; }

  console.log(`\n  FLAGGED      SYMBOL      GAP     NEXT DAY   CATALYST`);
  for (const r of results) {
    console.log(`  ${r.flaggedOn}   ${r.sym.padEnd(8)} ${((r.gap >= 0 ? '+' : '') + r.gap.toFixed(1) + '%').padStart(7)} ` +
      `${((r.nextPct >= 0 ? '+' : '') + r.nextPct.toFixed(1) + '%').padStart(10)}   ${r.categories.join(',') || '—'}`);
  }

  const gaps = results.map((r) => r.gap).sort((a, b) => a - b);
  const up = gaps.filter((g) => g > 0).length;
  const mean = gaps.reduce((s, g) => s + g, 0) / gaps.length;
  const median = gaps[Math.floor(gaps.length / 2)];
  console.log(`\n  ${results.length} candidates over ${scored.length} evenings.`);
  console.log(`  Gapped up: ${up}/${results.length} (${Math.round((up / results.length) * 100)}%).`);
  console.log(`  Mean gap ${mean >= 0 ? '+' : ''}${mean.toFixed(1)}%, median ${median >= 0 ? '+' : ''}${median.toFixed(1)}%, ` +
    `worst ${gaps[0].toFixed(1)}%, best +${gaps[gaps.length - 1].toFixed(1)}%.`);
  console.log(`  A median well below the mean means the average is carried by one or two names.`);
  console.log('  Buying every candidate is only viable if the winners are large enough to pay');
  console.log('  for the rest, and this sample is far too small to say whether they are.\n');
}

async function main() {
  const now = Date.now();
  const live = !DATE;
  if (live && nyMinutes(now) < 16 * 60) {
    console.log(`\nIt is ${nyTime(now)} ET. This scans the evening after a close —` +
      ' run it after 16:00, or pass --date to replay a past session.\n');
  }

  console.log(`\nOvernight gap candidates for the session after ${DAY}`);
  console.log(`floors: day move >= ${MIN_DAY_PCT}%, day volume >= ${MIN_DAY_VOLUME.toLocaleString()},` +
    ` price $${MIN_PRICE}-$${MAX_PRICE}, after-hours volume >= ${MIN_AH_VOLUME.toLocaleString()}`);

  const symbols = await tradableSymbols();
  const window = VERIFY ? VERIFY + 9 : 7;
  const start = new Date(Date.parse(`${DAY}T00:00:00Z`) - window * 86_400_000).toISOString().slice(0, 10);
  const end = new Date(Date.parse(`${DAY}T00:00:00Z`) + 2 * 86_400_000).toISOString().slice(0, 10);
  process.stderr.write(`  fetching daily bars for ${symbols.length.toLocaleString()} symbols…\n`);
  const daily = await bars(symbols, '1Day', start, end);

  if (VERIFY) { await verify(daily, VERIFY); return; }

  const { unusual, ranked } = await scanEvening(daily, DAY);
  console.log(`  ${unusual} symbols had an unusual session`);
  if (unusual === 0) { console.log(); return; }

  if (ranked.length === 0) {
    console.log(`  none of them kept trading after the bell above the floors\n`);
    return;
  }

  console.log(`\n  SYMBOL      CLOSE    DAY %   VOL vs 5d      AH %     AH VOL   LAST   CATALYST`);
  for (const r of ranked) {
    const tags = r.categories.length
      ? r.categories.join(',')
      : (r.news.length ? 'unclassified' : 'no news on feed');
    console.log(
      `  ${r.sym.padEnd(8)} ${('$' + r.close.toFixed(2)).padStart(8)} ` +
      `${('+' + r.dayPct.toFixed(0) + '%').padStart(7)} ${((r.volRatio >= 10 ? r.volRatio.toFixed(0) : r.volRatio.toFixed(1)) + 'x').padStart(9)}  ` +
      `${((r.ahPct >= 0 ? '+' : '') + r.ahPct.toFixed(1) + '%').padStart(8)} ` +
      `${(r.ahVol ?? 0).toLocaleString().padStart(10)}  ${r.ahAt ? nyTime(Date.parse(r.ahAt)) : '  —  '}   ${tags}`,
    );
    for (const n of r.news) {
      const when = nyTime(Date.parse(n.at));
      const afterClose = nyMinutes(Date.parse(n.at)) >= 16 * 60 ? ' *after close*' : '';
      console.log(`             ${when}${afterClose}  ${n.headline.slice(0, 96)}`);
    }
  }

  console.log('\n  * after close = published once the session had ended, so it is not in the day price.');
  console.log('  "no news on feed" means Alpaca carried nothing. Primary releases on GlobeNewswire');
  console.log('  and PR Newswire frequently do not appear there, so check the ticker before');
  console.log('  concluding there was no catalyst — the VEEA term sheet itself never showed up.');
  console.log('  DILUTION is a financing, priced below the market: a reason to be more sceptical,');
  console.log('  not less. IEX volumes rank but do not size.');
  console.log('  This reports tonight. It does not predict tomorrow — after-hours moves fade at');
  console.log('  least as often as they extend, and which ones extend is not visible here.\n');
}

main().catch((e) => { console.error(`\novernight failed: ${e.message}\n`); process.exit(1); });
