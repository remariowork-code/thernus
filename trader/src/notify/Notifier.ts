/**
 * Optional outbound notifications.
 *
 * The brief is unambiguous that notifications must never be load-bearing: if
 * Telegram is down, rate-limiting, or misconfigured, the engine keeps trading
 * to its rules. That requirement is enforced structurally rather than by
 * discipline — every method returns void, nothing here is ever awaited for a
 * result, and the implementations are forbidden from throwing. A notifier that
 * could reject would eventually reject inside an exit path, and an exit that
 * fails to run because a chat message failed is precisely the failure mode
 * worth designing out.
 */
export interface Notifier {
  readonly name: string;
  /** Fire and forget. Implementations must never throw or reject. */
  send(message: string): void;
  /** Flushes anything queued. Best-effort, bounded, never throws. */
  flush(): Promise<void>;
}

export class NullNotifier implements Notifier {
  readonly name = 'none';
  send(): void {}
  async flush(): Promise<void> {}
}

/** Writes notifications to the console. The default when Telegram is unset. */
export class ConsoleNotifier implements Notifier {
  readonly name = 'console';
  send(message: string): void {
    console.log(`[notify] ${message}`);
  }
  async flush(): Promise<void> {}
}

export class TelegramNotifier implements Notifier {
  readonly name = 'telegram';
  private readonly queue: string[] = [];
  private draining = false;
  private failures = 0;
  private disabledUntil = 0;

  constructor(
    private readonly token: string,
    private readonly chatId: string,
    /** After this many consecutive failures, back off rather than keep trying. */
    private readonly failureLimit = 5,
    private readonly backoffMs = 5 * 60_000,
  ) {}

  send(message: string): void {
    this.queue.push(message);
    // Deliberately not awaited: the caller carries on regardless.
    void this.drain();
  }

  private async drain(): Promise<void> {
    if (this.draining) return;
    this.draining = true;
    try {
      while (this.queue.length > 0) {
        if (Date.now() < this.disabledUntil) {
          // Backed off. Drop the backlog rather than let it grow without
          // bound — stale trade alerts are worse than no alerts.
          this.queue.length = 0;
          return;
        }
        const message = this.queue.shift();
        if (message === undefined) return;
        await this.post(message);
      }
    } finally {
      this.draining = false;
    }
  }

  private async post(message: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      try {
        const res = await fetch(`https://api.telegram.org/bot${this.token}/sendMessage`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ chat_id: this.chatId, text: message, parse_mode: 'HTML' }),
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        this.failures = 0;
      } finally {
        clearTimeout(timer);
      }
    } catch (error) {
      this.failures += 1;
      const detail = error instanceof Error ? error.message : String(error);
      console.warn(`[notify] telegram failed (${this.failures}/${this.failureLimit}): ${detail}`);
      if (this.failures >= this.failureLimit) {
        this.disabledUntil = Date.now() + this.backoffMs;
        this.failures = 0;
        console.warn(
          `[notify] telegram muted for ${Math.round(this.backoffMs / 60_000)} minutes. ` +
            'Trading is unaffected.',
        );
      }
    }
  }

  async flush(): Promise<void> {
    // Bounded: a shutdown must not hang on a dead endpoint.
    const deadline = Date.now() + 5_000;
    while (this.queue.length > 0 && Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    this.queue.length = 0;
  }
}

/**
 * Builds a notifier from the environment.
 *
 * Telegram is used only when both variables are present. Anything missing or
 * malformed falls back to the console with a warning, never an error.
 */
export function createNotifier(env: NodeJS.ProcessEnv = process.env): Notifier {
  const token = env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    if (token || chatId) {
      console.warn(
        '[notify] Telegram needs both TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID. ' +
          'Falling back to console output.',
      );
    }
    return new ConsoleNotifier();
  }
  return new TelegramNotifier(token, chatId);
}
