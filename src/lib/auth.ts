/**
 * Session cookie signing.
 *
 * Runs in Edge middleware as well as Node route handlers, so it uses Web
 * Crypto rather than `node:crypto` — the two runtimes share this module and
 * only Web Crypto exists in both.
 *
 * The cookie carries an expiry and an HMAC over it. There is no session store:
 * a single-user gate does not need one, and a stateless cookie keeps the
 * middleware free of I/O on every request.
 */

export const SESSION_COOKIE = 'mp_session';
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days

/** Auth is off when no password is configured, so local development just works. */
export function authConfigured(): boolean {
  return Boolean(process.env.APP_PASSWORD);
}

/**
 * The HMAC key. Falls back to deriving from the password so a single
 * environment variable is enough to get running; set AUTH_SECRET separately to
 * rotate sessions without changing the password.
 */
function signingSecret(): string {
  return process.env.AUTH_SECRET || `derived:${process.env.APP_PASSWORD ?? ''}`;
}

async function hmac(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Length-independent comparison, so a mismatch reveals nothing by timing. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(now = Date.now()): Promise<string> {
  const expiresAt = now + SESSION_MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${await hmac(payload, signingSecret())}`;
}

export async function verifySessionToken(
  token: string | undefined,
  now = Date.now(),
): Promise<boolean> {
  if (!token) return false;

  const separator = token.lastIndexOf('.');
  if (separator <= 0) return false;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);

  // Signature first: an expired-but-authentic cookie and a forged one should
  // both fail, and checking the signature first keeps the work uniform.
  const expected = await hmac(payload, signingSecret());
  if (!constantTimeEqual(signature, expected)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > now;
}

/**
 * Compare a submitted password against the configured one.
 *
 * Both sides are hashed before comparison so the check is constant time with
 * respect to the secret regardless of the submitted length.
 */
export async function passwordMatches(submitted: string): Promise<boolean> {
  const configured = process.env.APP_PASSWORD;
  if (!configured) return false;

  const secret = signingSecret();
  const [a, b] = await Promise.all([hmac(submitted, secret), hmac(configured, secret)]);
  return constantTimeEqual(a, b);
}
