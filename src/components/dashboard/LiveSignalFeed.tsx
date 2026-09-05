'use client';

/**
 * The running narrative.
 *
 * Each row is the pre-rendered sentence the signal engine produced, because
 * the product's whole argument is that the system should do the interpreting.
 */

import Link from 'next/link';
import type { Signal } from '@shared/types';
import { marketTime, relativeTime } from '@/lib/format';
import { Empty, SeverityBadge, cn } from '@/components/ui/primitives';

const TYPE_LABEL: Record<Signal['type'], string> = {
  MOMENTUM_START: 'Momentum',
  MOMENTUM_ACCELERATION: 'Accelerating',
  VOLUME_SPIKE: 'Volume',
  NEW_HIGH: 'New high',
  VWAP_BREAK: 'VWAP',
  SECTOR_AWAKENING: 'Awakening',
  SECTOR_BREAKOUT: 'Breakout',
  SECTOR_ACCELERATION: 'Sector',
  CATALYST: 'Catalyst',
};

export function LiveSignalFeed({
  signals, limit = 40, showSector = true,
}: {
  signals: Signal[]; limit?: number; showSector?: boolean;
}) {
  if (signals.length === 0) {
    return <Empty>No signals yet. The feed fills as sectors begin to move.</Empty>;
  }

  return (
    <ul className="divide-y divide-border-soft/60">
      {signals.slice(0, limit).map((signal, index) => (
        <li
          key={signal.id}
          className={cn('flex gap-3 px-4 py-2.5', index === 0 && 'slide-in')}
        >
          <time
            className="tabular w-16 shrink-0 pt-px text-xs text-faint"
            dateTime={signal.createdAt}
            title={relativeTime(signal.createdAt)}
          >
            {marketTime(signal.createdAt)}
          </time>

          <SeverityBadge severity={signal.severity} />

          <div className="min-w-0 flex-1">
            <p className="text-sm leading-snug text-text">{signal.headline}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-faint">
              <span className="uppercase tracking-wider">{TYPE_LABEL[signal.type]}</span>
              {showSector && signal.sectorId && signal.sectorName && (
                <>
                  <span aria-hidden>·</span>
                  <Link href={`/sectors/${signal.sectorId}`} className="hover:text-accent">
                    {signal.sectorName}
                  </Link>
                </>
              )}
              {signal.symbol && (
                <>
                  <span aria-hidden>·</span>
                  <Link href={`/stocks/${signal.symbol}`} className="hover:text-accent">
                    {signal.symbol}
                  </Link>
                </>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
