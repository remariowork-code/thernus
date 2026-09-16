/**
 * Why did the bot not take that trade?
 *
 * Replays a single symbol's session minute by minute and reports, for every
 * minute, which entry condition blocked it. This exists because the opposite
 * question — why *did* it trade — is answered by the trade log, while "why did
 * it sit out the biggest mover of the day" previously required guesswork.
 *
 * Note that `blockedBy` reports the FIRST failing condition in rule order, so
 * a minute counted against the price band may also have failed on volume. The
 * per-condition tally below is therefore computed independently: it counts how
 * many minutes each condition failed, regardless of what else failed too.
 *
 * Usage:
 *   npm run trader:explain -- --symbol RETO --profile penny
 *   npm run trader:explain -- --symbol RETO --date 2026-09-15 --profile penny
 */
import { computeMomentumScore } from '../../shared/calculations/momentum';
import { buildRvolProfile, computeRvol, genericRvolProfile, minuteOfSession } from '../../shared/calculations/rvol';
import { computeVolatilityExpansion } from '../../shared/calculations/volatility';
import { computeVolumeAcceleration } from '../../shared/calculations/volume';
import { vwapDistance } from '../../shared/calculations/vwap';
import { getConfig } from '../../shared/config';
import { nyParts } from '../../shared/market/session';
import type { StockMetrics } from '../../shared/types';
import { getTraderConfig, isProfileName, type EntryRules, type ProfileName } from './config';
import { evaluateEntry } from './engine/EntryRules';

const HEADERS = {
  'APCA-API-KEY-ID': process.env.ALPACA_API_KEY_ID ?? process.env.ALPACA_KEY_ID ?? '',
  'APCA-API-SECRET-KEY': process.env.ALPACA_API_SECRET_KEY ?? process.env.ALPACA_SECRET_KEY ?? '',
};
const FEED = process.env.ALPACA_FEED ?? 'iex';

interface AlpacaBar { t: string; o: number; h: number; l: number; c: number; v: number; vw: number }

function arg(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

async function fetchBars(symbol: string, timeframe: string, start: string): Promise<AlpacaBar[]> {
  const out: AlpacaBar[] = [];
  let token: string | null = null;
  do {
    const url =
      `https://data.alpaca.markets/v2/stocks/bars?symbols=${symbol}&timeframe=${timeframe}` +
      `&start=${start}&limit=10000&adjustment=all&feed=${FEED}${token ? `&page_token=${token}` : ''}`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${await res.text()}`);
    const body = (await res.json()) as { bars?: Record<string, AlpacaBar[]>; next_page_token?: string | null };
    out.push(...(body.bars?.[symbol] ?? []));
    token = body.next_page_token ?? null;
  } while (token);
  return out;
}

/** Each entry condition as an independent predicate, for the tally. */
function conditionResults(m: StockMetrics, e: EntryRules): Array<{ label: string; ok: boolean; value: string }> {
  return [
    { label: `price $${e.minPrice}-$${e.maxPrice}`, ok: m.price >= e.minPrice && m.price <= e.maxPrice, value: `$${m.price.toFixed(2)}` },
    { label: `volume >= ${e.minDayVolume.toLocaleString()}`, ok: m.volume >= e.minDayVolume, value: Math.round(m.volume).toLocaleString() },
    { label: `change >= ${e.minChangePercent}%`, ok: m.changePercent >= e.minChangePercent, value: `${m.changePercent.toFixed(1)}%` },
    { label: `RVOL >= ${e.minRvol}x`, ok: m.rvol >= e.minRvol, value: `${m.rvol.toFixed(1)}x` },
    { label: `momentum >= ${e.minMomentumScore}`, ok: m.momentumScore >= e.minMomentumScore, value: m.momentumScore.toFixed(0) },
    { label: 'above VWAP', ok: !e.requireAboveVwap || m.aboveVwap, value: `${m.vwapDistance.toFixed(1)}%` },
    { label: `within ${e.maxDistanceFromHighPercent}% of high`, ok: m.distanceFromHigh <= e.maxDistanceFromHighPercent, value: `${m.distanceFromHigh.toFixed(1)}%` },
    { label: 'rising over 5m', ok: !e.requirePositiveFiveMinute || m.change5m > 0, value: `${m.change5m.toFixed(1)}%` },
  ];
}

async function main(): Promise<void> {
  if (!HEADERS['APCA-API-KEY-ID']) throw new Error('ALPACA_API_KEY_ID is not set.');

  const symbol = arg('symbol', '').toUpperCase();
  if (!symbol) throw new Error('pass --symbol TICKER');

  const profileArg = arg('profile', 'standard');
  if (!isProfileName(profileArg)) throw new Error(`unknown profile "${profileArg}"`);
  const config = getTraderConfig(profileArg as ProfileName);

  const day = arg('date', new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }));
  const start = new Date(Date.parse(`${day}T00:00:00Z`) - 9 * 86_400_000).toISOString().slice(0, 10);

  const all = await fetchBars(symbol, '1Min', start);
  const session = all.filter((b) => {
    if (b.t.slice(0, 10) !== day) return false;
    const { minutesOfDay } = nyParts(new Date(b.t));
    return minutesOfDay >= 9 * 60 + 30 && minutesOfDay < 16 * 60;
  });

  if (session.length === 0) {
    console.log(`\nNo regular-session bars for ${symbol} on ${day}.`);
    return;
  }

  const history = all.filter((b) => b.t.slice(0, 10) < day).map((b) => ({
    symbol, timestamp: Date.parse(b.t),
    open: b.o, high: b.h, low: b.l, close: b.c, volume: b.v, vwap: b.vw,
  }));

  const daily = await fetchBars(symbol, '1Day', start);
  const index = daily.findIndex((b) => b.t.slice(0, 10) === day);
  const previousClose = index > 0 ? daily[index - 1].c : session[0].o;
  const profile = history.length > 0
    ? buildRvolProfile(history)
    : genericRvolProfile(index > 0 ? daily[index - 1].v : 0);

  const scanner = getConfig();
  const failures = new Map<string, number>();
  const passing: Array<{ time: string; price: number }> = [];
  let evaluated = 0;
  let closestMiss: { time: string; failed: string[] } | null = null;

  for (let i = 5; i < session.length; i += 1) {
    const window = session.slice(0, i + 1);
    const closes = window.map((b) => b.c);
    const price = closes[closes.length - 1];
    const at = Date.parse(session[i].t);
    const volume = window.reduce((sum, b) => sum + b.v, 0);
    const notional = window.reduce((sum, b) => sum + b.vw * b.v, 0);
    const vwap = volume > 0 ? notional / volume : price;
    const dayHigh = Math.max(...window.map((b) => b.h));
    const dayLow = Math.min(...window.map((b) => b.l));
    const changeOver = (n: number): number => {
      const ref = closes[Math.max(0, closes.length - 1 - n)];
      return ref > 0 ? ((price - ref) / ref) * 100 : 0;
    };
    let msSinceNewHigh: number | null = null;
    for (let j = window.length - 1; j >= 0; j -= 1) {
      if (window[j].h >= dayHigh - 1e-9) { msSinceNewHigh = at - Date.parse(window[j].t); break; }
    }
    const rvol = computeRvol(volume, profile, minuteOfSession(at));
    const volumeAcceleration = computeVolumeAcceleration(window.slice(-15).map((b) => b.v));
    const volatility = computeVolatilityExpansion(closes.slice(-6), closes);
    const change1m = changeOver(1);
    const change5m = changeOver(5);
    const change15m = changeOver(15);

    const metrics: StockMetrics = {
      symbol, price, previousClose,
      changePercent: previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : 0,
      change1m, change5m, change15m, volume, rvol, volumeAcceleration, vwap,
      vwapDistance: vwapDistance(price, vwap), aboveVwap: price > vwap,
      dayHigh, dayLow,
      distanceFromHigh: dayHigh > 0 ? ((dayHigh - price) / dayHigh) * 100 : 0,
      isNewHigh: msSinceNewHigh !== null && msSinceNewHigh <= scanner.momentum.scales.newHighWindowSec * 1_000,
      volatility,
      momentumScore: computeMomentumScore(
        { change1m, change5m, change15m, rvol, volumeAcceleration, price, vwap, dayHigh, msSinceNewHigh, volatilityExpansion: volatility },
        scanner.momentum.weights, scanner.momentum.scales,
      ),
      stage: 'IDLE', updatedAt: at,
    };

    evaluated += 1;
    const conditions = conditionResults(metrics, config.entry);
    const failed = conditions.filter((c) => !c.ok);
    const time = new Date(at).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false }).slice(0, 5);

    if (failed.length === 0) {
      passing.push({ time, price });
    } else {
      for (const c of failed) failures.set(c.label, (failures.get(c.label) ?? 0) + 1);
      if (!closestMiss || failed.length < closestMiss.failed.length) {
        closestMiss = { time, failed: failed.map((c) => `${c.label} (was ${c.value})`) };
      }
    }
    if (evaluateEntry(metrics, config.entry).pass !== (failed.length === 0)) {
      console.warn(`  [warn] ${time}: tally disagrees with the engine — the tally is out of date.`);
    }
  }

  console.log(`\n${symbol} on ${day} — ${config.profile} profile`);
  console.log(`${evaluated} minutes evaluated, ${passing.length} qualified.\n`);

  if (passing.length > 0) {
    const first = passing[0];
    console.log(`First qualified ${first.time} ET at $${first.price.toFixed(2)}.`);
    console.log(`Qualified at: ${passing.slice(0, 12).map((p) => p.time).join(' ')}` +
      `${passing.length > 12 ? ` … and ${passing.length - 12} more` : ''}\n`);
  }

  console.log('Minutes each condition blocked (independent — a minute can fail several):');
  const rows = [...failures].sort((a, b) => b[1] - a[1]);
  for (const [label, count] of rows) {
    const bar = '█'.repeat(Math.round((count / evaluated) * 30));
    console.log(`  ${String(count).padStart(4)}  ${String(Math.round((count / evaluated) * 100) + '%').padStart(4)}  ${label.padEnd(28)} ${bar}`);
  }
  if (rows.length === 0) console.log('  none — every minute passed.');

  if (passing.length === 0 && closestMiss) {
    console.log(`\nClosest miss was ${closestMiss.time} ET, failing only:`);
    for (const f of closestMiss.failed) console.log(`  - ${f}`);
  }
  console.log();
}

main().catch((error) => {
  console.error(`\nexplain failed: ${error instanceof Error ? error.message : error}\n`);
  process.exit(1);
});
