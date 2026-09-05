/**
 * Sector hydration.
 *
 * The dashboard's first paint. Sectors are returned ranked the way the product
 * argues they should be — by acceleration and breadth, not by raw percentage
 * gain — so a sector that is *starting* to move outranks one that already has.
 */

import { NextResponse } from 'next/server';
import { marketStore, universe } from '@/lib/server/market';
import { rankSectors } from '@shared/ranking';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const [live, { value: uni }] = await Promise.all([
    marketStore().readAllSectors(),
    universe(),
  ]);

  // Sectors with no live state yet still belong in the table, as placeholders,
  // so the layout does not jump around as the worker warms up.
  const bySector = new Map(live.map((s) => [s.sectorId, s]));
  const rows = uni.sectors.map((sector) => bySector.get(sector.id) ?? {
    sectorId: sector.id,
    sectorName: sector.name,
    score: 0, changePercent: 0, breadth: 0, advancing: 0,
    active: 0, avgRvol: 0, avgMomentum: 0, aboveVwapCount: 0,
    newHighCount: 0, volumeAcceleration: 1, acceleration: 0,
    strongLeaderCount: 0, leaders: [], stage: 'IDLE' as const,
    updatedAt: 0,
  });

  return NextResponse.json({ sectors: rankSectors(rows) });
}
