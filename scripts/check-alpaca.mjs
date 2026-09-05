/**
 * Alpaca entitlement check.
 *
 * Exercises exactly what the worker does — batched snapshots, historical bars,
 * websocket auth, and a subscription the size of the configured universe — so
 * the result maps one-to-one onto whether MarketPulse will run.
 *
 * Reads credentials from .env.worker. Never prints them.
 *
 *   node scripts/check-alpaca.mjs
 */
import { readFileSync } from 'node:fs';
import WebSocket from 'ws';

// --- credentials ------------------------------------------------------------

/**
 * Credentials come from .env.worker, or from the environment when it is
 * absent — so this runs in CI, and can be run once without leaving a copy of
 * the keys on disk.
 */
let fileEnv = {};
try {
  fileEnv = Object.fromEntries(
    readFileSync(new URL('../.env.worker', import.meta.url), 'utf8')
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
      }),
  );
} catch {
  // No file is fine; the environment may carry the values instead.
}

// Environment wins, so a one-off run can override whatever is on disk.
const env = { ...fileEnv, ...process.env };

const KEY = env.ALPACA_API_KEY_ID;
const SECRET = env.ALPACA_API_SECRET_KEY;
const FEED = (env.ALPACA_FEED || 'iex').toLowerCase();

if (!KEY || !SECRET) {
  console.error('ALPACA_API_KEY_ID and ALPACA_API_SECRET_KEY must both be set in .env.worker');
  process.exit(1);
}

// The symbols the worker would actually subscribe to.
const SECTORS = (env.UNIVERSE_SECTORS || 'semiconductors,memory').split(',').map((s) => s.trim());
const { seedUniverse } = await import('../shared/market/universe.ts').catch(() => ({ seedUniverse: null }))
  .then((m) => m, () => ({ seedUniverse: null }));

let symbols = ['MU', 'NVDA', 'AMD', 'AVGO'];
if (seedUniverse) {
  const all = seedUniverse();
  const wanted = new Set(SECTORS);
  const picked = all.sectors.filter((s) => wanted.has(s.id));
  if (picked.length) {
    symbols = [...new Set(picked.flatMap((s) => s.constituents.map((c) => c.symbol)))];
  }
}

const REST = 'https://data.alpaca.markets/v2/stocks';
const headers = { 'APCA-API-KEY-ID': KEY, 'APCA-API-SECRET-KEY': SECRET };
const line = (label, ok, detail = '') =>
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label.padEnd(40)} ${detail}`);

async function rest(path, params = {}) {
  const url = new URL(REST + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers });
  let body = null;
  try { body = await res.json(); } catch { /* non-JSON error page */ }
  return { status: res.status, body };
}

console.log(`\nfeed: ${FEED}   universe: ${symbols.length} symbols (${SECTORS.join(', ')})`);
console.log('\n=== REST (worker warm-up) ===');

const snaps = await rest('/snapshots', { symbols: symbols.slice(0, 100).join(','), feed: FEED });
const returned = Object.keys(snaps.body?.snapshots ?? {}).length;
line('batched snapshots', snaps.status === 200 && returned > 0,
  snaps.status === 200
    ? `${returned}/${Math.min(symbols.length, 100)} symbols in one call`
    : `HTTP ${snaps.status} ${snaps.body?.message ?? ''}`);

const first = snaps.body?.snapshots?.[symbols[0]];
if (first) {
  line('previous close available', Boolean(first.prevDailyBar?.c),
    first.prevDailyBar?.c ? `${symbols[0]} prevClose=${first.prevDailyBar.c}` : 'missing');
}

const start = new Date(Date.now() - 20 * 86400000).toISOString();
const bars = await rest(`/${symbols[0]}/bars`,
  { timeframe: '1Min', start, limit: '1000', adjustment: 'raw', feed: FEED });
line('1-minute bars (RVOL baseline)', bars.status === 200 && (bars.body?.bars?.length ?? 0) > 0,
  bars.status === 200 ? `${bars.body?.bars?.length ?? 0} bars` : `HTTP ${bars.status} ${bars.body?.message ?? ''}`);

const daily = await rest(`/${symbols[0]}/bars`,
  { timeframe: '1Day', start, limit: '30', adjustment: 'raw', feed: FEED });
line('daily bars (volatility baseline)', daily.status === 200 && (daily.body?.bars?.length ?? 0) > 0,
  daily.status === 200 ? `${daily.body?.bars?.length ?? 0} bars` : `HTTP ${daily.status}`);

// --- websocket --------------------------------------------------------------

console.log('\n=== WebSocket (the live feed) ===');

const result = await new Promise((resolve) => {
  const ws = new WebSocket(`wss://stream.data.alpaca.markets/v2/${FEED}`);
  const done = (verdict, detail) => {
    try { ws.close(); } catch { /* already closing */ }
    resolve({ verdict, detail });
  };
  const timer = setTimeout(() => done('TIMEOUT', 'no response in 20s'), 20000);

  ws.on('open', () => ws.send(JSON.stringify({ action: 'auth', key: KEY, secret: SECRET })));
  ws.on('error', (e) => { clearTimeout(timer); done('ERROR', String(e.message ?? e)); });

  ws.on('message', (raw) => {
    let msgs; try { msgs = JSON.parse(raw.toString()); } catch { return; }
    for (const m of msgs) {
      if (m.T === 'success' && m.msg === 'authenticated') {
        // Subscribe to the whole configured universe, to test the plan's cap.
        ws.send(JSON.stringify({ action: 'subscribe', trades: symbols }));
        continue;
      }
      if (m.T === 'subscription') {
        clearTimeout(timer);
        return done('SUBSCRIBED', `${(m.trades ?? []).length}/${symbols.length} symbols accepted`);
      }
      if (m.T === 'error') {
        clearTimeout(timer);
        const hint = m.code === 406 ? ' (another connection is already open on this account)'
          : m.code === 405 ? ' (subscription larger than the plan allows)'
          : m.code === 402 ? ' (authentication failed — check the key pair)' : '';
        return done('ERROR', `${m.code}: ${m.msg}${hint}`);
      }
    }
  });
});

line('websocket auth + subscription', result.verdict === 'SUBSCRIBED', `${result.verdict}: ${result.detail}`);

if (result.verdict === 'SUBSCRIBED') {
  const accepted = Number(String(result.detail).split('/')[0]);
  if (Number.isFinite(accepted) && accepted < symbols.length) {
    console.log(`\n  The plan accepted ${accepted} of ${symbols.length} symbols. Narrow UNIVERSE_SECTORS`);
    console.log('  so every sector has its full constituent set, or breadth will be computed');
    console.log('  over a partial sector and read low.');
  } else {
    console.log('\n  Ready. Start the worker with ./scripts/run-worker.sh');
  }
}
console.log();
