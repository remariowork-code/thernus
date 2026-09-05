'use client';

/**
 * Signals for a page, hydrated from REST and extended live.
 *
 * The SSE stream replays only its most recent signals on connect, which is the
 * right trade for the dashboard but leaves a sector or stock page empty when
 * the relevant signals happen to be older than that window. This fetches the
 * filtered history once, then merges the live feed on top.
 */

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { Signal } from '@shared/types';

export function useSignalHistory(
  liveSignals: Signal[],
  filter: (signal: Signal) => boolean,
  query?: { sector?: string; limit?: number },
): Signal[] {
  const { data } = useQuery<{ signals: Signal[] }>({
    queryKey: ['signals', query?.sector ?? 'all', query?.limit ?? 100],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query?.sector) params.set('sector', query.sector);
      params.set('limit', String(query?.limit ?? 100));
      const response = await fetch(`/api/signals?${params}`);
      if (!response.ok) return { signals: [] };
      return response.json();
    },
    // The live stream is the source of truth once connected; this only fills
    // in what happened before the page opened.
    staleTime: 60_000,
    retry: false,
  });

  return useMemo(() => {
    const merged = new Map<string, Signal>();
    for (const signal of data?.signals ?? []) merged.set(signal.id, signal);
    for (const signal of liveSignals) merged.set(signal.id, signal);

    return [...merged.values()]
      .filter(filter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data, liveSignals, filter]);
}
