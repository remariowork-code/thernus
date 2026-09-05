'use client';

import type { ReactNode } from 'react';
import { cn } from '@/components/ui/primitives';

export interface TabDefinition {
  id: string;
  label: string;
  /** Rendered as a count chip beside the label. */
  count?: number;
  hint?: string;
}

export function Tabs({
  tabs, active, onChange, right,
}: {
  tabs: TabDefinition[];
  active: string;
  onChange: (id: string) => void;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          title={tab.hint}
          onClick={() => onChange(tab.id)}
          className={cn(
            'relative -mb-px border-b-2 px-3 py-2 text-xs font-medium transition-colors',
            active === tab.id
              ? 'border-accent text-text'
              : 'border-transparent text-muted hover:text-text',
          )}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span className="tabular ml-1.5 rounded bg-surface-2 px-1 py-0.5 text-[10px] text-muted">
              {tab.count}
            </span>
          )}
        </button>
      ))}
      {right && <div className="ml-auto pb-1">{right}</div>}
    </div>
  );
}
