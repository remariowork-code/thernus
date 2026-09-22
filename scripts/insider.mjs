/**
 * Insider cluster buying.
 *
 * A deliberate change of horizon. Every strategy tested here so far has been
 * intraday, long, micro-cap momentum — the exact quadrant where Barber et al.
 * find 80% of day traders losing and where transaction costs consume 63-100%
 * of documented anomaly profits. Six hypotheses died there, all for the same
 * reason: at a 15-25% round-trip spread, nothing survives.
 *
 * Insider buying moves the horizon out to months, which is the point. A 2%
 * cost against a 12-month hold is noise; against an intraday hold it was the
 * entire edge.
 *
 * The literature is unusually consistent for a retail-reachable signal:
 *
 *   Lakonishok & Lee (2002, RFS)  heavy insider buying beats the market by
 *                                 ~4.8% over the following 12 months
 *   Seyhun                        ~4.3% abnormal over 300 days
 *   Cluster buys                  roughly double the excess return of a
 *                                 single insider acting alone
 *   Small-cap officer clusters    ~7.4% abnormal over 12 months
 *
 * Data comes from SEC's quarterly Form 345 datasets — one download per quarter
 * instead of 54,000 individual filings, and free. Only TRANS_CODE 'P' counts:
 * open-market purchases made with the insider's own money. Option exercises
 * (M), grants (A) and tax withholding (F) are not decisions to buy and say
 * nothing about conviction.
 *
 *   npm run insider -- --quarters 2025q3,2025q4,2026q1
 *   npm run insider -- --quarters 2026q1 --min-insiders 3
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const flag = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? Number(args[i + 1]) : d; };
const str = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 && args[i + 1] ? args[i + 1] : d; };

const QUARTERS = str('quarters', '2026q1').split(',').map((q) => q.trim());
/** Distinct insiders buying inside the window for it to count as a cluster. */
const MIN_INSIDERS = flag('min-insiders', 2);
const WINDOW_DAYS = flag('window', 7);
/** Trivial purchases are noise — a director buying $3,000 is a gesture. */
const MIN_VALUE = flag('min-value', 25_000);
const CACHE = str('cache', '/private/tmp/claude-501/-Users-remariorichards-pro-Desktop-Projects-astech/48ccccc5-f669-4982-ad19-97c549bb9ce7/scratchpad/insider');
const UA = 'Thernus Research rrichards@aleysian.com';
const BACKTEST = args.includes('--backtest');
/**
 * Benchmark. SPY is the wrong one and the default is IWM for that reason:
 * insider clusters concentrate in small caps, and over a period when large
 * caps outrun small ones, subtracting SPY charges the strategy for a size
 * exposure rather than measuring selection. The literature adjusts for size,
 * value and momentum; IWM handles the first and largest of those.
 */
const BENCH = (str('bench', 'IWM')).toUpperCase();

let env = {};
try {
  env = Object.fromEntries(
    readFileSync(new URL('../.env.worker', import.meta.url), 'utf8')
      .split('\n').map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
  );
} catch { /* environment may carry the values */ }
const ALPACA = {
  'APCA-API-KEY-ID': process.env.ALPACA_API_KEY_ID || env.ALPACA_API_KEY_ID,
  'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET_KEY || env.ALPACA_API_SECRET_KEY,
};
const FEED = env.ALPACA_FEED || 'iex';

async function alpacaBars(symbols, start, end) {
  const out = {};
  for (let i = 0; i < symbols.length; i += 50) {
    const chunk = symbols.slice(i, i + 50).join(',');
    let token = null;
    do {
      const url = `https://data.alpaca.markets/v2/stocks/bars?symbols=${chunk}&timeframe=1Day` +
        `&start=${start}&end=${end}&limit=10000&adjustment=all&feed=${FEED}${token ? `&page_token=${token}` : ''}`;
      let res;
      try { res = await fetch(url, { headers: ALPACA }); } catch { break; }
      if (res.status === 429) { await new Promise((r) => setTimeout(r, 3000)); continue; }
      if (!res.ok) break;
      const body = await res.json();
      for (const [s, list] of Object.entries(body.bars ?? {})) (out[s] ??= []).push(...list);
      token = body.next_page_token ?? null;
    } while (token);
  }
  return out;
}

function summarise(label, values) {
  if (!values.length) return `  ${label.padEnd(30)} (none)`;
  const s = [...values].sort((a, b) => a - b);
  const up = s.filter((v) => v > 0).length;
  const mean = s.reduce((a, b) => a + b, 0) / s.length;
  const med = s[Math.floor(s.length / 2)];
  const sd = Math.sqrt(s.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(s.length - 1, 1));
  const se = sd / Math.sqrt(s.length);
  const t = se > 0 ? mean / se : 0;
  return `  ${label.padEnd(30)} n=${String(s.length).padStart(4)}  up ${String(Math.round((up / s.length) * 100)).padStart(3)}%  ` +
    `mean ${((mean >= 0 ? '+' : '') + mean.toFixed(1) + '%').padEnd(8)} ±${se.toFixed(1)}  t=${t.toFixed(1).padStart(5)}  ` +
    `median ${((med >= 0 ? '+' : '') + med.toFixed(1) + '%')}`;
}

/**
 * Forward returns from the first close AFTER the cluster became public,
 * measured against SPY over the identical window.
 *
 * The benchmark is the whole point. Insider buying clusters in beaten-down
 * small caps, and a raw return over 2025-26 mostly measures the market. What
 * the literature claims is an ABNORMAL return, so that is what is computed.
 */
async function backtest(clusters) {
  const symbols = [...new Set(clusters.map((c) => c.symbol))];
  const earliest = clusters.reduce((a, c) => (a < c.knownFrom ? a : c.knownFrom), '9999-99-99');
  const start = earliest;
  const end = new Date().toISOString().slice(0, 10);
  process.stderr.write(`  fetching daily bars for ${symbols.length} symbols plus SPY…\n`);
  const bars = await alpacaBars([...symbols, BENCH, 'SPY'], start, end);
  const spy = bars[BENCH] ?? [];
  if (!spy.length) { console.log(`\n  no ${BENCH} data; cannot compute abnormal returns\n`); return; }
  // State plainly what the benchmark itself did, so the abnormal figure can be
  // read against it rather than taken on trust.
  const benchMove = (n) => {
    const i = spy.findIndex((b) => b.t.slice(0, 10) > earliest);
    return i >= 0 && i + n < spy.length ? (((spy[i + n].c - spy[i].c) / spy[i].c) * 100).toFixed(1) : '—';
  };
  const other = bars[BENCH === 'SPY' ? 'IWM' : 'SPY'] ?? [];
  const otherMove = (n) => {
    const i = other.findIndex((b) => b.t.slice(0, 10) > earliest);
    return i >= 0 && i + n < other.length ? (((other[i + n].c - other[i].c) / other[i].c) * 100).toFixed(1) : '—';
  };
  console.log(`\n  benchmark ${BENCH}; from ${earliest} it returned ${benchMove(252)}% over 252 sessions`);
  console.log(`  (${BENCH === 'SPY' ? 'IWM' : 'SPY'} returned ${otherMove(252)}% over the same window)`);

  const HORIZONS = [[21, '1 month'], [63, '3 months'], [126, '6 months'], [252, '12 months']];
  const raw = {}; const abn = {};
  for (const [, label] of HORIZONS) { raw[label] = []; abn[label] = []; }

  const forward = (list, fromDate, n) => {
    const i = list.findIndex((b) => b.t.slice(0, 10) > fromDate);
    if (i < 0 || i + n >= list.length) return null;
    return { entry: list[i].c, exit: list[i + n].c, ret: ((list[i + n].c - list[i].c) / list[i].c) * 100 };
  };

  let scored = 0;
  for (const c of clusters) {
    const list = bars[c.symbol];
    if (!list || list.length < 30) continue;
    let any = false;
    for (const [n, label] of HORIZONS) {
      const stock = forward(list, c.knownFrom, n);
          const bench = forward(spy, c.knownFrom, n);
      if (!stock || !bench) continue;
      raw[label].push(stock.ret);
      abn[label].push(stock.ret - bench.ret);
      any = true;
    }
    if (any) scored += 1;
  }

  console.log(`\n  ${scored} of ${clusters.length} clusters have price data\n`);
  console.log('RAW RETURN FROM THE FIRST CLOSE AFTER THE CLUSTER WAS PUBLIC');
  for (const [, label] of HORIZONS) console.log(summarise(label, raw[label]));
  console.log(`\nABNORMAL RETURN (stock minus ${BENCH} over the same window)`);
  for (const [, label] of HORIZONS) console.log(summarise(label, abn[label]));

  console.log('\nBY CLUSTER SIZE, abnormal at the longest horizon with data');
  const longest = [...HORIZONS].reverse().find(([, l]) => abn[l].length >= 20);
  if (longest) {
    const [n, label] = longest;
    for (const [lab, lo, hi] of [['2 insiders', 2, 3], ['3-4 insiders', 3, 5], ['5+ insiders', 5, Infinity]]) {
      const vals = [];
      for (const c of clusters.filter((x) => x.insiders >= lo && x.insiders < hi)) {
        const list = bars[c.symbol]; if (!list) continue;
        const s2 = forward(list, c.knownFrom, n); const b2 = forward(spy, c.knownFrom, n);
        if (s2 && b2) vals.push(s2.ret - b2.ret);
      }
      console.log(summarise(`  ${lab} (${label})`, vals));
    }
  }
  console.log('\n  The literature claims ~4.8% abnormal over 12 months for heavy insider');
  console.log('  buying and roughly double that for clusters. t above about 2 would make');
  console.log('  a result distinguishable from noise at this sample size.\n');
}

function ensureQuarter(q) {
  const dir = `${CACHE}/${q}`;
  if (existsSync(`${dir}/NONDERIV_TRANS.tsv`)) return dir;
  mkdirSync(dir, { recursive: true });
  const zip = `${CACHE}/${q}.zip`;
  // SEC moved 2026q2 to a different prefix; try both rather than guessing.
  const urls = [
    `https://www.sec.gov/files/structureddata/data/insider-transactions-data-sets/${q}_form345.zip`,
    `https://www.sec.gov/files/datastandardsinnovation/data/insider-transactions-data-sets/${q}_form345.zip`,
  ];
  let ok = false;
  for (const url of urls) {
    try {
      execFileSync('curl', ['-sS', '-f', '-A', UA, '-o', zip, url], { stdio: 'pipe' });
      ok = true;
      break;
    } catch { /* try the next prefix */ }
  }
  if (!ok) throw new Error(`could not download ${q}`);
  execFileSync('unzip', ['-o', '-q', zip, '-d', dir]);
  return dir;
}

/** Tab-separated with a header row; values are never quoted in these files. */
function readTsv(path, keep) {
  const lines = readFileSync(path, 'utf8').split('\n');
  const head = lines[0].split('\t');
  const idx = Object.fromEntries(head.map((h, i) => [h, i]));
  const out = [];
  for (let i = 1; i < lines.length; i += 1) {
    if (!lines[i]) continue;
    const parts = lines[i].split('\t');
    const row = {};
    for (const k of keep) row[k] = parts[idx[k]];
    out.push(row);
  }
  return out;
}

/** SEC writes dates as 31-MAR-2026. */
const MONTHS = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };
function parseDate(s) {
  if (!s) return null;
  const m = s.match(/^(\d{2})-([A-Z]{3})-(\d{4})$/);
  if (!m) return null;
  return `${m[3]}-${MONTHS[m[2]]}-${m[1]}`;
}

function loadQuarter(q) {
  const dir = ensureQuarter(q);
  const subs = readTsv(`${dir}/SUBMISSION.tsv`, ['ACCESSION_NUMBER', 'FILING_DATE', 'ISSUERCIK', 'ISSUERNAME', 'ISSUERTRADINGSYMBOL', 'DOCUMENT_TYPE']);
  const owners = readTsv(`${dir}/REPORTINGOWNER.tsv`, ['ACCESSION_NUMBER', 'RPTOWNERCIK', 'RPTOWNERNAME', 'RPTOWNER_RELATIONSHIP', 'RPTOWNER_TITLE']);
  const trans = readTsv(`${dir}/NONDERIV_TRANS.tsv`, ['ACCESSION_NUMBER', 'TRANS_DATE', 'TRANS_CODE', 'TRANS_SHARES', 'TRANS_PRICEPERSHARE', 'TRANS_ACQUIRED_DISP_CD']);

  const subById = new Map(subs.map((s) => [s.ACCESSION_NUMBER, s]));
  const ownersById = new Map();
  for (const o of owners) {
    if (!ownersById.has(o.ACCESSION_NUMBER)) ownersById.set(o.ACCESSION_NUMBER, []);
    ownersById.get(o.ACCESSION_NUMBER).push(o);
  }

  const buys = [];
  for (const t of trans) {
    // 'P' is an open-market purchase. 'A' here is the acquired/disposed flag,
    // not a grant — a purchase is code P AND acquired.
    if (t.TRANS_CODE !== 'P' || t.TRANS_ACQUIRED_DISP_CD !== 'A') continue;
    const sub = subById.get(t.ACCESSION_NUMBER);
    if (!sub || sub.DOCUMENT_TYPE !== '4') continue;
    const symbol = (sub.ISSUERTRADINGSYMBOL || '').trim().toUpperCase();
    // Filers put all sorts of things in this field.
    if (!symbol || symbol.length > 5 || !/^[A-Z.]+$/.test(symbol)) continue;
    if (['NONE', 'N/A', 'NA', 'N.A.'].includes(symbol)) continue;

    const shares = Number(t.TRANS_SHARES);
    const price = Number(t.TRANS_PRICEPERSHARE);
    if (!(shares > 0) || !(price > 0)) continue;

    const own = (ownersById.get(t.ACCESSION_NUMBER) ?? [])[0];
    const rel = (own?.RPTOWNER_RELATIONSHIP || '').toLowerCase();

    buys.push({
      symbol,
      date: parseDate(t.TRANS_DATE),
      filed: parseDate(sub.FILING_DATE),
      insider: own?.RPTOWNERCIK ?? 'unknown',
      name: own?.RPTOWNERNAME ?? '',
      isOfficer: rel.includes('officer'),
      isDirector: rel.includes('director'),
      shares, price, value: shares * price,
    });
  }
  return buys;
}

/**
 * Group purchases into clusters.
 *
 * Keyed on distinct insider CIKs, not filings: one person filing three days of
 * purchases on one form is conviction from a single mind, which is precisely
 * what the cluster literature distinguishes from several people acting
 * independently.
 *
 * Clusters are dated by the LAST FILING date, not the transaction date. A
 * Form 4 is due two business days after the trade, so the transaction date is
 * not knowable when it happens — using it would be lookahead.
 */
function findClusters(buys) {
  const bySymbol = new Map();
  for (const b of buys) {
    if (!b.date || !b.filed) continue;
    if (!bySymbol.has(b.symbol)) bySymbol.set(b.symbol, []);
    bySymbol.get(b.symbol).push(b);
  }

  const clusters = [];
  for (const [symbol, list] of bySymbol) {
    list.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < list.length; i += 1) {
      const start = Date.parse(list[i].date);
      const window = list.filter((b) => {
        const d = Date.parse(b.date) - start;
        return d >= 0 && d <= WINDOW_DAYS * 86_400_000;
      });
      const insiders = new Set(window.map((b) => b.insider));
      if (insiders.size < MIN_INSIDERS) continue;
      const value = window.reduce((s, b) => s + b.value, 0);
      if (value < MIN_VALUE) continue;

      const known = window.reduce((a, b) => (a > b.filed ? a : b.filed), '0000-00-00');
      clusters.push({
        symbol,
        firstBuy: list[i].date,
        knownFrom: known,
        insiders: insiders.size,
        officers: new Set(window.filter((b) => b.isOfficer).map((b) => b.insider)).size,
        directors: new Set(window.filter((b) => b.isDirector).map((b) => b.insider)).size,
        value,
        avgPrice: window.reduce((s, b) => s + b.price * b.shares, 0) / window.reduce((s, b) => s + b.shares, 0),
        names: [...new Set(window.map((b) => b.name))].slice(0, 3),
      });
      // Skip past this window so one buying spree is not counted repeatedly.
      while (i + 1 < list.length && Date.parse(list[i + 1].date) - start <= WINDOW_DAYS * 86_400_000) i += 1;
    }
  }
  return clusters.sort((a, b) => b.knownFrom.localeCompare(a.knownFrom));
}

async function main() {
  console.log(`\nInsider cluster buys — ${QUARTERS.join(', ')}`);
  console.log(`cluster: >= ${MIN_INSIDERS} distinct insiders, open-market purchases (code P),`);
  console.log(`within ${WINDOW_DAYS} days, >= $${MIN_VALUE.toLocaleString()} combined\n`);

  let buys = [];
  for (const q of QUARTERS) {
    process.stderr.write(`  loading ${q}…\n`);
    buys = buys.concat(loadQuarter(q));
  }
  console.log(`  ${buys.length.toLocaleString()} open-market purchases across ${new Set(buys.map((b) => b.symbol)).size.toLocaleString()} symbols`);

  const clusters = findClusters(buys);
  console.log(`  ${clusters.length.toLocaleString()} clusters\n`);

  const out = `${CACHE}/clusters.json`;
  writeFileSync(out, JSON.stringify(clusters, null, 1));

  console.log('  KNOWN FROM   SYMBOL   INSIDERS  OFF/DIR      VALUE   AVG PRICE   WHO');
  for (const c of clusters.slice(0, 30)) {
    console.log(
      `  ${c.knownFrom}   ${c.symbol.padEnd(7)} ${String(c.insiders).padStart(6)}    ${c.officers}/${c.directors}    ` +
      `$${Math.round(c.value).toLocaleString().padStart(10)}   ${('$' + c.avgPrice.toFixed(2)).padStart(9)}   ${c.names[0]?.slice(0, 28) ?? ''}`,
    );
  }
  if (BACKTEST) { await backtest(clusters); return; }

  console.log(`\n  ${clusters.length} clusters written to ${out}`);
  console.log('  KNOWN FROM is the last filing date in the cluster — the first moment the');
  console.log('  whole pattern was public. Transaction dates are not usable as signal dates:');
  console.log('  a Form 4 is due two business days after the trade, so acting on the trade');
  console.log('  date would be lookahead.\n');
}

main().catch((e) => { console.error(`\ninsider failed: ${e.message}\n`); process.exit(1); });
