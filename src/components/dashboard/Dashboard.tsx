'use client';

/**
 * The dashboard.
 *
 * Sector-first by construction: the sector table and the signal narrative sit
 * above the fold, and the stock-level tabs are secondary. The tab set is the
 * one the spec names — awakening, momentum, breakouts, unusual volume,
 * catalysts, watchlists.
 */

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSSE } from '@/hooks/useSSE';
import { useAlerts } from '@/hooks/useAlerts';
import { marketClock } from '@/lib/format';
import { rankSectors } from '@shared/ranking';
import type { SectorMetrics, StockMetrics } from '@shared/types';
import { SectorMomentumTable } from './SectorMomentumTable';
import { LiveSignalFeed } from './LiveSignalFeed';
import { StatsOverview } from './StatsOverview';
import { SimulationBanner, StatusBar } from './StatusBar';
import { Tabs, type TabDefinition } from './Tabs';
import { AlertControls } from '@/components/alerts/AlertControls';
import { NewsFeed } from '@/components/dashboard/NewsFeed';
import { StockTable } from '@/components/stocks/StockTable';
import { Panel } from '@/components/ui/primitives';

interface HealthPayload {
  simulated: boolean;
  provider: string | null;
  redis: string;
  workerConnected: boolean;
  universeSource: string;
  sectors: number;
  symbols: number;
}

interface WatchlistPayload {
  watchlists: Array<{ id: string; name: string; symbols: string[] }>;
}

export function Dashboard({ initialSectors }: { initialSectors: SectorMetrics[] }) {
  const feed = useSSE();
  const alerts = useAlerts(feed.latestSignal, feed.signals);
  const [tab, setTab] = useState('awakening');

  // A clock rendered on the server would mismatch on hydration, so it starts
  // empty and fills in on the client.
  const [clock, setClock] = useState('');
  useEffect(() => {
    const update = () => setClock(marketClock());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: health } = useQuery<HealthPayload>({
    queryKey: ['health'],
    queryFn: async () => (await fetch('/api/health')).json(),
    refetchInterval: 30_000,
  });

  const { data: watchlistData } = useQuery<WatchlistPayload>({
    queryKey: ['watchlists'],
    queryFn: async () => {
      const response = await fetch('/api/watchlists');
      // Watchlists need a database; absence is a normal state, not an error.
      if (!response.ok) return { watchlists: [] };
      return response.json();
    },
    retry: false,
  });

  const sectors = feed.sectors.length > 0 ? feed.sectors : initialSectors;
  const stocks = useMemo(() => [...feed.metrics.values()], [feed.metrics]);

  const views = useMemo(() => buildViews(sectors, stocks, watchlistData?.watchlists ?? []),
    [sectors, stocks, watchlistData]);

  const tabs: TabDefinition[] = [
    { id: 'awakening', label: 'Sector Awakening', count: views.awakening.length, hint: 'Sectors beginning to move' },
    { id: 'momentum', label: 'Intraday Momentum', count: views.momentum.length, hint: 'Stocks with rapidly rising momentum' },
    { id: 'breakouts', label: 'Breakouts', count: views.breakouts.length, hint: 'New intraday highs on volume' },
    { id: 'volume', label: 'Unusual Volume', count: views.volume.length, hint: 'Time-of-day normalised RVOL' },
    { id: 'catalysts', label: 'Catalysts', count: feed.news.length, hint: 'News correlated with movement' },
    { id: 'watchlist', label: 'My Watchlists', count: views.watchlist.length },
  ];

  return (
    <div className="min-h-screen">
      <StatusBar
        session={feed.session}
        connection={feed.connection}
        signalCount={feed.signals.length}
        clock={clock}
      />
      <SimulationBanner
        simulated={health?.simulated ?? true}
        provider={health?.provider ?? null}
        // Until /api/health answers, assume a worker is present rather than
        // flashing an alarming banner on every page load.
        workerConnected={health?.workerConnected ?? true}
        session={feed.session}
      />

      <main className="mx-auto max-w-[1600px] space-y-4 px-5 py-5">
        <StatsOverview sectors={sectors} signals={feed.signals} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Panel
            title="Sector Momentum"
            action={<span className="text-[10px] text-faint">Ranked by acceleration and breadth, not by gain</span>}
            dense
          >
            <SectorMomentumTable sectors={sectors} />
          </Panel>

          <Panel
            title="Live Signals"
            action={<AlertControls alerts={alerts} compact />}
            dense
            className="max-h-[560px] overflow-y-auto"
          >
            <LiveSignalFeed signals={feed.signals} />
          </Panel>
        </div>

        <Panel dense>
          <div className="px-2 pt-2">
            <Tabs tabs={tabs} active={tab} onChange={setTab} />
          </div>

          {tab === 'awakening' && (
            views.awakening.length > 0
              ? <SectorMomentumTable sectors={views.awakening} />
              : <p className="px-4 py-8 text-center text-sm text-faint">
                  No sector is awake. That is the normal state — the scanner is watching{' '}
                  {health?.symbols ?? '—'} symbols across {health?.sectors ?? '—'} sectors.
                </p>
          )}

          {tab === 'momentum' && (
            <StockTable stocks={views.momentum} emptyMessage="No stocks are building momentum yet." />
          )}
          {tab === 'breakouts' && (
            <StockTable stocks={views.breakouts} emptyMessage="No new intraday highs on elevated volume." />
          )}
          {tab === 'volume' && (
            <StockTable stocks={views.volume} emptyMessage="Nothing is trading unusually for this time of day." />
          )}
          {tab === 'catalysts' && <NewsFeed news={feed.news} signals={feed.signals} />}
          {tab === 'watchlist' && (
            <StockTable
              stocks={views.watchlist}
              emptyMessage={
                watchlistData?.watchlists.length
                  ? 'Your watchlist symbols have no live data yet.'
                  : 'No watchlists yet. Create one to track your own symbols.'
              }
            />
          )}
        </Panel>
      </main>
    </div>
  );
}

/**
 * Tab contents.
 *
 * Each view is a filter with a thesis, not an arbitrary sort: breakouts require
 * a new high *plus* volume; unusual volume is RVOL, which is time-of-day
 * normalised, so it means something at 09:45.
 */
function buildViews(
  sectors: SectorMetrics[],
  stocks: StockMetrics[],
  watchlists: Array<{ symbols: string[] }>,
) {
  const watchSymbols = new Set(watchlists.flatMap((w) => w.symbols));

  return {
    awakening: rankSectors(sectors.filter((s) => s.stage === 'AWAKENING' || s.stage === 'ACCELERATING')),
    momentum: stocks
      .filter((s) => s.momentumScore >= 50)
      .sort((a, b) => b.momentumScore - a.momentumScore)
      .slice(0, 50),
    breakouts: stocks
      .filter((s) => s.isNewHigh && s.rvol >= 1.5)
      .sort((a, b) => b.changePercent - a.changePercent),
    volume: stocks
      .filter((s) => s.rvol >= 2)
      .sort((a, b) => b.rvol - a.rvol)
      .slice(0, 50),
    watchlist: stocks.filter((s) => watchSymbols.has(s.symbol)),
  };
}
