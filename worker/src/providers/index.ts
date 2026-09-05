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
import { PolygonProvider } from './PolygonProvider';
import { SimulatedProvider, type Scenario } from './SimulatedProvider';

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

export type ProviderName = 'polygon' | 'simulated';

export function resolveProviderName(): ProviderName {
  const explicit = process.env.MARKET_DATA_PROVIDER?.toLowerCase();
  if (explicit === 'polygon' || explicit === 'simulated') return explicit;
  return process.env.MARKET_DATA_API_KEY ? 'polygon' : 'simulated';
}

export function createProvider(symbols: string[], scenarios?: Scenario[]): IMarketDataProvider {
  const name = resolveProviderName();

  if (name === 'polygon') {
    const apiKey = process.env.MARKET_DATA_API_KEY;
    if (!apiKey) throw new Error('MARKET_DATA_PROVIDER=polygon requires MARKET_DATA_API_KEY');
    Logger.info('Using Polygon market data', { symbols: symbols.length });
    return new PolygonProvider(apiKey);
  }

  Logger.warn(
    'No market data key set — running on SIMULATED data. Prices are synthetic and must not be traded on.',
    { symbols: symbols.length },
  );
  return new SimulatedProvider({
    symbols,
    scenarios,
    tickRateHz: Number(process.env.SIM_TICK_RATE_HZ ?? 2),
    seed: Number(process.env.SIM_SEED ?? 1337),
  });
}
