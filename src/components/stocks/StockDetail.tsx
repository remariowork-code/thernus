'use client';

/**
 * Individual stock analysis.
 *
 * Shows the metric set the spec enumerates, and — the part that matters —
 * which sectors this name belongs to, because a stock's move only means
 * something here in the context of its sector.
 */

import Link from 'next/link';
import { useMemo } from 'react';
import { useSSE } from '@/hooks/useSSE';
import { changeClass, compactVolume, pct, price, rvol } from '@/lib/format';
import type { StockMetrics } from '@shared/types';
import { LiveSignalFeed } from '@/components/dashboard/LiveSignalFeed';
import { Metric, Panel, StageBadge, cn } from '@/components/ui/primitives';

export function StockDetail({
  symbol, name, exchange, sectors, initial,
}: {
  symbol: string;
  name: string;
  exchange: string;
  sectors: Array<{ id: string; name: string }>;
  initial: StockMetrics | null;
}) {
  const feed = useSSE();
  const metrics = feed.metrics.get(symbol) ?? initial;

  const signals = useMemo(
    () => feed.signals.filter((s) => s.symbol === symbol
      || (s.symbol === null && s.sectorId !== null && sectors.some((sec) => sec.id === s.sectorId))),
    [feed.signals, symbol, sectors],
  );

  const news = feed.news.filter((n) => n.symbols.includes(symbol));

  return (
    <main className="mx-auto max-w-[1600px] space-y-4 px-5 py-5">
      <div>
        <Link href="/" className="text-xs text-faint hover:text-accent">← Dashboard</Link>
        <div className="mt-2 flex flex-wrap items-baseline gap-3">
          <h1 className="text-xl font-semibold text-text">{symbol}</h1>
          <span className="text-sm text-muted">{name}</span>
          <span className="text-xs text-faint">{exchange}</span>
          {metrics && <StageBadge stage={metrics.stage} />}
        </div>
        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          <span className="text-faint">Sectors:</span>
          {sectors.map((sector) => (
            <Link key={sector.id} href={`/sectors/${sector.id}`} className="text-muted hover:text-accent">
              {sector.name}
            </Link>
          ))}
        </div>
      </div>

      {metrics ? (
        <>
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-surface p-4 md:grid-cols-4 xl:grid-cols-7">
            <Metric
              label="Price"
              value={price(metrics.price)}
              hint={`prev close ${price(metrics.previousClose)}`}
            />
            <Metric
              label="Change"
              value={pct(metrics.changePercent)}
              tone={changeClass(metrics.changePercent)}
              hint={`1m ${pct(metrics.change1m)} · 5m ${pct(metrics.change5m)}`}
            />
            <Metric label="Score" value={metrics.momentumScore.toFixed(0)} hint="0-100 momentum" />
            <Metric
              label="RVOL"
              value={rvol(metrics.rvol)}
              tone={metrics.rvol >= 2 ? 'text-warn' : undefined}
              hint={`${compactVolume(metrics.volume)} shares`}
            />
            <Metric
              label="Vol accel"
              value={rvol(metrics.volumeAcceleration)}
              hint="5m vs prior 15m"
            />
            <Metric
              label="VWAP"
              value={price(metrics.vwap)}
              tone={changeClass(metrics.vwapDistance)}
              hint={`${pct(metrics.vwapDistance)} ${metrics.aboveVwap ? 'above' : 'below'}`}
            />
            <Metric
              label="Day range"
              value={pct(-metrics.distanceFromHigh)}
              tone={metrics.isNewHigh ? 'text-up' : undefined}
              hint={metrics.isNewHigh
                ? 'At a new intraday high'
                : `${price(metrics.dayLow)} – ${price(metrics.dayHigh)}`}
            />
          </div>

          <div className={cn(
            'rounded-lg border px-4 py-3 text-sm',
            metrics.momentumScore >= 60
              ? 'border-up/30 bg-up/5 text-text'
              : 'border-border bg-surface text-muted',
          )}>
            <Summary metrics={metrics} sectors={sectors} />
          </div>
        </>
      ) : (
        <p className="rounded-lg border border-border bg-surface px-4 py-8 text-center text-sm text-faint">
          No live data for {symbol} yet. It is in the universe but has not traded this session.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Related signals" dense className="max-h-[480px] overflow-y-auto">
          <LiveSignalFeed signals={signals} />
        </Panel>

        <Panel title="News" dense className="max-h-[480px] overflow-y-auto">
          {news.length === 0
            ? <p className="px-4 py-8 text-center text-sm text-faint">No headlines for {symbol}.</p>
            : (
              <ul className="divide-y divide-border-soft/60">
                {news.map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <a href={item.url} target="_blank" rel="noopener noreferrer"
                       className="text-sm text-text hover:text-accent">
                      {item.headline}
                    </a>
                    <div className="mt-1 text-[11px] text-faint">
                      {item.source} · {item.catalystType.replace(/_/g, ' ')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
        </Panel>
      </div>
    </main>
  );
}

/** One plain sentence, so the page answers its own question. */
function Summary({ metrics, sectors }: {
  metrics: StockMetrics; sectors: Array<{ id: string; name: string }>;
}) {
  const parts: string[] = [];

  parts.push(
    metrics.changePercent >= 0
      ? `${metrics.symbol} is up ${metrics.changePercent.toFixed(1)}% today`
      : `${metrics.symbol} is down ${Math.abs(metrics.changePercent).toFixed(1)}% today`,
  );

  parts.push(
    metrics.rvol >= 2 ? `on ${metrics.rvol.toFixed(1)}x its normal volume for this time of day`
    : metrics.rvol >= 1 ? `on roughly normal volume (${metrics.rvol.toFixed(1)}x)`
    : `on light volume (${metrics.rvol.toFixed(1)}x)`,
  );

  if (metrics.isNewHigh) parts.push('and is printing new intraday highs');
  else if (metrics.distanceFromHigh < 0.5) parts.push('and is sitting just under its day high');

  const sectorName = sectors[0]?.name;
  const context = sectorName
    ? ` Whether that matters depends on ${sectorName} — a single name moving alone is noise.`
    : '';

  return <>{parts.join(', ')}.{context}</>;
}
