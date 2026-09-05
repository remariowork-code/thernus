/**
 * Optional in-process worker.
 *
 * The production architecture keeps the market worker off Vercel entirely — a
 * persistent market-data WebSocket cannot live in a serverless function, which
 * is the whole reason the worker is a separate deployment.
 *
 * But a first run should show something. When EMBEDDED_WORKER is on (the
 * default in development with no REDIS_URL configured), the pipeline runs
 * inside the Next.js server process against the in-process Redis, so
 * `npm run dev` produces a live dashboard with nothing installed.
 *
 * This is a development affordance and says so on startup. It is off whenever
 * REDIS_URL is set, and off in production unless explicitly enabled.
 */

export async function register(): Promise<void> {
  // Node.js server runtime only — never Edge, never the browser.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const explicit = process.env.EMBEDDED_WORKER;
  const hasExternalRedis = Boolean(process.env.REDIS_URL ?? process.env.UPSTASH_REDIS_URL);
  const enabled = explicit === 'true'
    || (explicit !== 'false' && process.env.NODE_ENV !== 'production' && !hasExternalRedis);

  if (!enabled) return;

  // Guard against a double start across development hot reloads.
  const key = Symbol.for('marketpulse.embeddedWorker');
  const globalWithFlag = globalThis as typeof globalThis & { [key]?: boolean };
  if (globalWithFlag[key]) return;
  globalWithFlag[key] = true;

  try {
    // Dynamic: keeps every Node-only dependency out of the Edge bundle.
    const { startEmbeddedWorker } = await import('@worker/embedded');
    await startEmbeddedWorker();
  } catch (error) {
    // A failed embedded worker must never stop the web app from serving.
    console.error('[marketpulse] embedded worker failed to start:', error);
    globalWithFlag[key] = false;
  }
}
