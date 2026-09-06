'use client';

/**
 * The header.
 *
 * Carries two things the user must never have to guess at: whether the feed is
 * actually live, and whether the numbers are real. A scanner showing synthetic
 * prices without saying so would be worse than one that refuses to start.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MarketSession } from '@shared/types';
import type { ConnectionState } from '@/hooks/useSSE';
import { cn } from '@/components/ui/primitives';

const SESSION_LABEL: Record<MarketSession, string> = {
  PREMARKET: 'Pre-market',
  REGULAR: 'Open',
  AFTER_HOURS: 'After hours',
  CLOSED: 'Closed',
};

const SESSION_TONE: Record<MarketSession, string> = {
  PREMARKET: 'text-warn',
  REGULAR: 'text-up',
  AFTER_HOURS: 'text-warn',
  CLOSED: 'text-faint',
};

const CONNECTION_TONE: Record<ConnectionState, string> = {
  open: 'bg-up',
  connecting: 'bg-warn',
  reconnecting: 'bg-warn',
  closed: 'bg-down',
};

const NAV = [
  { href: '/', label: 'Dashboard' },
  { href: '/watchlists', label: 'Watchlists' },
  { href: '/alerts', label: 'Alerts' },
];

export function StatusBar({
  session, connection, signalCount, clock,
}: {
  session: MarketSession | null;
  connection: ConnectionState;
  signalCount: number;
  clock: string;
}) {
  const pathname = usePathname();
  const effective = session ?? 'CLOSED';

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-2.5">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-sm font-bold uppercase tracking-[0.18em] text-text">MarketPulse</span>
          <span className="hidden text-[10px] uppercase tracking-wider text-faint sm:inline">
            Sector-first scanner
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'rounded px-2 py-1 text-xs transition-colors',
                pathname === item.href
                  ? 'bg-surface-2 text-text'
                  : 'text-muted hover:bg-surface hover:text-text',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 text-xs">
          <span className={cn('font-medium uppercase tracking-wider', SESSION_TONE[effective])}>
            {SESSION_LABEL[effective]}
          </span>
          <span className="tabular hidden text-muted sm:inline">{clock}</span>
          <span className="hidden text-muted md:inline">
            <span className="tabular font-medium text-text">{signalCount}</span> signals today
          </span>
          <span
            className="flex items-center gap-1.5 text-muted"
            title={`Live feed: ${connection}`}
          >
            <span className={cn(
              'h-1.5 w-1.5 rounded-full',
              CONNECTION_TONE[connection],
              connection !== 'open' && 'pulse-dot',
            )} />
            <span className="hidden capitalize lg:inline">{connection}</span>
          </span>
        </div>
      </div>
    </header>
  );
}

/**
 * Shown whenever the numbers are not live market data.
 *
 * Deliberately hard to miss and not dismissible — the one thing a trading tool
 * must never be coy about. It distinguishes three states, because "no worker"
 * and "simulated feed" are different problems with different fixes, and it
 * reads the market session too: no worker at 10am on a Tuesday is a fault,
 * whereas no worker on a Sunday is simply the weekend.
 */
export function SimulationBanner({
  simulated, provider, workerConnected, session,
}: {
  simulated: boolean;
  provider: string | null;
  workerConnected: boolean;
  session: MarketSession | null;
}) {
  if (!workerConnected) {
    const marketOpen = session === 'REGULAR' || session === 'PREMARKET';
    return (
      <div className={cn(
        'border-b px-5 py-2 text-center text-xs',
        marketOpen
          ? 'border-down/30 bg-down/10 text-down'
          : 'border-border bg-surface text-muted',
      )}>
        <strong className="font-semibold">
          {marketOpen ? 'No market worker is running.' : 'No market worker is running.'}
        </strong>{' '}
        {marketOpen
          ? 'The market is open and nothing is collecting data. Start a worker now — these figures are frozen.'
          : 'Nothing is collecting data, which is expected outside market hours. Figures below are from the last session.'}{' '}
        Run <code className="font-mono">./scripts/run-worker.sh</code> locally, or let the scheduled job start it.
      </div>
    );
  }

  if (!simulated) return null;

  return (
    <div className="border-b border-warn/30 bg-warn/10 px-5 py-2 text-center text-xs text-warn">
      <strong className="font-semibold">Simulated data.</strong>{' '}
      The worker is running on a synthetic feed{provider ? ` (${provider})` : ''}, so every price
      here is invented. Set <code className="font-mono">MARKET_DATA_API_KEY</code> on the worker
      for live quotes.
    </div>
  );
}
