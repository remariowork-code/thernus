/**
 * Recent signals.
 *
 * Served from the Redis stream, which is capped — deep history is a Postgres
 * query, and deliberately a different endpoint, because the live feed must
 * never wait on a database.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { marketStore } from '@/lib/server/market';
import type { SignalSeverity } from '@shared/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SEVERITY_RANK: Record<SignalSeverity, number> = {
  INFO: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4,
};

export async function GET(request: NextRequest): Promise<Response> {
  const params = request.nextUrl.searchParams;
  const limit = Math.min(Number(params.get('limit') ?? 50), 200);
  const sectorId = params.get('sector');
  const minSeverity = params.get('minSeverity') as SignalSeverity | null;
  const criticalOnly = params.get('critical') === 'true';

  let signals = await marketStore().readSignals(limit, criticalOnly);

  if (sectorId) signals = signals.filter((s) => s.sectorId === sectorId);
  if (minSeverity && minSeverity in SEVERITY_RANK) {
    signals = signals.filter((s) => SEVERITY_RANK[s.severity] >= SEVERITY_RANK[minSeverity]);
  }

  return NextResponse.json({ signals });
}
