'use client';

/**
 * Header wrapper for pages other than the dashboard.
 *
 * Each page opens its own SSE connection. That is deliberate for the MVP —
 * one connection per tab is well within budget, and it keeps every page
 * independently mountable. If several panels per page ever need the feed,
 * this is where a shared context would go.
 */

import { useEffect, useState, type ReactNode } from 'react';
import { useSSE } from '@/hooks/useSSE';
import { marketClock } from '@/lib/format';
import { StatusBar } from './StatusBar';

export function StatusBarShell({ children }: { children: ReactNode }) {
  const feed = useSSE();
  const [clock, setClock] = useState('');

  useEffect(() => {
    const update = () => setClock(marketClock());
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen">
      <StatusBar
        session={feed.session}
        connection={feed.connection}
        signalCount={feed.signals.length}
        clock={clock}
      />
      {children}
    </div>
  );
}
