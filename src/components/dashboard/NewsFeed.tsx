'use client';

/**
 * Catalyst view.
 *
 * Headlines that reached a moving sector are marked; the rest are recorded but
 * explicitly not treated as signals. That separation is the point — "moving"
 * and "moving because something happened" are different claims.
 */

import Link from 'next/link';
import type { NewsHeadline, Signal } from '@shared/types';
import { marketTime, relativeTime } from '@/lib/format';
import { Empty, cn } from '@/components/ui/primitives';

export function NewsFeed({ news, signals }: { news: NewsHeadline[]; signals: Signal[] }) {
  if (news.length === 0) {
    return (
      <Empty>
        No headlines ingested yet. Configure a news provider to correlate catalysts with movement.
      </Empty>
    );
  }

  const correlated = new Set(
    signals.filter((s) => s.type === 'CATALYST')
      .map((s) => s.metadata.catalyst?.url)
      .filter((url): url is string => Boolean(url)),
  );

  return (
    <ul className="divide-y divide-border-soft/60">
      {news.map((item) => {
        const isCatalyst = correlated.has(item.url);
        return (
          <li key={item.id} className="flex gap-3 px-4 py-3">
            <time
              className="tabular w-16 shrink-0 pt-px text-xs text-faint"
              dateTime={item.publishedAt}
              title={relativeTime(item.publishedAt)}
            >
              {marketTime(item.publishedAt)}
            </time>

            <span className={cn(
              'h-fit shrink-0 rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider',
              isCatalyst ? 'border-warn/40 bg-warn/10 text-warn' : 'border-border text-faint',
            )}>
              {item.catalystType.replace('_AND_', '&').replace(/_/g, ' ')}
            </span>

            <div className="min-w-0 flex-1">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm leading-snug text-text hover:text-accent"
              >
                {item.headline}
              </a>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-faint">
                <span>{item.source}</span>
                {item.symbols.map((symbol) => (
                  <Link key={symbol} href={`/stocks/${symbol}`} className="hover:text-accent">
                    {symbol}
                  </Link>
                ))}
                {isCatalyst
                  ? <span className="text-warn">correlated with an active sector move</span>
                  : <span>tagged only — sector not moving</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
