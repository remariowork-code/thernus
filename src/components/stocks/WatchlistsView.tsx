'use client';

/**
 * Watchlists.
 *
 * Create, rename, delete, and edit symbols. Changes are reflected in the
 * scanner immediately because the live metrics come from the same SSE feed —
 * the watchlist only decides which of them to show.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useSSE } from '@/hooks/useSSE';
import { StockTable } from './StockTable';
import { Empty, Panel, cn } from '@/components/ui/primitives';

interface Watchlist { id: string; name: string; symbols: string[] }
interface WatchlistsPayload { watchlists: Watchlist[] }

export function WatchlistsView() {
  const feed = useSSE();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [symbolDraft, setSymbolDraft] = useState('');

  const { data, isError } = useQuery<WatchlistsPayload>({
    queryKey: ['watchlists'],
    queryFn: async () => {
      const response = await fetch('/api/watchlists');
      if (!response.ok) throw new Error('Watchlists need a database.');
      return response.json();
    },
    retry: false,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['watchlists'] });

  const create = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch('/api/watchlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) throw new Error((await response.json()).error ?? 'Could not create watchlist.');
      return response.json();
    },
    onSuccess: () => { setNewName(''); void invalidate(); },
  });

  const updateSymbols = useMutation({
    mutationFn: async ({ id, symbols }: { id: string; symbols: string[] }) => {
      const response = await fetch(`/api/watchlists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbols }),
      });
      if (!response.ok) throw new Error('Could not update watchlist.');
      return response.json();
    },
    onSuccess: () => void invalidate(),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/watchlists/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not delete watchlist.');
    },
    onSuccess: () => { setSelectedId(null); void invalidate(); },
  });

  const watchlists = data?.watchlists ?? [];
  const selected = watchlists.find((w) => w.id === selectedId) ?? watchlists[0] ?? null;

  const stocks = useMemo(() => {
    if (!selected) return [];
    const symbols = new Set(selected.symbols);
    return [...feed.metrics.values()].filter((m) => symbols.has(m.symbol));
  }, [feed.metrics, selected]);

  if (isError) {
    return (
      <main className="mx-auto max-w-[1200px] px-5 py-5">
        <Panel title="Watchlists">
          <p className="text-sm text-faint">
            Watchlists are persisted per user, so they need a database. Set{' '}
            <code className="font-mono text-muted">DATABASE_URL</code>, then run{' '}
            <code className="font-mono text-muted">npm run db:migrate &amp;&amp; npm run db:seed</code>.
          </p>
        </Panel>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1400px] space-y-4 px-5 py-5">
      <h1 className="text-xl font-semibold text-text">Watchlists</h1>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Panel title="Lists" dense>
          <ul className="divide-y divide-border-soft/60">
            {watchlists.map((watchlist) => (
              <li key={watchlist.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(watchlist.id)}
                  className={cn(
                    'flex w-full items-baseline justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors',
                    selected?.id === watchlist.id ? 'bg-surface-2 text-text' : 'text-muted hover:text-text',
                  )}
                >
                  <span className="truncate">{watchlist.name}</span>
                  <span className="tabular shrink-0 text-xs text-faint">{watchlist.symbols.length}</span>
                </button>
              </li>
            ))}
            {watchlists.length === 0 && <li><Empty>No watchlists yet.</Empty></li>}
          </ul>

          <form
            className="border-t border-border-soft p-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (newName.trim()) create.mutate(newName.trim());
            }}
          >
            <input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="New watchlist name"
              aria-label="New watchlist name"
              className="w-full rounded border border-border bg-bg px-2 py-1.5 text-sm text-text placeholder:text-faint focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newName.trim() || create.isPending}
              className="mt-2 w-full rounded border border-border px-2 py-1.5 text-xs text-muted transition-colors hover:text-text disabled:opacity-40"
            >
              {create.isPending ? 'Creating…' : 'Create'}
            </button>
            {create.isError && (
              <p className="mt-2 text-xs text-down">{(create.error as Error).message}</p>
            )}
          </form>
        </Panel>

        <div className="space-y-4">
          {selected ? (
            <>
              <Panel
                title={selected.name}
                action={
                  <button
                    type="button"
                    onClick={() => { if (confirm(`Delete "${selected.name}"?`)) remove.mutate(selected.id); }}
                    className="text-[10px] uppercase tracking-wider text-faint hover:text-down"
                  >
                    Delete
                  </button>
                }
              >
                <div className="flex flex-wrap gap-1.5">
                  {selected.symbols.map((symbol) => (
                    <span key={symbol} className="inline-flex items-center gap-1 rounded border border-border bg-surface-2 px-2 py-1 text-xs">
                      {symbol}
                      <button
                        type="button"
                        aria-label={`Remove ${symbol}`}
                        onClick={() => updateSymbols.mutate({
                          id: selected.id,
                          symbols: selected.symbols.filter((s) => s !== symbol),
                        })}
                        className="text-faint hover:text-down"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {selected.symbols.length === 0 && <span className="text-xs text-faint">No symbols yet.</span>}
                </div>

                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const additions = symbolDraft.split(/[\s,]+/)
                      .map((s) => s.trim().toUpperCase()).filter(Boolean);
                    if (additions.length === 0) return;
                    updateSymbols.mutate({
                      id: selected.id,
                      symbols: [...new Set([...selected.symbols, ...additions])],
                    });
                    setSymbolDraft('');
                  }}
                >
                  <input
                    value={symbolDraft}
                    onChange={(event) => setSymbolDraft(event.target.value)}
                    placeholder="Add symbols — MU, NVDA, WDC"
                    aria-label="Add symbols"
                    className="flex-1 rounded border border-border bg-bg px-2 py-1.5 text-sm text-text placeholder:text-faint focus:border-accent focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded border border-border px-3 py-1.5 text-xs text-muted transition-colors hover:text-text"
                  >
                    Add
                  </button>
                </form>
              </Panel>

              <Panel title="Live metrics" dense>
                <StockTable
                  stocks={stocks}
                  emptyMessage="None of these symbols have traded this session."
                />
              </Panel>
            </>
          ) : (
            <Panel><Empty>Create a watchlist to get started.</Empty></Panel>
          )}
        </div>
      </div>
    </main>
  );
}
