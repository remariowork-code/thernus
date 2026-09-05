'use client';

/**
 * EventSource lifecycle for the live market feed.
 *
 * EventSource reconnects on its own, but with no backoff and no ceiling, which
 * turns a worker restart into a request storm. This closes the socket on error
 * and reconnects with exponential backoff plus jitter instead.
 *
 * State is held in refs and flushed on an animation frame: a busy open can
 * deliver hundreds of metric updates a second, and calling setState on each
 * one would spend the whole frame budget in React rather than painting.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  MarketSession, NewsHeadline, SectorMetrics, Signal, StockMetrics,
} from '@shared/types';

export type ConnectionState = 'connecting' | 'open' | 'reconnecting' | 'closed';

const INITIAL_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;
const BACKOFF_FACTOR = 2;
const MAX_SIGNALS = 200;
const MAX_NEWS = 100;

export interface MarketFeed {
  connection: ConnectionState;
  reconnects: number;
  session: MarketSession | null;
  sectors: SectorMetrics[];
  metrics: Map<string, StockMetrics>;
  signals: Signal[];
  news: NewsHeadline[];
  /** The most recent signal, so callers can react without diffing the list. */
  latestSignal: Signal | null;
}

export function useSSE(url = '/api/stream'): MarketFeed {
  const [feed, setFeed] = useState<MarketFeed>({
    connection: 'connecting',
    reconnects: 0,
    session: null,
    sectors: [],
    metrics: new Map(),
    signals: [],
    news: [],
    latestSignal: null,
  });

  // Mutable mirror written by the event handlers; React state is a snapshot.
  const buffer = useRef({
    sectors: [] as SectorMetrics[],
    metrics: new Map<string, StockMetrics>(),
    signals: [] as Signal[],
    news: [] as NewsHeadline[],
    session: null as MarketSession | null,
    latestSignal: null as Signal | null,
    dirty: false,
  });

  const frame = useRef<number | null>(null);

  const scheduleFlush = useCallback(() => {
    if (frame.current !== null) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      if (!buffer.current.dirty) return;
      buffer.current.dirty = false;
      setFeed((previous) => ({
        ...previous,
        session: buffer.current.session,
        sectors: buffer.current.sectors,
        // A fresh Map each flush: React must see a new reference to re-render.
        metrics: new Map(buffer.current.metrics),
        signals: buffer.current.signals,
        news: buffer.current.news,
        latestSignal: buffer.current.latestSignal,
      }));
    });
  }, []);

  useEffect(() => {
    let source: EventSource | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let delay = INITIAL_RETRY_MS;
    let mounted = true;

    const setConnection = (connection: ConnectionState) => {
      if (mounted) setFeed((previous) => ({ ...previous, connection }));
    };

    const connect = () => {
      if (!mounted) return;
      source = new EventSource(url);

      source.onopen = () => {
        if (!mounted) return;
        delay = INITIAL_RETRY_MS;
        setConnection('open');
      };

      source.addEventListener('session', (event) => {
        const data = JSON.parse((event as MessageEvent).data) as { session: MarketSession };
        buffer.current.session = data.session;
        buffer.current.dirty = true;
        scheduleFlush();
      });

      source.addEventListener('sectors', (event) => {
        buffer.current.sectors = JSON.parse((event as MessageEvent).data) as SectorMetrics[];
        buffer.current.dirty = true;
        scheduleFlush();
      });

      source.addEventListener('metrics', (event) => {
        const batch = JSON.parse((event as MessageEvent).data) as StockMetrics[];
        for (const metric of batch) buffer.current.metrics.set(metric.symbol, metric);
        buffer.current.dirty = true;
        scheduleFlush();
      });

      source.addEventListener('signal', (event) => {
        const signal = JSON.parse((event as MessageEvent).data) as Signal;
        // Hydration replays recent signals, so drop anything already held.
        if (buffer.current.signals.some((s) => s.id === signal.id)) return;
        buffer.current.signals = [signal, ...buffer.current.signals].slice(0, MAX_SIGNALS);
        buffer.current.latestSignal = signal;
        buffer.current.dirty = true;
        scheduleFlush();
      });

      source.addEventListener('news', (event) => {
        const item = JSON.parse((event as MessageEvent).data) as NewsHeadline;
        if (buffer.current.news.some((n) => n.id === item.id)) return;
        buffer.current.news = [item, ...buffer.current.news].slice(0, MAX_NEWS);
        buffer.current.dirty = true;
        scheduleFlush();
      });

      source.onerror = () => {
        if (!mounted) return;
        // Close explicitly: EventSource's own retry has no backoff.
        source?.close();
        source = null;
        setConnection('reconnecting');

        const jitter = Math.random() * 500;
        const wait = delay + jitter;
        delay = Math.min(delay * BACKOFF_FACTOR, MAX_RETRY_MS);

        retryTimer = setTimeout(() => {
          if (!mounted) return;
          setFeed((previous) => ({ ...previous, reconnects: previous.reconnects + 1 }));
          connect();
        }, wait);
      };
    };

    connect();

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      source?.close();
    };
  }, [url, scheduleFlush]);

  return feed;
}
