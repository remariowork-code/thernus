/**
 * Server-Sent Events gateway.
 *
 * Redis pub/sub in, SSE out. This is the only thing standing between the
 * worker and the browser, and it deliberately does no computation — if a
 * number needs deriving, the worker derives it.
 *
 * Runs on the Node runtime, not Edge: it holds a Redis subscriber connection,
 * which the Edge runtime cannot open.
 */

import type { NextRequest } from 'next/server';
import { createMarketStore, createRedisClient } from '@shared/redis';
import { getEffectiveSession } from '@shared/market/session';
import { marketStore } from '@/lib/server/market';
import type { MarketEvent } from '@shared/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Proxies buffer without this; a buffered SSE stream is a broken SSE stream. */
const SSE_HEADERS = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Cache-Control': 'no-cache, no-transform',
  Connection: 'keep-alive',
  'X-Accel-Buffering': 'no',
} as const;

const HEARTBEAT_MS = 15_000;

export async function GET(request: NextRequest): Promise<Response> {
  const encoder = new TextEncoder();

  // A dedicated connection: a Redis client in subscriber mode cannot serve
  // ordinary commands, so this must not be the shared store's client.
  const subscriberClient = createRedisClient();
  const subscriber = createMarketStore(subscriberClient);

  let heartbeat: ReturnType<typeof setInterval> | null = null;
  let closed = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown): void => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {
          // The client vanished between the check and the write.
        }
      };

      const cleanup = async (): Promise<void> => {
        if (closed) return;
        closed = true;
        if (heartbeat) clearInterval(heartbeat);
        await subscriber.unsubscribe().catch(() => {});
        await subscriberClient.quit().catch(() => {});
        try { controller.close(); } catch { /* already closed */ }
      };

      // Hydrate immediately so a reconnecting client is never staring at an
      // empty table while it waits for the next worker tick.
      try {
        const store = marketStore();
        const [sectors, signals, session] = await Promise.all([
          store.readAllSectors(),
          store.readSignals(50),
          store.readSession(),
        ]);
        send('session', { session: session ?? getEffectiveSession(), asOf: new Date().toISOString() });
        if (sectors.length) send('sectors', sectors);
        for (const signal of signals.slice(0, 20).reverse()) send('signal', signal);
      } catch {
        // Hydration is best-effort; the live stream still matters.
      }

      await subscriber.subscribe((event: MarketEvent) => {
        switch (event.type) {
          case 'METRICS': return send('metrics', event.data);
          case 'SECTORS': return send('sectors', event.data);
          case 'SIGNAL': return send('signal', event.data);
          case 'NEWS': return send('news', event.data);
          case 'SESSION': return send('session', event.data);
          default: return;
        }
      });

      // Comment frames keep intermediaries from reaping an idle connection.
      heartbeat = setInterval(() => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
        } catch {
          void cleanup();
        }
      }, HEARTBEAT_MS);

      request.signal.addEventListener('abort', () => { void cleanup(); });
    },

    async cancel() {
      closed = true;
      if (heartbeat) clearInterval(heartbeat);
      await subscriber.unsubscribe().catch(() => {});
      await subscriberClient.quit().catch(() => {});
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
