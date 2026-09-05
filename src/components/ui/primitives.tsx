/**
 * The small set of visual primitives the whole app is built from.
 *
 * Hand-rolled rather than pulled from a component library: there are six of
 * them, they carry the product's semantics (stage, severity, direction), and a
 * dependency would only add indirection between a badge and its meaning.
 */

import type { ReactNode } from 'react';
import type { SectorStage, SignalSeverity } from '@shared/types';

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------

export function Panel({
  title, action, children, className, dense,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  dense?: boolean;
}) {
  return (
    <section className={cn('rounded-lg border border-border bg-surface', className)}>
      {title && (
        <header className="flex items-center justify-between gap-3 border-b border-border-soft px-4 py-2.5">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{title}</h2>
          {action}
        </header>
      )}
      <div className={dense ? '' : 'p-4'}>{children}</div>
    </section>
  );
}

// ---------------------------------------------------------------------------

const STAGE_STYLES: Record<SectorStage, string> = {
  IDLE: 'border-border text-faint',
  AWAKENING: 'border-accent/40 text-accent bg-accent/10',
  ACCELERATING: 'border-warn/40 text-warn bg-warn/10',
  BREAKOUT: 'border-up/50 text-up bg-up/10',
  COOLING: 'border-down/40 text-down bg-down/10',
};

const STAGE_LABELS: Record<SectorStage, string> = {
  IDLE: 'Idle',
  AWAKENING: 'Awakening',
  ACCELERATING: 'Confirmed',
  BREAKOUT: 'Breakout',
  COOLING: 'Cooling',
};

export function StageBadge({ stage, className }: { stage: SectorStage; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
      STAGE_STYLES[stage], className,
    )}>
      {STAGE_LABELS[stage]}
    </span>
  );
}

// ---------------------------------------------------------------------------

const SEVERITY_STYLES: Record<SignalSeverity, string> = {
  INFO: 'border-border text-muted',
  LOW: 'border-accent/40 text-accent',
  MEDIUM: 'border-warn/40 text-warn',
  HIGH: 'border-down/50 text-down',
  CRITICAL: 'border-down text-down bg-down/15',
};

/** Alert levels 1-5, as the spec names them. */
const SEVERITY_LEVEL: Record<SignalSeverity, number> = {
  INFO: 1, LOW: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5,
};

export function SeverityBadge({ severity }: { severity: SignalSeverity }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded border px-1 py-0.5 font-mono text-[10px] font-bold',
        SEVERITY_STYLES[severity],
      )}
      title={`Alert level ${SEVERITY_LEVEL[severity]} — ${severity}`}
    >
      L{SEVERITY_LEVEL[severity]}
    </span>
  );
}

// ---------------------------------------------------------------------------

/**
 * A horizontal breadth meter. Breadth is the single most important number on
 * the dashboard, and a bar communicates "8 of 10" faster than the digits do.
 */
export function BreadthBar({ value, advancing, active }: {
  value: number; advancing: number; active: number;
}) {
  const percent = Math.round(value * 100);
  const tone = value >= 0.7 ? 'bg-up' : value >= 0.5 ? 'bg-warn' : 'bg-down';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-surface-2">
        <div className={cn('h-full rounded-full transition-[width] duration-500', tone)}
             style={{ width: `${percent}%` }} />
      </div>
      <span className="tabular text-xs text-muted">
        {percent}%
        <span className="ml-1 text-faint">({advancing}/{active})</span>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------

export function ScoreCell({ value }: { value: number }) {
  const tone = value >= 75 ? 'text-up' : value >= 50 ? 'text-warn' : value >= 25 ? 'text-muted' : 'text-faint';
  return <span className={cn('tabular font-semibold', tone)}>{value.toFixed(0)}</span>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="px-4 py-8 text-center text-sm text-faint">{children}</p>;
}

export function Metric({ label, value, hint, tone }: {
  label: string; value: ReactNode; hint?: ReactNode; tone?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-faint">{label}</div>
      <div className={cn('tabular mt-0.5 text-xl font-semibold', tone ?? 'text-text')}>{value}</div>
      {hint && <div className="mt-0.5 truncate text-xs text-faint">{hint}</div>}
    </div>
  );
}
