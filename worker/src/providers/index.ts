/**
 * Provider selection.
 *
 * MARKET_DATA_PROVIDER picks the adapter. Absent a Polygon key we fall back to
 * the simulator rather than failing to boot — and say so loudly, because a
 * scanner quietly showing invented prices would be worse than one that refuses
 * to start.
 */

import type { IMarketDataProvider, Universe } from '../../../shared/types';
import { buildSectorScenario } from './scenarios';
import { Logger } from '../utils/logger';
import { AlpacaProvider, type AlpacaFeed } from './AlpacaProvider';
import { PolygonProvider } from './PolygonProvider';
import { SimulatedProvider, type Scenario } from './SimulatedProvider';

export { AlpacaProvider } from './AlpacaProvider';
export { PolygonProvider } from './PolygonProvider';
export { SimulatedProvider } from './SimulatedProvider';
export { buildSectorScenario } from './scenarios';
export type { Scenario, ScenarioLeg } from './SimulatedProvider';

/**
 * Scripted rally for the sector named by SIM_SCENARIO, if any.
 *
 * Only ever consulted by the simulator; a real provider ignores it entirely.
 */
export function scenariosFromEnv(universe: Universe): Scenario[] | undefined {
  const sectorId = process.env.SIM_SCENARIO;
  if (!sectorId) return undefined;

  const scenarios = buildSectorScenario(universe, sectorId, {
    awakenAfterSeconds: Number(process.env.SIM_AWAKEN_SECONDS ?? 120),
    breakoutAfterSeconds: Number(process.env.SIM_BREAKOUT_SECONDS ?? 420),
  });

  if (scenarios.length === 0) {
    Logger.warn('SIM_SCENARIO names an unknown sector; ignoring it', { sectorId });
    return undefined;
  }
  Logger.info('Scripted demo rally armed', { sectorId, symbols: scenarios.length });
  return scenarios;
}

export type ProviderName = 'polygon' | 'alpaca' | 'simulated';

export function resolveProviderName(): ProviderName {
  const explicit = process.env.MARKET_DATA_PROVIDER?.toLowerCase();
  if (explicit === 'polygon' || explicit === 'alpaca' || explicit === 'simulated') return explicit;
  // Inferred from whichever credentials are present.
  if (process.env.ALPACA_API_KEY_ID) return 'alpaca';
  if (process.env.MARKET_DATA_API_KEY) return 'polygon';
  return 'simulated';
}

/**
 * Advisories describe the configuration, not the connection attempt, so they
 * are logged once per process. The worker rebuilds its provider on every
 * reconnect, and repeating them turned a nine-attempt backoff into forty lines
 * of identical text with the real error buried inside it.
 */
let advisedOnce = false;

export function createProvider(symbols: string[], scenarios?: Scenario[]): IMarketDataProvider {
  const name = resolveProviderName();
  const advise = (message: string, context?: Record<string, unknown>) => {
    if (advisedOnce) return;
    Logger.warn(message, context);
  };

  if (name === 'polygon') {
    const apiKey = process.env.MARKET_DATA_API_KEY;
    if (!apiKey) throw new Error('MARKET_DATA_PROVIDER=polygon requires MARKET_DATA_API_KEY');
    if (!advisedOnce) Logger.info('Using Polygon market data', { symbols: symbols.length });
    advisedOnce = true;
    return new PolygonProvider(apiKey);
  }

  if (name === 'alpaca') {
    const keyId = process.env.ALPACA_API_KEY_ID;
    const secretKey = process.env.ALPACA_API_SECRET_KEY;
    if (!keyId || !secretKey) {
      throw new Error(
        'MARKET_DATA_PROVIDER=alpaca requires ALPACA_API_KEY_ID and ALPACA_API_SECRET_KEY',
      );
    }

    const feed = (process.env.ALPACA_FEED?.toLowerCase() as AlpacaFeed) ?? 'iex';
    const maxStreamSymbols = process.env.ALPACA_MAX_SYMBOLS
      ? Number(process.env.ALPACA_MAX_SYMBOLS)
      : undefined;

    if (feed === 'iex') {
      advise(
        'Alpaca IEX feed selected. RVOL and volume acceleration remain valid: the baseline is ' +
        'built from IEX history and compared against IEX live volume, so the venue\'s share ' +
        'cancels out of the ratio. Absolute share counts do not — they are IEX-only, roughly ' +
        '2-3% of consolidated volume, and will read far below a quote screen. Expect more noise ' +
        'in thinly traded names, where an IEX-sized sample is small.',
      );
    }

    if (!advisedOnce) Logger.info('Using Alpaca market data', { symbols: symbols.length, feed });
    advisedOnce = true;
    return new AlpacaProvider({ keyId, secretKey, feed, symbols, maxStreamSymbols });
  }

  advise(
    'No market data key set — running on SIMULATED data. Prices are synthetic and must not be traded on.',
    { symbols: symbols.length },
  );
  advisedOnce = true;
  return new SimulatedProvider({
    symbols,
    scenarios,
    tickRateHz: Number(process.env.SIM_TICK_RATE_HZ ?? 2),
    seed: Number(process.env.SIM_SEED ?? 1337),
  });
}
