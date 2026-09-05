/**
 * Health and configuration status.
 *
 * Powers the banner that tells the user, honestly, what they are looking at:
 * live vendor data, or a simulation.
 */

import { NextResponse } from 'next/server';
import { marketStore, systemStatus } from '@/lib/server/market';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const status = await systemStatus();

  // Freshness is inferred from the newest metric write, since the web app has
  // no direct channel to the worker.
  let lastUpdate = 0;
  let tracked = 0;
  try {
    const symbols = await marketStore().listMetricSymbols();
    tracked = symbols.length;
    const sample = await marketStore().readManyMetrics(symbols.slice(0, 25));
    lastUpdate = sample.reduce((max, m) => Math.max(max, m.updatedAt), 0);
  } catch {
    // Redis down: report it rather than 500ing the whole page.
  }

  const ageMs = lastUpdate ? Date.now() - lastUpdate : null;
  return NextResponse.json({
    ...status,
    tracked,
    lastUpdate: lastUpdate || null,
    dataAgeMs: ageMs,
    workerConnected: ageMs !== null && ageMs < 60_000,
  });
}
