'use client';

/**
 * Intraday sector score chart.
 *
 * Seeded from the history endpoint, then extended live from the SSE feed. The
 * library is imported dynamically: it is ~50KB of canvas code that the
 * dashboard never needs, and only the sector page renders a chart.
 */

import { useEffect, useRef } from 'react';
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';

export interface ChartPoint { time: number; value: number }

export function IntradayChart({ sectorId, points }: { sectorId: string; points: ChartPoint[] }) {
  const container = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const series = useRef<ISeriesApi<'Area'> | null>(null);
  // Guards against out-of-order appends, which the library rejects outright.
  const lastTime = useRef(0);

  useEffect(() => {
    const element = container.current;
    if (!element) return;

    let disposed = false;

    void (async () => {
      const { AreaSeries, createChart } = await import('lightweight-charts');
      if (disposed || !container.current) return;

      const instance = createChart(element, {
        autoSize: true,
        layout: {
          background: { color: 'transparent' },
          textColor: '#8b90a0',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: 11,
        },
        grid: {
          vertLines: { color: 'rgba(255,255,255,0.04)' },
          horzLines: { color: 'rgba(255,255,255,0.04)' },
        },
        rightPriceScale: { borderColor: 'rgba(255,255,255,0.08)' },
        timeScale: { borderColor: 'rgba(255,255,255,0.08)', timeVisible: true, secondsVisible: false },
        crosshair: { mode: 1 },
        handleScale: { axisPressedMouseMove: false },
      });

      const area = instance.addSeries(AreaSeries, {
        lineColor: '#5aa9e6',
        lineWidth: 2,
        topColor: 'rgba(90,169,230,0.22)',
        bottomColor: 'rgba(90,169,230,0.01)',
        priceLineVisible: false,
        // The score is bounded 0-100 and integer-ish; two decimals is noise.
        priceFormat: { type: 'price', precision: 0, minMove: 1 },
      });

      chart.current = instance;
      series.current = area;

      // Seed from history so the chart is not empty on arrival.
      try {
        const response = await fetch(`/api/sectors/${sectorId}/history`);
        const data = await response.json() as { points: ChartPoint[] };
        if (disposed || data.points.length === 0) return;
        area.setData(data.points.map((p) => ({ time: p.time as UTCTimestamp, value: p.value })));
        lastTime.current = data.points[data.points.length - 1].time;
        instance.timeScale().fitContent();
      } catch {
        // No history is a normal cold start, not an error worth showing.
      }
    })();

    return () => {
      disposed = true;
      chart.current?.remove();
      chart.current = null;
      series.current = null;
    };
  }, [sectorId]);

  // Append live points as the feed delivers them.
  useEffect(() => {
    if (!series.current || points.length === 0) return;
    for (const point of points) {
      if (point.time <= lastTime.current) continue;
      series.current.update({ time: point.time as UTCTimestamp, value: point.value });
      lastTime.current = point.time;
    }
  }, [points]);

  return <div ref={container} className="h-[220px] w-full" />;
}
