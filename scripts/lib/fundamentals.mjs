/**
 * Float, short interest and reverse splits — from free sources, reconciled.
 *
 * Every large move logged over nine sessions turned out to be a float story,
 * and none of the data that explains it was in the market feed. What separated
 * the names that held from the names that faded was short interest:
 *
 *   held    GRML 22.4% of float short, VEEA 42.2%
 *   faded   LHSW 1.28%, DCOY 2.31%
 *
 * and what made them able to move at all was float size — GLND, with 27M
 * shares against GRML's 2.9M, stalled at the open on the identical catalyst.
 *
 * Three sources, none of which need an API key beyond the Alpaca one already
 * in use:
 *
 *   Alpaca corporate actions   reverse splits, current, paginated
 *   SEC XBRL company facts     shares outstanding, as of a filing date
 *   FINRA consolidated SI      short interest, as of a settlement date
 *
 * The critical detail is that the last two are both AS OF A DATE, and these
 * companies reverse-split constantly — all seven names in the sample did one
 * in 2026, JAGX twice. An unadjusted SEC figure for GRML reads 158,850,637
 * shares; adjusted for the 50-to-1 on 24 August it reads 3,177,013, which is
 * what the market actually sees. Skipping that step does not make the number
 * slightly stale, it makes it wrong by a factor of fifty.
 */

const SEC_UA = { 'User-Agent': 'thernus-research (personal research tool)' };

/** SEC asks for fewer than 10 requests a second and means it. */
const SEC_DELAY_MS = 120;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function makeAlpacaHeaders(key, secret) {
  return { 'APCA-API-KEY-ID': key, 'APCA-API-SECRET-KEY': secret };
}

/**
 * Every reverse split in the window, keyed by symbol.
 *
 * Paginated deliberately: the API returns results alphabetically, so a single
 * page silently truncates at whatever letter it runs out on. A one-page fetch
 * over 2026 returned AEMD and GIPR but not VEEA, which looks exactly like
 * "VEEA never split" rather than "the response ended at the letter S".
 */
export async function loadReverseSplits(headers, start, end) {
  const out = new Map();
  let token = null;
  do {
    const url = `https://data.alpaca.markets/v1/corporate-actions?types=reverse_split` +
      `&start=${start}&end=${end}&limit=1000${token ? `&page_token=${token}` : ''}`;
    const res = await fetch(url, { headers });
    if (!res.ok) break;
    const body = await res.json();
    for (const s of body.corporate_actions?.reverse_splits ?? []) {
      const date = s.process_date ?? s.ex_date;
      const ratio = s.old_rate / s.new_rate;
      if (!date || !Number.isFinite(ratio) || ratio <= 1) continue;
      if (!out.has(s.symbol)) out.set(s.symbol, []);
      out.get(s.symbol).push({ date, ratio });
    }
    token = body.next_page_token ?? null;
  } while (token);
  for (const list of out.values()) list.sort((a, b) => a.date.localeCompare(b.date));
  return out;
}

/** Combined ratio of every split strictly after `since`. */
export function splitFactorAfter(splits, since) {
  if (!splits?.length) return 1;
  return splits.filter((s) => s.date > since).reduce((f, s) => f * s.ratio, 1);
}

let tickerMap = null;

/** Ticker -> zero-padded CIK, fetched once. */
export async function loadCikMap() {
  if (tickerMap) return tickerMap;
  const res = await fetch('https://www.sec.gov/files/company_tickers.json', { headers: SEC_UA });
  if (!res.ok) throw new Error(`SEC ticker map: ${res.status}`);
  const body = await res.json();
  tickerMap = new Map(Object.values(body).map((x) => [x.ticker, String(x.cik_str).padStart(10, '0')]));
  return tickerMap;
}

/**
 * Shares outstanding for one symbol, with the date it was reported.
 *
 * Returns null when the company has not tagged the concept recently — JAGX's
 * most recent filing of it is from 2018, which is worse than useless if taken
 * at face value, so the caller is told the date and can decide.
 */
export async function fetchSharesOutstanding(symbol, cikMap) {
  const cik = cikMap.get(symbol);
  if (!cik) return null;
  const url = `https://data.sec.gov/api/xbrl/companyconcept/CIK${cik}/dei/EntityCommonStockSharesOutstanding.json`;
  const res = await fetch(url, { headers: SEC_UA });
  if (!res.ok) return null;
  const body = await res.json();
  const units = body.units?.shares ?? [];
  if (!units.length) return null;
  const last = units.reduce((a, b) => (a.end > b.end ? a : b));
  return { shares: Number(last.val), asOf: last.end, filed: last.filed };
}

/** Shares outstanding for many symbols, politely. */
export async function loadSharesOutstanding(symbols) {
  const cikMap = await loadCikMap();
  const out = new Map();
  for (const s of symbols) {
    try {
      const r = await fetchSharesOutstanding(s, cikMap);
      if (r) out.set(s, r);
    } catch { /* one missing symbol must not end the scan */ }
    await sleep(SEC_DELAY_MS);
  }
  return out;
}

/**
 * The most recent published short-interest snapshot.
 *
 * FINRA partitions on settlementDate and will not sort without it, so the only
 * way to find the latest is to walk backwards through candidate dates. Reports
 * settle twice a month and publish about a week later, so the freshest data is
 * routinely two to three weeks old — old enough that a reverse split can land
 * in between, which is why the caller must adjust.
 */
export async function loadShortInterest(symbols, asOf = new Date()) {
  const candidates = [];
  for (let back = 0; back < 75; back += 1) {
    const d = new Date(asOf.getTime() - back * 86_400_000);
    const day = d.getUTCDate();
    const iso = d.toISOString().slice(0, 10);
    // Settlements land on the 15th and the last day of the month.
    const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
    if (day === 15 || day === last) candidates.push(iso);
  }

  for (const settlementDate of candidates) {
    const rows = await finraQuery(settlementDate, symbols);
    if (rows === null) continue;             // nothing published for that date
    if (rows.length === 0) continue;
    const out = new Map();
    for (const r of rows) {
      out.set(r.symbolCode, {
        shortInterest: Number(r.currentShortPositionQuantity),
        previous: Number(r.previousShortPositionQuantity),
        avgDailyVolume: Number(r.averageDailyVolumeQuantity),
        daysToCover: Number(r.daysToCoverQuantity),
        settlementDate: r.settlementDate,
      });
    }
    return { settlementDate, data: out };
  }
  return { settlementDate: null, data: new Map() };
}

async function finraQuery(settlementDate, symbols) {
  const body = {
    limit: Math.max(symbols.length * 2, 50),
    compareFilters: [{ fieldName: 'settlementDate', fieldValue: settlementDate, compareType: 'EQUAL' }],
  };
  if (symbols.length && symbols.length <= 200) {
    body.orFilters = [{
      compareFilters: symbols.map((s) => ({ fieldName: 'symbolCode', fieldValue: s, compareType: 'EQUAL' })),
    }];
  }
  try {
    const res = await fetch('https://api.finra.org/data/group/otcMarket/name/consolidatedShortInterest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.status === 204) return null;
    if (!res.ok) return null;
    const text = await res.text();
    if (!text.trim()) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Put the three sources together for one symbol, split-adjusting both of the
 * dated ones. Returns nulls rather than guesses where a source is silent.
 */
export function reconcile({ symbol, shares, shortInfo, splits, todayVolume }) {
  const splitList = splits ?? [];

  let floatShares = null;
  let sharesAsOf = null;
  let sharesStale = false;
  if (shares) {
    const factor = splitFactorAfter(splitList, shares.asOf);
    floatShares = shares.shares / factor;
    sharesAsOf = shares.asOf;
    // A year-old share count on a company that splits twice a year is not a
    // share count, it is a historical note.
    sharesStale = (Date.now() - Date.parse(shares.asOf)) > 400 * 86_400_000;
  }

  let shortInterest = null;
  let shortPercent = null;
  if (shortInfo) {
    const factor = splitFactorAfter(splitList, shortInfo.settlementDate);
    shortInterest = shortInfo.shortInterest / factor;
    // A percentage is only as good as its denominator. JAGX's most recent SEC
    // share count is from 2018, which produced a short float of 123.6% and
    // sorted it to the top of the list. A confidently wrong number outranking
    // correct ones is worse than a blank, so stale share counts yield no
    // percentage at all.
    if (floatShares > 0 && !sharesStale) shortPercent = (shortInterest / floatShares) * 100;
  }

  return {
    symbol,
    floatShares,
    sharesAsOf,
    sharesStale,
    shortInterest,
    shortPercent,
    daysToCover: shortInfo?.daysToCover ?? null,
    shortAsOf: shortInfo?.settlementDate ?? null,
    // The metric the industry actually uses: how many times the entire
    // tradeable supply changed hands today.
    floatRotation: floatShares > 0 && todayVolume && !sharesStale
      ? todayVolume / floatShares
      : null,
    lastSplit: splitList.length ? splitList[splitList.length - 1] : null,
  };
}
