'use client';

/**
 * The primary view.
 *
 * Ranked by the product's thesis rather than by percentage gain: a sector at
 * score 60 and accelerating on broad participation sits above one at 75 that
 * has stopped moving. The Acceleration column is the reason the table exists.
 */

import Link from 'next/link';
import type { SectorMetrics } from '@shared/types';
import { rankSectors } from '@shared/ranking';
import { changeClass, pct, rvol, signed } from '@/lib/format';
import { BreadthBar, Empty, ScoreCell, StageBadge, cn } from '@/components/ui/primitives';

/**
 * Flash a row when it enters an active stage — the one event worth catching
 * mid-glance.
 *
 * Done with a remount rather than state: the row's key includes its stage, so
 * a stage change unmounts the old row and mounts a new one, and the CSS
 * animation runs on mount. No effect and no ref read during render, so no
 * cascading re-render on every worker tick.
 *
 * Idle rows never flash, which is why a first paint full of quiet sectors is
 * still and only the sectors actually doing something light up.
 */
function flashClass(stage: SectorMetrics['stage']): string | false {
  if (stage === 'AWAKENING' || stage === 'ACCELERATING' || stage === 'BREAKOUT') return 'flash-up';
  if (stage === 'COOLING') return 'flash-down';
  return false;
}

export function SectorMomentumTable({ sectors }: { sectors: SectorMetrics[] }) {
  const ranked = rankSectors(sectors);

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
              key={`${sector.sectorId}:${sector.stage}`}
              className={cn(
                'group border-b border-border-soft/60 transition-colors last:border-0 hover:bg-surface-2/60',
                flashClass(sector.stage),
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
