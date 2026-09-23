/**
 * The trading bot's entry point.
 *
 * Three modes, matching the phases in the brief:
 *
 *   sim    simulated fills against live market data. No account, no broker,
 *          no money. This is where rules are proved.
 *   paper  IBKR paper account. Same code, real order plumbing, fake money.
 *   live   IBKR live account. Requires a second, explicit environment switch.
 *
 * The mode is the only thing that changes between them. That is the point: a
 * phase that runs different code from the phase before it has not tested
 * anything the next phase relies on.
 */
import { existsSync, readFileSync } from 'node:fs';
import { AlpacaScanner } from './data/AlpacaScanner';
import { AlpacaBroker } from './broker/AlpacaBroker';
import { IbkrBroker } from './broker/IbkrBroker';
import { PaperBroker } from './broker/PaperBroker';
import type { IBroker } from './broker/IBroker';
import { TradeLog } from './audit/TradeLog';
import {
  describeConfig, estimateCommission, getTraderConfig, isProfileName, type ProfileName,
} from './config';
import { RiskManager } from './engine/RiskManager';
import { TradingEngine } from './engine/TradingEngine';
import { createNotifier } from './notify/Notifier';
import { getCurrentSession } from '../../shared/market/session';

/**
 * Load .env.worker, as every script in scripts/ already does.
 *
 * The trader previously required the variables to be exported by the caller,
 * so `npm run trader:alpaca` failed with "none of ALPACA_API_KEY_ID ... is
 * set" while `npm run discover` worked from the same directory. Two loading
 * conventions in one repository is a footgun regardless of which is better.
 *
 * Existing environment variables win: an explicitly exported value is a
 * deliberate override of the file.
 */
function loadEnvFile(): void {
  try {
    const text = readFileSync(new URL('../../.env.worker', import.meta.url), 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
      const i = trimmed.indexOf('=');
      const key = trimmed.slice(0, i).trim();
      const value = trimmed.slice(i + 1).trim().replace(/^["']|["']$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // Absent file is fine — the environment may carry everything already.
  }
}

type Mode = 'sim' | 'paper' | 'live' | 'alpaca' | 'alpaca-live';

const KILL_SWITCH_FILE = process.env.TRADER_KILL_FILE ?? 'trader/STOP';
const LOG_DIR = process.env.TRADER_LOG_DIR ?? 'trader/logs';

function parseMode(raw: string | undefined): Mode {
  if (raw === 'paper' || raw === 'live' || raw === 'alpaca' || raw === 'alpaca-live') return raw;
  if (raw === undefined || raw === 'sim') return 'sim';
  throw new Error(`unknown mode "${raw}". Use sim, paper, live, alpaca, or alpaca-live.`);
}

/** Any mode that can move real money. */
function isLiveMode(mode: Mode): boolean {
  return mode === 'live' || mode === 'alpaca-live';
}

/** First of `names` that is set. The worker's names come first. */
function requireEnv(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }
  throw new Error(`none of ${names.join(', ')} is set.`);
}

/** `--profile penny`, else TRADER_PROFILE, else standard. */
function parseProfile(): ProfileName {
  const index = process.argv.indexOf('--profile');
  const raw = index >= 0 ? process.argv[index + 1] : process.env.TRADER_PROFILE;
  if (!raw) return 'standard';
  if (!isProfileName(raw)) {
    throw new Error(`unknown profile "${raw}". Use standard or penny.`);
  }
  return raw;
}

async function main(): Promise<void> {
  loadEnvFile();
  const mode = parseMode(process.argv[2] ?? process.env.TRADER_MODE);
  const config = getTraderConfig(parseProfile());

  if (isLiveMode(mode) && !config.liveTrading) {
    // Two independent switches, and this is the one that has to be said out
    // loud. Live mode without it exits rather than quietly running as paper,
    // because a silent downgrade is its own kind of surprise.
    throw new Error(
      'Live mode requires both liveTrading:true in the config and\n' +
      '  TRADER_LIVE=I_UNDERSTAND_THIS_TRADES_REAL_MONEY\n' +
      'in the environment. Refusing to start.',
    );
  }

  const log = new TradeLog(`${LOG_DIR}/events.jsonl`, `${LOG_DIR}/trades.jsonl`);
  const notify = createNotifier();
  const risk = new RiskManager(config.risk, KILL_SWITCH_FILE);

  const data = new AlpacaScanner(
    requireEnv('ALPACA_API_KEY_ID', 'ALPACA_KEY_ID'),
    requireEnv('ALPACA_API_SECRET_KEY', 'ALPACA_SECRET_KEY'),
    config.entry,
    process.env.ALPACA_FEED ?? 'iex',
  );

  let broker: IBroker;
  if (mode === 'sim') {
    broker = new PaperBroker({
      startingCash: config.risk.accountEquity,
      priceFeed: (symbol) => data.getMetrics(symbol).then((m) => m?.price ?? null),
      commission: (quantity, price) => estimateCommission(quantity, price, config.costs),
    });
  } else if (mode === 'alpaca' || mode === 'alpaca-live') {
    broker = new AlpacaBroker({
      keyId: requireEnv('ALPACA_API_KEY_ID', 'ALPACA_KEY_ID'),
      secretKey: requireEnv('ALPACA_API_SECRET_KEY', 'ALPACA_SECRET_KEY'),
      isLive: mode === 'alpaca-live',
      feed: process.env.ALPACA_FEED ?? 'iex',
    });
  } else {
    broker = new IbkrBroker({
      host: process.env.IBKR_HOST ?? '127.0.0.1',
      port: Number(process.env.IBKR_PORT ?? (mode === 'live' ? 7496 : 7497)),
      clientId: Number(process.env.IBKR_CLIENT_ID ?? 1),
      isLive: mode === 'live',
      priceFeed: (symbol) => data.getMetrics(symbol).then((m) => m?.price ?? null),
    });
  }

  console.log(`\nThernus trader — ${mode} mode, ${config.profile} profile, broker: ${broker.name}`);
  for (const line of describeConfig(config)) console.log(`  ${line}`);
  console.log(`  Notifications: ${notify.name}. Kill switch: create ${KILL_SWITCH_FILE}\n`);

  if (existsSync(KILL_SWITCH_FILE)) {
    console.log(`The kill switch file ${KILL_SWITCH_FILE} exists. Remove it to trade.`);
  }

  await broker.connect();
  const engine = new TradingEngine({ broker, data, risk, log, notify, config });
  await engine.resume();

  log.record({
    type: 'SESSION_START',
    message: `Started in ${mode} mode on the ${config.profile} profile against ` +
      `${broker.name}, scanning every ` +
      `${config.execution.scanIntervalMinutes} minutes.`,
  });
  notify.send(`▶️ Thernus trader started — ${mode} mode, ${config.profile} profile, ${broker.name}.`);

  let stopping = false;

  const shutdown = async (signal: string): Promise<void> => {
    if (stopping) return;
    stopping = true;
    console.log(`\n${signal} received. Shutting down.`);

    // Open positions are NOT closed on shutdown. Stopping the process is not
    // the same instruction as selling, and a routine restart that liquidates
    // the book would be worse than one that leaves it. Use the kill switch to
    // flatten deliberately.
    const { positions } = engine.snapshot();
    if (positions.length > 0) {
      const list = positions.map((p) => `${p.quantity} ${p.symbol}`).join(', ');
      console.log(`Still holding: ${list}. These were NOT closed.`);
      notify.send(`⏸️ Trader stopped while holding ${list}. Positions left open.`);
    }

    const today = log.tradesOn(new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }));
    const summary = log.summarise(today);
    log.record({ type: 'SESSION_END', message: `Stopped (${signal}). ${summary}` });
    notify.send(`⏹️ Trader stopped. ${summary}`);

    await notify.flush();
    await broker.disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  const intervalMs = config.execution.scanIntervalMinutes * 60_000;
  let killSwitchAnnounced = false;

  while (!stopping) {
    const started = Date.now();
    try {
      // A kill switch that trips while positions are open must flatten them,
      // not merely stop opening new ones.
      const halt = risk.haltReason();
      if (halt && engine.openPositionCount() > 0) {
        const closed = await engine.closeAll(halt);
        if (closed.length > 0) {
          log.record({ type: 'HALT', message: `Kill switch: closed ${closed.join(', ')}.` });
          notify.send(`🛑 Kill switch active — closed ${closed.join(', ')}.`);
        }
      }
      if (halt && !killSwitchAnnounced) {
        console.log(`Halted: ${halt}`);
        notify.send(`🛑 Trading halted: ${halt}`);
        killSwitchAnnounced = true;
      } else if (!halt) {
        killSwitchAnnounced = false;
      }

      const result = await engine.runCycle();
      if (result.skipped) {
        console.log(`[${new Date().toISOString()}] skipped — ${result.skipped}`);
      }
    } catch (error) {
      // The loop itself must survive anything a cycle throws, or a single bad
      // response ends the session with positions unmanaged.
      const detail = error instanceof Error ? error.message : String(error);
      log.record({ type: 'ERROR', message: `Cycle failed: ${detail}` });
      risk.recordFailure(config.execution.maxConsecutiveFailures, 'cycle');
    }

    // Outside market hours there is nothing to do, so wait longer and stop
    // burning API quota on a closed market.
    const idle = getCurrentSession() === 'CLOSED';
    const wait = Math.max(1_000, (idle ? 15 * 60_000 : intervalMs) - (Date.now() - started));
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
}

main().catch((error) => {
  console.error(`\nFatal: ${error instanceof Error ? error.message : error}\n`);
  process.exit(1);
});
