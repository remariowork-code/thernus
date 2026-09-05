'use client';

/**
 * Sector detail.
 *
 * Built to answer the five questions the spec sets out, in order and within
 * seconds: what is happening, how broad is it, which stocks lead, is momentum
 * accelerating, and why might it be happening.
 */

import Link from 'next/link';
import { useMemo } from 'react';
import { useSSE } from '@/hooks/useSSE';
import { changeClass, pct, rvol, signed } from '@/lib/format';
import type { SectorMetrics, StockMetrics } from '@shared/types';
import { LiveSignalFeed } from '@/components/dashboard/LiveSignalFeed';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { StockTable } from '@/components/stocks/StockTable';
import { IntradayChart } from '@/components/charts/IntradayChart';
import { BreadthBar, Metric, Panel, StageBadge, cn } from '@/components/ui/primitives';

export function SectorDetail({
  sectorId, sectorName, constituents, initial,
}: {
  sectorId: string;
  sectorName: string;
  constituents: string[];
  initial: SectorMetrics | null;
}) {
  const feed = useSSE();

  const sector = feed.sectors.find((s) => s.sectorId === sectorId) ?? initial;
  const symbols = useMemo(() => new Set(constituents), [constituents]);

  const stocks = useMemo(
    () => [...feed.metrics.values()].filter((m: StockMetrics) => symbols.has(m.symbol)),
    [feed.metrics, symbols],
  );

  const signals = feed.signals.filter((s) => s.sectorId === sectorId);
  const news = feed.news.filter((n) => n.sectorIds.includes(sectorId));

  return (
    <main className="mx-auto max-w-[1600px] space-y-4 px-5 py-5">
      <div>
        <Link href="/" className="text-xs text-faint hover:text-accent">← All sectors</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold text-text">{sectorName}</h1>
          {sector && <StageBadge stage={sector.stage} />}
          <span className="text-xs text-faint">{constituents.length} constituents</span>
        </div>
      </div>

      {/* 1. What is happening, 2. how broad, 4. is it accelerating */}
      <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface p-4 lg:grid-cols-6">
        <Metric label="Score" value={sector ? sector.score.toFixed(0) : '—'} hint="0-100 weighted momentum" />
        <Metric
          label="Change"
          value={sector ? pct(sector.changePercent) : '—'}
          tone={sector ? changeClass(sector.changePercent) : undefined}
          hint="Mean constituent move"
        />
        <div className="min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-faint">Breadth</div>
          <div className="mt-2">
            {sector
              ? <BreadthBar value={sector.breadth} advancing={sector.advancing} active={sector.active} />
              : <span className="text-muted">—</span>}
          </div>
        </div>
        <Metric label="Avg RVOL" value={sector ? rvol(sector.avgRvol) : '—'} hint="vs typical for this time" />
        <Metric
          label="Acceleration"
          value={sector ? signed(sector.acceleration) : '—'}
          tone={sector ? changeClass(sector.acceleration) : undefined}
          hint="Score change over 5m"
        />
        <Metric
          label="New highs"
          value={sector ? String(sector.newHighCount) : '—'}
          tone={sector && sector.newHighCount > 0 ? 'text-up' : undefined}
          hint={sector ? `${sector.aboveVwapCount} above VWAP` : undefined}
        />
      </div>

      {/* 3. Which stocks are leading */}
      {sector && sector.leaders.length > 0 && (
        <Panel title="Leaders">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {sector.leaders.map((leader) => (
              <Link
                key={leader.symbol}
                href={`/stocks/${leader.symbol}`}
                className="rounded-lg border border-border-soft bg-surface-2/50 p-3 transition-colors hover:border-accent/40"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold text-text">{leader.symbol}</span>
                  <span className={cn('tabular text-sm font-medium', changeClass(leader.changePercent))}>
                    {pct(leader.changePercent)}
                  </span>
                </div>
                <div className="tabular mt-1.5 flex items-center gap-3 text-xs text-faint">
                  <span>RVOL {rvol(leader.rvol)}</span>
                  <span>Score {leader.momentumScore.toFixed(0)}</span>
                </div>
                {leader.isNewHigh && (
                  <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-up">
                    New intraday high
                  </div>
                )}
              </Link>
            ))}
          </div>
        </Panel>
      )}

      <Panel title="Sector score, intraday" dense>
        <IntradayChart
          points={feed.sectors.length > 0 && sector
            ? [{ time: Math.floor(sector.updatedAt / 1000), value: sector.score }]
            : []}
          sectorId={sectorId}
        />
      </Panel>

      <Panel title="Constituents" dense>
        <StockTable stocks={stocks} emptyMessage="No live data for these constituents yet." />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* The story of the move, in order */}
        <Panel title="Signal timeline" dense className="max-h-[480px] overflow-y-auto">
          <LiveSignalFeed signals={signals} showSector={false} />
        </Panel>

        {/* 5. Why might it be happening */}
        <Panel title="Catalysts" dense className="max-h-[480px] overflow-y-auto">
          <NewsFeed news={news} signals={signals} />
        </Panel>
      </div>
    </main>
  );
}
