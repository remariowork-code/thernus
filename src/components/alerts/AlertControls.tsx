'use client';

import type { AlertsApi } from '@/hooks/useAlerts';
import type { SignalSeverity } from '@shared/types';
import { cn } from '@/components/ui/primitives';

const SEVERITIES: SignalSeverity[] = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const SEVERITY_LABEL: Record<SignalSeverity, string> = {
  INFO: 'L1 Early warning',
  LOW: 'L2 Confirmed',
  MEDIUM: 'L3 Breakout',
  HIGH: 'L4 Catalyst',
  CRITICAL: 'L5 Major move',
};

export function AlertControls({ alerts, compact }: { alerts: AlertsApi; compact?: boolean }) {
  const { preferences, update, permission, requestPermission } = alerts;

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => {
          if (!preferences.enabled && permission === 'default') void requestPermission();
          else update({ enabled: !preferences.enabled });
        }}
        className={cn(
          'rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider transition-colors',
          preferences.enabled
            ? 'border-up/40 bg-up/10 text-up'
            : 'border-border text-faint hover:text-muted',
        )}
        title={
          permission === 'unsupported'
            ? 'This browser does not support notifications'
            : preferences.enabled ? 'Alerts on' : 'Alerts off'
        }
      >
        {preferences.enabled ? 'Alerts on' : 'Alerts off'}
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <Toggle
        label="Browser alerts"
        description="Raise a desktop notification when a qualifying signal fires."
        checked={preferences.enabled}
        onChange={(next) => {
          if (next && permission === 'default') void requestPermission();
          else update({ enabled: next });
        }}
        disabled={permission === 'unsupported'}
      />

      {permission === 'denied' && (
        <p className="rounded border border-warn/30 bg-warn/10 px-3 py-2 text-xs text-warn">
          Notifications are blocked for this site. Re-enable them in your browser&rsquo;s site settings —
          the in-app feed and chime still work.
        </p>
      )}

      <Toggle
        label="Sound"
        description="Play a short chime alongside the notification."
        checked={preferences.sound}
        onChange={(sound) => update({ sound })}
      />

      <Toggle
        label="Sector events only"
        description="Suppress single-stock signals. Sector moves are the point; stock signals are supporting detail."
        checked={preferences.sectorOnly}
        onChange={(sectorOnly) => update({ sectorOnly })}
      />

      <div>
        <div className="text-xs font-medium text-text">Minimum alert level</div>
        <p className="mt-0.5 text-xs text-faint">
          Signals below this level still appear in the feed; they just do not interrupt.
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SEVERITIES.map((severity) => (
            <button
              key={severity}
              type="button"
              onClick={() => update({ minSeverity: severity })}
              className={cn(
                'rounded border px-2 py-1 text-[11px] transition-colors',
                preferences.minSeverity === severity
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:text-text',
              )}
            >
              {SEVERITY_LABEL[severity]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label, description, checked, onChange, disabled,
}: {
  label: string; description: string; checked: boolean;
  onChange: (value: boolean) => void; disabled?: boolean;
}) {
  return (
    <label className={cn('flex cursor-pointer items-start gap-3', disabled && 'cursor-not-allowed opacity-50')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'mt-0.5 h-4 w-7 shrink-0 rounded-full border transition-colors',
          checked ? 'border-up/50 bg-up/30' : 'border-border bg-surface-2',
        )}
      >
        <span className={cn(
          'block h-3 w-3 rounded-full bg-text transition-transform',
          checked ? 'translate-x-3.5' : 'translate-x-0.5',
        )} />
      </button>
      <span className="min-w-0">
        <span className="block text-xs font-medium text-text">{label}</span>
        <span className="block text-xs text-faint">{description}</span>
      </span>
    </label>
  );
}
