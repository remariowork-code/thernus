/**
 * Structured logging. One JSON object per line, so Railway/Fly log drains and
 * anything downstream can parse it without a regex.
 */

type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40, fatal: 50 };
const threshold = LEVELS[(process.env.LOG_LEVEL as Level) ?? 'info'] ?? LEVELS.info;

function emit(level: Level, message: string, context?: Record<string, unknown>): void {
  if (LEVELS[level] < threshold) return;
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    service: 'market-worker',
    message,
    ...context,
  });
  if (LEVELS[level] >= LEVELS.error) process.stderr.write(`${line}\n`);
  else process.stdout.write(`${line}\n`);
}

/** Errors serialise to `{}` under JSON.stringify; unwrap them explicitly. */
function normaliseError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return { error: { name: error.name, message: error.message, stack: error.stack } };
  }
  return { error: String(error) };
}

export const Logger = {
  debug: (message: string, context?: Record<string, unknown>) => emit('debug', message, context),
  info: (message: string, context?: Record<string, unknown>) => emit('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => emit('warn', message, context),
  error: (message: string, error?: unknown, context?: Record<string, unknown>) =>
    emit('error', message, { ...context, ...(error ? normaliseError(error) : {}) }),
  fatal: (message: string, error?: unknown, context?: Record<string, unknown>) =>
    emit('fatal', message, { ...context, ...(error ? normaliseError(error) : {}) }),
};
