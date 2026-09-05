'use client';

/**
 * The three questions the spec says the product must answer immediately:
 * what is moving, how broad is it, and why.
 */

import type { SectorMetrics, Signal } from '@shared/types';
import { rankSectors } from '@shared/ranking';
import { changeClass, pct, rvol } from '@/lib/format';
import { Metric, StageBadge, cn } from '@/components/ui/primitives';

export function StatsOverview({ sectors, signals }: {
  sectors: SectorMetrics[]; signals: Signal[];
}) {
  const active = sectors.filter((s) => s.stage !== 'IDLE');
  const leader = rankSectors(active)[0] ?? null;
  const catalyst = signals.find((s) => s.type === 'CATALYST') ?? null;
  const advancing = sectors.reduce((sum, s) => sum + s.advancing, 0);
  const total = sectors.reduce((sum, s) => sum + s.active, 0);

  return (
    <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface p-4 lg:grid-cols-4">
      <Metric
        label="What is moving"
        value={leader ? leader.sectorName.split(' / ')[0] : '—'}
        hint={leader
          ? <span className="flex items-center gap-1.5"><StageBadge stage={leader.stage} /> score {leader.score.toFixed(0)}</span>
          : 'No sector is awake yet'}
      />
      <Metric
        label="How broad"
        value={leader ? `${leader.advancing}/${leader.active}` : '—'}
        tone={leader && leader.breadth >= 0.7 ? 'text-up' : undefined}
        hint={leader ? `${Math.round(leader.breadth * 100)}% breadth · ${rvol(leader.avgRvol)} RVOL` : undefined}
      />
      <Metric
        label="Sector move"
        value={leader ? pct(leader.changePercent) : '—'}
        tone={leader ? changeClass(leader.changePercent) : undefined}
        hint={leader
          ? `${leader.newHighCount} new high${leader.newHighCount === 1 ? '' : 's'} · ${active.length} sectors active`
          : `${advancing}/${total} stocks advancing`}
      />
      <Metric
        label="Why"
        value={catalyst ? 'Catalyst' : leader ? 'No catalyst' : '—'}
        tone={cn(catalyst && 'text-warn')}
        hint={catalyst
          ? (catalyst.metadata.catalyst?.headline ?? catalyst.headline)
          : 'Momentum only — no correlated news'}
      />
    </div>
  );
}
