/**
 * Root dashboard.
 *
 * Server-rendered with whatever sector state Redis already holds, so the first
 * paint carries real data rather than a spinner; the client then takes over on
 * the SSE stream.
 */

import { Dashboard } from '@/components/dashboard/Dashboard';
import { marketStore, universe } from '@/lib/server/market';
import { rankSectors } from '@shared/ranking';
import type { SectorMetrics } from '@shared/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let sectors: SectorMetrics[] = [];

  try {
    const [live, { value: uni }] = await Promise.all([
      marketStore().readAllSectors(),
      universe(),
    ]);

    // Sectors with no live state are shown as placeholders, so the table does
    // not reflow as the worker warms up.
    const bySector = new Map(live.map((s) => [s.sectorId, s]));
    sectors = rankSectors(uni.sectors.map((sector) => bySector.get(sector.id) ?? {
      sectorId: sector.id,
      sectorName: sector.name,
      score: 0, changePercent: 0, breadth: 0, advancing: 0, active: 0,
      avgRvol: 0, avgMomentum: 0, aboveVwapCount: 0, newHighCount: 0,
      volumeAcceleration: 1, acceleration: 0, strongLeaderCount: 0,
      leaders: [], stage: 'IDLE' as const, updatedAt: 0,
    }));
  } catch {
    // Redis unreachable at render time: the client still connects and fills in.
  }

  return <Dashboard initialSectors={sectors} />;
}
