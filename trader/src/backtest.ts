/**
 * Phase 1: replay the rules over history.
 *
 * This runs the *same* EntryRules, ExitRules and RiskManager the live engine
 * uses, driven minute by minute from historical bars, with fills simulated by
 * the same PaperBroker. Nothing about the strategy is reimplemented here —
 * only the clock and the data source are replaced. A backtest that reimplements
 * its own version of the rules tests the reimplementation.
 *
 * What it cannot tell you, stated plainly so the numbers are not over-read:
 *
 *  - Fills are modelled, not real. Every fill assumes the whole order trades at
 *    the bar's close plus a fixed slippage. For thin small-caps this is
 *    optimistic, and those are exactly the names the entry rules select.
 *  - Bars hide the path within them. A minute that touched both the stop and
 *    the target is resolved pessimistically, but a minute whose low pierced the
 *    stop and recovered will still stop out here as it would live.
 *  - Survivorship. Candidates are chosen from symbols that exist today, so
 *    anything delisted since is invisible.
 *  - IEX volume is a sample of the consolidated tape, so RVOL is internally
 *    consistent but absolute volumes are not comparable to other sources.
 *
 * Usage: npm run trader:backtest -- --days 10 [--symbols AAA,BBB]
 */
import { TradeLog } from './audit/TradeLog';
import { PaperBroker } from './broker/PaperBroker';
import {
  describeConfig, estimateCommission, getTraderConfig, isProfileName, type ProfileName,
} from './config';
import { evaluateEntry, rankCandidates } from './engine/EntryRules';
import { evaluateExit } from './engine/ExitRules';
import { RiskManager } from './engine/RiskManager';
import { computeMomentumScore } from '../../shared/calculations/momentum';
import { computeVolumeAcceleration } from '../../shared/calculations/volume';
import { computeVolatilityExpansion } from '../../shared/calculations/volatility';
import { buildRvolProfile, computeRvol, minuteOfSession } from '../../shared/calculations/rvol';
import { vwapDistance } from '../../shared/calculations/vwap';
import { getConfig } from '../../shared/config';
import { nyParts } from '../../shared/market/session';
import type { Bar, StockMetrics } from '../../shared/types';
import type { ClosedTrade, Position } from './types';

interface AlpacaBar { t: string; o: number; h: number; l: number; c: number; v: number; vw: number }

const HEADERS = {
  'APCA-API-KEY-ID': process.env.ALPACA_API_KEY_ID ?? process.env.ALPACA_KEY_ID ?? '',
  'APCA-API-SECRET-KEY':
    process.env.ALPACA_API_SECRET_KEY ?? process.env.ALPACA_SECRET_KEY ?? '',
};
const FEED = process.env.ALPACA_FEED ?? 'iex';

function arg(name: string, fallback: string): string {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : fallback;
}

/**
 * A GET that survives Alpaca's rate limiter.
 *
 * A full-market backtest makes thousands of calls against a 200/minute budget,
 * so a 429 is an expected part of the run rather than a failure. Backing off
 * and retrying turns a sweep that dies halfway into one that merely takes
 * longer — which matters, because a sweep that dies halfway silently produces
 * a missing row that looks like a result of zero.
 */
async function get<T>(url: string, attempt = 0): Promise<T> {
  const res = await fetch(url, { headers: HEADERS });

  if (res.status === 429 && attempt < 6) {
    const retryAfter = Number(res.headers.get('retry-after'));
    const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1_000
      : Math.min(60_000, 2_000 * 2 ** attempt);
    process.stderr.write(`  rate limited, waiting ${Math.round(waitMs / 1000)}s…\n`);
    await new Promise((resolve) => setTimeout(resolve, waitMs));
    return get<T>(url, attempt + 1);
  }

  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${await res.text()}`);
  return (await res.json()) as T;
}

async function fetchBars(
  symbols: string[], timeframe: string, start: string, end?: string,
): Promise<Record<string, AlpacaBar[]>> {
  const all: Record<string, AlpacaBar[]> = {};
  for (let i = 0; i < symbols.length; i += 50) {
    const chunk = symbols.slice(i, i + 50).join(',');
    let token: string | null = null;
    do {
      const url =
        `https://data.alpaca.markets/v2/stocks/bars?symbols=${chunk}&timeframe=${timeframe}` +
        `&start=${start}${end ? `&end=${end}` : ''}&limit=10000&adjustment=all&feed=${FEED}` +
        `${token ? `&page_token=${token}` : ''}`;
      const body: { bars?: Record<string, AlpacaBar[]>; next_page_token?: string | null } =
        await get(url);
      for (const [symbol, bars] of Object.entries(body.bars ?? {})) {
        (all[symbol] ??= []).push(...bars);
      }
      token = body.next_page_token ?? null;
    } while (token);
  }
  return all;
}

/** Symbols that had a big, well-traded day — the population the rules select from. */
async function findMoverDays(days: number, entryMin: number, minVolume: number): Promise<
  Map<string, string[]>
> {
  const assets = await get<Array<{ symbol: string; tradable: boolean }>>(
    'https://paper-api.alpaca.markets/v2/assets?status=active&asset_class=us_equity',
  );
  const symbols = assets.filter((a) => a.tradable && !a.symbol.includes('/')).map((a) => a.symbol);
  const start = new Date(Date.now() - (days + 5) * 86_400_000).toISOString().slice(0, 10);

  console.log(`Scanning ${symbols.length.toLocaleString()} symbols over ${days} sessions…`);
  const daily = await fetchBars(symbols, '1Day', start);

  // day -> symbols that moved that day
  const byDay = new Map<string, string[]>();
  for (const [symbol, bars] of Object.entries(daily)) {
    for (let i = 1; i < bars.length; i += 1) {
      const bar = bars[i];
      const previous = bars[i - 1];
      if (previous.c <= 0 || bar.v < minVolume) continue;
      const change = ((bar.c - previous.c) / previous.c) * 100;
      if (change < entryMin) continue;
      const day = bar.t.slice(0, 10);
      (byDay.get(day) ?? byDay.set(day, []).get(day)!).push(symbol);
    }
  }
  return byDay;
}

function toBar(symbol: string, b: AlpacaBar): Bar {
  return {
    symbol, timestamp: Date.parse(b.t),
    open: b.o, high: b.h, low: b.l, close: b.c, volume: b.v, vwap: b.vw,
  };
}

/** Metrics as they would have looked at the close of bar `index`. */
function metricsAt(
  symbol: string, bars: AlpacaBar[], index: number, profile: number[], previousClose: number,
): StockMetrics {
  const scanner = getConfig();
  const window = bars.slice(0, index + 1);
  const closes = window.map((b) => b.c);
  const price = closes[closes.length - 1];
  const at = Date.parse(bars[index].t);

  const changeOver = (minutes: number): number => {
    const reference = closes[Math.max(0, closes.length - 1 - minutes)];
    return reference > 0 ? ((price - reference) / reference) * 100 : 0;
  };

  const volume = window.reduce((sum, b) => sum + b.v, 0);
  const notional = window.reduce((sum, b) => sum + b.vw * b.v, 0);
  const vwap = volume > 0 ? notional / volume : price;
  const dayHigh = Math.max(...window.map((b) => b.h));
  const dayLow = Math.min(...window.map((b) => b.l));

  let msSinceNewHigh: number | null = null;
  for (let i = window.length - 1; i >= 0; i -= 1) {
    if (window[i].h >= dayHigh - 1e-9) {
      msSinceNewHigh = at - Date.parse(window[i].t);
      break;
    }
  }

  const rvol = computeRvol(volume, profile, minuteOfSession(at));
  const volumeAcceleration = computeVolumeAcceleration(window.slice(-15).map((b) => b.v));
  const volatility = computeVolatilityExpansion(closes.slice(-6), closes);
  const change1m = changeOver(1);
  const change5m = changeOver(5);
  const change15m = changeOver(15);

  return {
    symbol, price, previousClose,
    changePercent: ((price - previousClose) / previousClose) * 100,
    change1m, change5m, change15m,
    volume, rvol, volumeAcceleration, vwap,
    vwapDistance: vwapDistance(price, vwap),
    aboveVwap: price > vwap,
    dayHigh, dayLow,
    distanceFromHigh: dayHigh > 0 ? ((dayHigh - price) / dayHigh) * 100 : 0,
    isNewHigh: msSinceNewHigh !== null
      && msSinceNewHigh <= scanner.momentum.scales.newHighWindowSec * 1_000,
    volatility,
    momentumScore: computeMomentumScore(
      { change1m, change5m, change15m, rvol, volumeAcceleration, price, vwap, dayHigh,
        msSinceNewHigh, volatilityExpansion: volatility },
      scanner.momentum.weights, scanner.momentum.scales,
    ),
    stage: 'IDLE',
    updatedAt: at,
  };
}

async function main(): Promise<void> {
  if (!HEADERS['APCA-API-KEY-ID']) throw new Error('ALPACA_API_KEY_ID is not set.');

  const profileArg = arg('profile', 'standard');
  if (!isProfileName(profileArg)) {
    throw new Error(`unknown profile "${profileArg}". Use standard or penny.`);
  }
  const config = getTraderConfig(profileArg as ProfileName);
  const days = Number(arg('days', '10'));
  const explicit = arg('symbols', '');

  console.log('\nBacktest — replaying the live rules over history.');
  for (const line of describeConfig(config)) console.log(`  ${line}`);
  console.log();

  const byDay = explicit
    ? new Map<string, string[]>()
    : await findMoverDays(days, config.entry.minChangePercent, config.entry.minDayVolume);

  if (explicit) {
    const symbols = explicit.split(',').map((s) => s.trim().toUpperCase());
    const start = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);
    const bars = await fetchBars(symbols, '1Day', start);
    for (const [symbol, list] of Object.entries(bars)) {
      for (const bar of list) {
        const day = bar.t.slice(0, 10);
        (byDay.get(day) ?? byDay.set(day, []).get(day)!).push(symbol);
      }
    }
  }

  const sessions = [...byDay.keys()].sort().slice(-days);
  if (sessions.length === 0) {
    console.log('No qualifying sessions found in the window.');
    return;
  }

  const log = new TradeLog('/dev/null', '/dev/null');
  const trades: ClosedTrade[] = [];
  let equity = config.risk.accountEquity;

  for (const day of sessions) {
    const symbols = [...new Set(byDay.get(day) ?? [])].slice(0, 30);
    if (symbols.length === 0) continue;

    // Five prior sessions for the volume baseline, plus the day itself.
    const start = new Date(Date.parse(`${day}T00:00:00Z`) - 9 * 86_400_000)
      .toISOString().slice(0, 10);
    const end = new Date(Date.parse(`${day}T00:00:00Z`) + 86_400_000).toISOString().slice(0, 10);
    const minute = await fetchBars(symbols, '1Min', start, end);
    const daily = await fetchBars(symbols, '1Day', start, end);

    const prices = new Map<string, number>();
    const broker = new PaperBroker({
      startingCash: equity,
      priceFeed: (s) => prices.get(s) ?? null,
      commission: (quantity, price) => estimateCommission(quantity, price, config.costs),
      now: () => clock,
    });
    await broker.connect();
    const risk = new RiskManager({ ...config.risk, accountEquity: equity });
    const positions = new Map<string, Position>();
    let clock = new Date(`${day}T14:30:00Z`);
    let tradesToday = 0;
    let realizedToday = 0;
    let orderSeq = 0;
    // The live engine refuses a second order for a symbol inside this window.
    // The backtest must apply the same rule or it measures a strategy that
    // re-enters the same name every few minutes — which the live bot will not
    // do, making the result meaningless in either direction.
    const lastOrderAt = new Map<string, number>();

    // Per-symbol session bars and baselines, prepared once.
    const prepared = new Map<string, { bars: AlpacaBar[]; profile: number[]; previousClose: number }>();
    for (const symbol of symbols) {
      const all = minute[symbol] ?? [];
      const sessionBars = all.filter((b) => b.t.slice(0, 10) === day
        && nyParts(new Date(b.t)).minutesOfDay >= 9 * 60 + 30
        && nyParts(new Date(b.t)).minutesOfDay < 16 * 60);
      if (sessionBars.length < 60) continue;

      const history = all.filter((b) => b.t.slice(0, 10) < day).map((b) => toBar(symbol, b));
      const dayBars = daily[symbol] ?? [];
      const index = dayBars.findIndex((b) => b.t.slice(0, 10) === day);
      const previousClose = index > 0 ? dayBars[index - 1].c : sessionBars[0].o;
      if (history.length === 0 || previousClose <= 0) continue;

      prepared.set(symbol, { bars: sessionBars, profile: buildRvolProfile(history), previousClose });
    }
    if (prepared.size === 0) continue;

    const longest = Math.max(...[...prepared.values()].map((p) => p.bars.length));

    for (let i = 0; i < longest; i += 1) {
      const anyBar = [...prepared.values()].find((p) => p.bars[i]);
      if (!anyBar) continue;
      clock = new Date(anyBar.bars[i].t);
      const { minutesOfDay } = nyParts(clock);
      const sinceOpen = minutesOfDay - (9 * 60 + 30);
      const toClose = 16 * 60 - minutesOfDay;

      for (const [symbol, prep] of prepared) {
        if (prep.bars[i]) prices.set(symbol, prep.bars[i].c);
      }

      // Exits first, exactly as the live engine does.
      for (const position of [...positions.values()]) {
        const prep = prepared.get(position.symbol);
        const bar = prep?.bars[i];
        if (!prep || !bar) continue;

        const metrics = metricsAt(position.symbol, prep.bars, i, prep.profile, prep.previousClose);
        // The bar's low is used for the stop: within a minute, the worst price
        // is the one that matters for an order resting at that level.
        const stopHit = bar.l <= position.stopPrice;
        const price = stopHit ? position.stopPrice : bar.c;

        const decision = evaluateExit(
          position,
          { price, momentumScore: metrics.momentumScore, now: clock, minutesToClose: toClose },
          config.exit,
        );

        if (decision.shouldExit && decision.reason) {
          prices.set(position.symbol, price);
          orderSeq += 1;
          const order = await broker.placeOrder({
            symbol: position.symbol, side: 'SELL', quantity: position.quantity,
            clientOrderId: `bt-x-${orderSeq}`,
          });
          if (order.status !== 'FILLED' || order.averageFillPrice === null) continue;

          const exitPrice = order.averageFillPrice;
          const risked = position.entryPrice - position.initialStopPrice;
          const commission = Math.round(
            (position.entryCommission + broker.lastFillCommission()) * 100,
          ) / 100;
          const realized = (exitPrice - position.entryPrice) * order.filledQuantity - commission;
          realizedToday += realized;
          trades.push({
            ...position,
            exitPrice, exitAt: clock.toISOString(), exitReason: decision.reason,
            exitOrderId: order.clientOrderId,
            realizedPnl: Math.round(realized * 100) / 100,
            commission,
            rMultiple: risked > 0 ? Math.round(((exitPrice - position.entryPrice) / risked) * 100) / 100 : 0,
            wasDayTrade: true,
          });
          positions.delete(position.symbol);
          continue;
        }

        position.lastKnownPrice = bar.c;
        position.highWaterMark = Math.max(position.highWaterMark, bar.h);
        if (decision.newStopPrice !== undefined) {
          position.stopPrice = decision.newStopPrice;
          position.stopRaised = true;
        }
      }

      if (sinceOpen < config.execution.earliestEntryMinutesAfterOpen) continue;
      if (toClose < config.execution.latestEntryMinutesBeforeClose) continue;

      const evaluations = [...prepared.entries()]
        .filter(([, p]) => p.bars[i])
        .map(([symbol, p]) => ({
          metrics: metricsAt(symbol, p.bars, i, p.profile, p.previousClose),
        }))
        .map(({ metrics }) => ({ metrics, evaluation: evaluateEntry(metrics, config.entry) }));

      for (const { metrics, evaluation } of rankCandidates(evaluations.map((e) => e.evaluation))
        .map((e) => evaluations.find((x) => x.evaluation === e)!)) {
        const account = await broker.getAccount();
        const decision = risk.evaluateEntry(
          metrics.symbol, metrics.price, config.exit.stopLossPercent, config.exit.targetRMultiple,
          {
            account, openPositions: [...positions.values()],
            tradesToday, realizedPnlToday: realizedToday,
            recentTrades: trades, now: clock,
          },
        );
        if (!decision.allowed) continue;

        const previous = lastOrderAt.get(metrics.symbol);
        if (previous !== undefined
          && clock.getTime() - previous < config.execution.duplicateOrderWindowSeconds * 1_000) {
          continue;
        }
        lastOrderAt.set(metrics.symbol, clock.getTime());

        orderSeq += 1;
        const order = await broker.placeOrder({
          symbol: metrics.symbol, side: 'BUY', quantity: decision.quantity,
          clientOrderId: `bt-e-${orderSeq}`,
        });
        if (order.status !== 'FILLED' || order.averageFillPrice === null) continue;

        const fill = order.averageFillPrice;
        const stopPrice = Math.round(fill * (1 - config.exit.stopLossPercent / 100) * 100) / 100;
        positions.set(metrics.symbol, {
          symbol: metrics.symbol, quantity: order.filledQuantity, entryPrice: fill,
          entryAt: clock.toISOString(), entryReasons: evaluation.reasons,
          stopPrice, initialStopPrice: stopPrice,
          targetPrice: config.exit.targetRMultiple === null
            ? 0
            : Math.round((fill + (fill - stopPrice) * config.exit.targetRMultiple) * 100) / 100,
          highWaterMark: fill, stopRaised: false, entryOrderId: order.clientOrderId,
          entryCommission: broker.lastFillCommission(),
          lastKnownPrice: fill, updatedAt: clock.toISOString(),
        });
        tradesToday += 1;
      }
    }

    equity = Math.round((equity + realizedToday) * 100) / 100;
    const dayTrades = trades.filter((t) => t.exitAt.slice(0, 10) === day);
    if (dayTrades.length > 0) {
      console.log(
        `${day}  ${String(dayTrades.length).padStart(2)} trades  ` +
        `${realizedToday >= 0 ? '+' : '-'}$${Math.abs(realizedToday).toFixed(2).padStart(7)}  ` +
        `equity $${equity.toFixed(2)}`,
      );
      for (const t of dayTrades) {
        console.log(
          `        ${t.symbol.padEnd(6)} ${t.entryPrice.toFixed(2)} → ${t.exitPrice.toFixed(2)}  ` +
          `${t.exitReason.padEnd(17)} ${t.rMultiple >= 0 ? '+' : ''}${t.rMultiple.toFixed(2)}R`,
        );
      }
    }
  }

  console.log(`\n${log.summarise(trades)}`);
  console.log(
    `Equity: $${config.risk.accountEquity.toFixed(2)} → $${equity.toFixed(2)} ` +
    `(${equity >= config.risk.accountEquity ? '+' : ''}` +
    `${(((equity - config.risk.accountEquity) / config.risk.accountEquity) * 100).toFixed(1)}%)`,
  );

  // The friction analysis. This is the part of the output that actually
  // decides whether the strategy is viable at this account size, so it is
  // computed rather than left for the reader to infer from the P&L.
  if (trades.length > 0) {
    const totalCommission = trades.reduce((sum, t) => sum + t.commission, 0);
    const gross = trades.reduce(
      (sum, t) => sum + (t.exitPrice - t.entryPrice) * t.quantity, 0,
    );
    // Commission expressed in units of the risk taken, which is the only way
    // to compare it against the 2R target.
    const costInR = trades.reduce((sum, t) => {
      const risk = (t.entryPrice - t.initialStopPrice) * t.quantity;
      return sum + (risk > 0 ? t.commission / risk : 0);
    }, 0) / trades.length;

    // With no fixed target the payoff is whatever the trail delivered, so the
    // break-even sum uses the observed average win rather than a planned one.
    const winners = trades.filter((t) => t.rMultiple > 0);
    const target = config.exit.targetRMultiple
      ?? (winners.length > 0
        ? winners.reduce((sum, t) => sum + t.rMultiple, 0) / winners.length
        : 0);
    const win = target - costInR;
    const loss = 1 + costInR;
    const breakeven = win > 0 ? (loss / (win + loss)) * 100 : 100;
    const targetLabel = config.exit.targetRMultiple === null
      ? `${target.toFixed(2)}R average winner (no fixed target)`
      : `${target}R target`;

    console.log(
      `\nGross P&L ${gross >= 0 ? '+' : '-'}$${Math.abs(gross).toFixed(2)}, ` +
      `commission -$${totalCommission.toFixed(2)} over ${trades.length} trades ` +
      `($${(totalCommission / trades.length).toFixed(2)} each).`,
    );
    console.log(
      `Commission is ${costInR.toFixed(2)}R per trade against a ${targetLabel}, ` +
      `so a winner nets ${win.toFixed(2)}R and a loser costs ${loss.toFixed(2)}R.`,
    );
    console.log(
      win > 0
        ? `Break-even win rate: ${breakeven.toFixed(0)}% (it would be ` +
          `${((1 / (target + 1)) * 100).toFixed(0)}% with no costs).`
        : 'Commission exceeds the entire profit target: this cannot be profitable at this size.',
    );
  }

  const byReason = new Map<string, number>();
  for (const t of trades) byReason.set(t.exitReason, (byReason.get(t.exitReason) ?? 0) + 1);
  if (byReason.size > 0) {
    console.log('\nExits:');
    for (const [reason, count] of [...byReason].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${reason.padEnd(18)} ${count}`);
    }
  }
  console.log(
    '\nModelled fills, no market impact, survivorship-biased candidates. ' +
    'Treat as a sanity check on the rules, not a forecast.\n',
  );
}

main().catch((error) => {
  console.error(`\nBacktest failed: ${error instanceof Error ? error.message : error}\n`);
  process.exit(1);
});
