'use client';

/**
 * Alert preferences and history.
 *
 * Delivery preferences are per-device and live in localStorage; the rule set
 * and the delivered-alert log are per-user and live in Postgres, so this page
 * degrades cleanly when no database is configured.
 */

import { useQuery } from '@tanstack/react-query';
import { useSSE } from '@/hooks/useSSE';
import { useAlerts } from '@/hooks/useAlerts';
import { marketTime } from '@/lib/format';
import { AlertControls } from './AlertControls';
import { LiveSignalFeed } from '@/components/dashboard/LiveSignalFeed';
import { Empty, Panel, SeverityBadge } from '@/components/ui/primitives';
import type { SignalSeverity, SignalType } from '@shared/types';

interface AlertsPayload {
  rules: Array<{
    id: string; type: SignalType | null; sectorId: string | null;
    minSeverity: SignalSeverity; threshold: number; enabled: boolean;
  }>;
  history: Array<{
    id: string; delivered: boolean; createdAt: string;
    signal: { id: string; type: SignalType; severity: SignalSeverity; headline: string; createdAt: string };
  }>;
}

export function AlertsView() {
  const feed = useSSE();
  const alerts = useAlerts(feed.latestSignal, feed.signals);

  const { data, isError } = useQuery<AlertsPayload>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await fetch('/api/alerts');
      if (!response.ok) throw new Error('Alert rules need a database.');
      return response.json();
    },
    retry: false,
  });

  return (
    <main className="mx-auto max-w-[1200px] space-y-4 px-5 py-5">
      <div>
        <h1 className="text-xl font-semibold text-text">Alerts</h1>
        <p className="mt-1 text-sm text-muted">
          Signals are deduplicated by the state machine before they get here — a sector holding
          BREAKOUT for twenty minutes produces one alert, not two hundred.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <Panel title="Delivery">
          <AlertControls alerts={alerts} />
        </Panel>

        <Panel title="Raised this session" dense className="max-h-[520px] overflow-y-auto">
          {alerts.delivered.length === 0
            ? <Empty>Nothing has met your alert threshold yet.</Empty>
            : <LiveSignalFeed signals={alerts.delivered} />}
        </Panel>
      </div>

      <Panel title="Alert rules" dense>
        {isError ? (
          <p className="px-4 py-6 text-sm text-faint">
            Persisted alert rules need a database. Set <code className="font-mono text-muted">DATABASE_URL</code>,
            then run <code className="font-mono text-muted">npm run db:migrate &amp;&amp; npm run db:seed</code>.
            Delivery settings above work regardless — they are stored in this browser.
          </p>
        ) : !data ? (
          <Empty>Loading…</Empty>
        ) : data.rules.length === 0 ? (
          <Empty>No rules configured.</Empty>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-border-soft text-[10px] uppercase tracking-[0.12em] text-faint">
                <th className="px-4 py-2 text-left font-medium">Signal type</th>
                <th className="px-3 py-2 text-left font-medium">Minimum level</th>
                <th className="px-3 py-2 text-right font-medium">Threshold</th>
                <th className="px-4 py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.rules.map((rule) => (
                <tr key={rule.id} className="border-b border-border-soft/60 last:border-0">
                  <td className="px-4 py-2 text-text">{rule.type?.replace(/_/g, ' ') ?? 'All signals'}</td>
                  <td className="px-3 py-2"><SeverityBadge severity={rule.minSeverity} /></td>
                  <td className="tabular px-3 py-2 text-right text-muted">
                    {rule.threshold || <span className="text-faint">—</span>}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span className={rule.enabled ? 'text-up' : 'text-faint'}>
                      {rule.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {data && data.history.length > 0 && (
        <Panel title="Delivery history" dense className="max-h-[420px] overflow-y-auto">
          <ul className="divide-y divide-border-soft/60">
            {data.history.map((event) => (
              <li key={event.id} className="flex gap-3 px-4 py-2.5">
                <time className="tabular w-16 shrink-0 text-xs text-faint">
                  {marketTime(event.createdAt)}
                </time>
                <SeverityBadge severity={event.signal.severity} />
                <p className="min-w-0 flex-1 text-sm text-text">{event.signal.headline}</p>
                <span className={event.delivered ? 'text-xs text-up' : 'text-xs text-faint'}>
                  {event.delivered ? 'delivered' : 'pending'}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </main>
  );
}
