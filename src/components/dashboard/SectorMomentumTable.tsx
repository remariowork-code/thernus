'use client';

/**
 * The primary view.
 *
 * Ranked by the product's thesis rather than by percentage gain: a sector at
 * score 60 and accelerating on broad participation sits above one at 75 that
 * has stopped moving. The Acceleration column is the reason the table exists.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { SectorMetrics } from '@shared/types';
import { rankSectors } from '@shared/ranking';
import { changeClass, pct, rvol, signed } from '@/lib/format';
import { BreadthBar, Empty, ScoreCell, StageBadge, cn } from '@/components/ui/primitives';

/** Flash a row when its stage changes — the event worth catching mid-glance. */
function useStageFlash(sectors: SectorMetrics[]): Record<string, 'up' | 'down' | undefined> {
  const previous = useRef(new Map<string, string>());
  const [flashes, setFlashes] = useState<Record<string, 'up' | 'down' | undefined>>({});

  useEffect(() => {
    const changed: Record<string, 'up' | 'down'> = {};
    const rank: Record<string, number> = {
      IDLE: 0, COOLING: 1, AWAKENING: 2, ACCELERATING: 3, BREAKOUT: 4,
    };
    for (const sector of sectors) {
      const before = previous.current.get(sector.sectorId);
      if (before && before !== sector.stage) {
        changed[sector.sectorId] = rank[sector.stage] > rank[before] ? 'up' : 'down';
      }
      previous.current.set(sector.sectorId, sector.stage);
    }
    if (Object.keys(changed).length === 0) return;

    setFlashes(changed);
    const timer = setTimeout(() => setFlashes({}), 800);
    return () => clearTimeout(timer);
  }, [sectors]);

  return flashes;
}

export function SectorMomentumTable({ sectors }: { sectors: SectorMetrics[] }) {
  const ranked = rankSectors(sectors);
  const flashes = useStageFlash(sectors);

  if (ranked.length === 0) {
    return <Empty>Waiting for the first sector calculation…</Empty>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[880px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-soft text-[10px] uppercase tracking-[0.12em] text-faint">
            <th className="px-4 py-2 text-left font-medium">Sector</th>
            <th className="px-3 py-2 text-right font-medium">Score</th>
            <th className="px-3 py-2 text-right font-medium">Change</th>
            <th className="px-3 py-2 text-left font-medium">Breadth</th>
            <th className="px-3 py-2 text-right font-medium">Avg RVOL</th>
            <th className="px-3 py-2 text-right font-medium" title="Sector score now minus its score five minutes ago">
              Accel
            </th>
            <th className="px-3 py-2 text-right font-medium">Highs</th>
            <th className="px-4 py-2 text-left font-medium">Leaders</th>
          </tr>
        </thead>
        <tbody>
          {ranked.map((sector) => (
            <tr
              key={sector.sectorId}
              className={cn(
                'group border-b border-border-soft/60 transition-colors last:border-0 hover:bg-surface-2/60',
                flashes[sector.sectorId] === 'up' && 'flash-up',
                flashes[sector.sectorId] === 'down' && 'flash-down',
              )}
            >
              <td className="px-4 py-2.5">
                <Link href={`/sectors/${sector.sectorId}`} className="flex items-center gap-2">
                  <span className="font-medium text-text group-hover:text-accent">{sector.sectorName}</span>
                  <StageBadge stage={sector.stage} />
                </Link>
              </td>
              <td className="px-3 py-2.5 text-right"><ScoreCell value={sector.score} /></td>
              <td className={cn('tabular px-3 py-2.5 text-right font-medium', changeClass(sector.changePercent))}>
                {pct(sector.changePercent)}
              </td>
              <td className="px-3 py-2.5">
                <BreadthBar value={sector.breadth} advancing={sector.advancing} active={sector.active} />
              </td>
              <td className="tabular px-3 py-2.5 text-right text-muted">{rvol(sector.avgRvol)}</td>
              <td className={cn('tabular px-3 py-2.5 text-right font-medium', changeClass(sector.acceleration))}>
                {signed(sector.acceleration)}
              </td>
              <td className="tabular px-3 py-2.5 text-right text-muted">
                {sector.newHighCount > 0
                  ? <span className="text-up">{sector.newHighCount}</span>
                  : <span className="text-faint">—</span>}
              </td>
              <td className="px-4 py-2.5">
                <div className="flex flex-wrap gap-x-2.5 gap-y-1">
                  {sector.leaders.slice(0, 3).map((leader) => (
                    <Link
                      key={leader.symbol}
                      href={`/stocks/${leader.symbol}`}
                      className="tabular whitespace-nowrap text-xs text-muted hover:text-accent"
                    >
                      <span className="font-medium">{leader.symbol}</span>{' '}
                      <span className={changeClass(leader.changePercent)}>{pct(leader.changePercent)}</span>
                      {leader.isNewHigh && <span className="ml-0.5 text-up" title="New intraday high">▲</span>}
                    </Link>
                  ))}
                  {sector.leaders.length === 0 && <span className="text-xs text-faint">—</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
