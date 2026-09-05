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
  let redisError: string | null = null;

  try {
    const symbols = await marketStore().listMetricSymbols();
    tracked = symbols.length;
    const sample = await marketStore().readManyMetrics(symbols.slice(0, 25));
    lastUpdate = sample.reduce((max, m) => Math.max(max, m.updatedAt), 0);
  } catch (error) {
    // Report the failure rather than swallowing it. A silently empty dashboard
    // with a healthy-looking response is indistinguishable from a quiet market,
    // and that ambiguity is expensive to debug.
    redisError = error instanceof Error ? error.message : String(error);
  }

  const ageMs = lastUpdate ? Date.now() - lastUpdate : null;
  return NextResponse.json({
    ...status,
    tracked,
    lastUpdate: lastUpdate || null,
    dataAgeMs: ageMs,
    workerConnected: ageMs !== null && ageMs < 60_000,
    redisError,
    // Which host this process is actually pointed at, so a mismatch between
    // the app and the worker is visible without guessing. Credentials stripped.
    redisHost: redisHostFromEnv(),
  });
}

/** Host only — never the password embedded in the connection string. */
function redisHostFromEnv(): string | null {
  const url = process.env.REDIS_URL ?? process.env.UPSTASH_REDIS_URL;
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    // Malformed URL is itself the answer.
    return 'unparseable';
  }
}
