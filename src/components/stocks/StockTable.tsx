'use client';

/**
 * Sortable stock table, shared by the dashboard tabs, sector pages and
 * watchlists. Defaults to momentum score, since "already up the most" is the
 * ranking this product exists to argue against.
 */

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { StockMetrics } from '@shared/types';
import { changeClass, compactVolume, pct, price, rvol } from '@/lib/format';
import { Empty, ScoreCell, cn } from '@/components/ui/primitives';

type SortKey = 'momentumScore' | 'changePercent' | 'change5m' | 'rvol' | 'volumeAcceleration' | 'vwapDistance' | 'symbol';

const COLUMNS: Array<{ key: SortKey; label: string; align: 'left' | 'right'; title?: string }> = [
  { key: 'symbol', label: 'Symbol', align: 'left' },
  { key: 'momentumScore', label: 'Score', align: 'right', title: 'Composite momentum score, 0-100' },
  { key: 'changePercent', label: 'Change', align: 'right' },
  { key: 'change5m', label: '5m', align: 'right' },
  { key: 'rvol', label: 'RVOL', align: 'right', title: 'Volume vs typical for this time of day' },
  { key: 'volumeAcceleration', label: 'Vol accel', align: 'right', title: 'Last 5 minutes vs the prior 15' },
  { key: 'vwapDistance', label: 'VWAP', align: 'right', title: 'Distance from session VWAP' },
];

export interface StockRow extends StockMetrics { name?: string }

export function StockTable({
  stocks, emptyMessage = 'No stocks match.', compact,
}: {
  stocks: StockRow[]; emptyMessage?: string; compact?: boolean;
}) {
  const [sortKey, setSortKey] = useState<SortKey>('momentumScore');
  const [ascending, setAscending] = useState(false);

  const sorted = useMemo(() => {
    const rows = [...stocks];
    rows.sort((a, b) => {
      if (sortKey === 'symbol') {
        return ascending ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol);
      }
      const delta = (a[sortKey] as number) - (b[sortKey] as number);
      return ascending ? delta : -delta;
    });
    return rows;
  }, [stocks, sortKey, ascending]);

  if (stocks.length === 0) return <Empty>{emptyMessage}</Empty>;

  const toggle = (key: SortKey) => {
    if (key === sortKey) setAscending((v) => !v);
    else { setSortKey(key); setAscending(false); }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border-soft text-[10px] uppercase tracking-[0.12em] text-faint">
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                title={column.title}
                className={cn(
                  'px-3 py-2 font-medium',
                  column.align === 'right' ? 'text-right' : 'text-left',
                  column.key === 'symbol' && 'pl-4',
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(column.key)}
                  className="inline-flex items-center gap-1 uppercase tracking-[0.12em] hover:text-text"
                >
                  {column.label}
                  {sortKey === column.key && <span aria-hidden>{ascending ? '▲' : '▼'}</span>}
                </button>
              </th>
            ))}
            {!compact && <th className="px-4 py-2 text-right font-medium">Volume</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map((stock) => (
            <tr key={stock.symbol} className="border-b border-border-soft/60 last:border-0 hover:bg-surface-2/60">
              <td className="py-2 pl-4 pr-3">
                <Link href={`/stocks/${stock.symbol}`} className="group flex items-baseline gap-2">
                  <span className="font-medium text-text group-hover:text-accent">{stock.symbol}</span>
                  {stock.isNewHigh && (
                    <span className="text-[10px] font-semibold text-up" title="New intraday high">HIGH</span>
                  )}
                  {stock.name && !compact && (
                    <span className="hidden max-w-[180px] truncate text-xs text-faint xl:inline">{stock.name}</span>
                  )}
                </Link>
              </td>
              <td className="px-3 py-2 text-right"><ScoreCell value={stock.momentumScore} /></td>
              <td className={cn('tabular px-3 py-2 text-right font-medium', changeClass(stock.changePercent))}>
                {pct(stock.changePercent)}
              </td>
              <td className={cn('tabular px-3 py-2 text-right', changeClass(stock.change5m))}>
                {pct(stock.change5m)}
              </td>
              <td className={cn('tabular px-3 py-2 text-right', stock.rvol >= 2 ? 'text-warn' : 'text-muted')}>
                {rvol(stock.rvol)}
              </td>
              <td className="tabular px-3 py-2 text-right text-muted">{rvol(stock.volumeAcceleration)}</td>
              <td className={cn('tabular px-3 py-2 text-right', changeClass(stock.vwapDistance))}>
                {pct(stock.vwapDistance)}
              </td>
              {!compact && (
                <td className="tabular px-4 py-2 text-right text-faint">
                  {compactVolume(stock.volume)}
                  <span className="ml-2 text-muted">{price(stock.price)}</span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
