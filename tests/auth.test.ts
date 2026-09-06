import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  authConfigured, createSessionToken, passwordMatches, verifySessionToken,
} from '@/lib/auth';

const saved = { ...process.env };
beforeEach(() => {
  process.env.APP_PASSWORD = 'correct horse battery staple';
  process.env.AUTH_SECRET = 'test-signing-secret';
});
afterEach(() => { process.env = { ...saved }; });

describe('password check', () => {
  it('accepts the configured password and rejects everything else', async () => {
    expect(await passwordMatches('correct horse battery staple')).toBe(true);
    expect(await passwordMatches('wrong')).toBe(false);
    expect(await passwordMatches('')).toBe(false);
    // Near-misses must not pass.
    expect(await passwordMatches('correct horse battery stapl')).toBe(false);
    expect(await passwordMatches('Correct horse battery staple')).toBe(false);
  });

  it('rejects everything when no password is configured', async () => {
    delete process.env.APP_PASSWORD;
    expect(authConfigured()).toBe(false);
    expect(await passwordMatches('')).toBe(false);
    expect(await passwordMatches('anything')).toBe(false);
  });
});

describe('session token', () => {
  it('round-trips a freshly issued token', async () => {
    expect(await verifySessionToken(await createSessionToken())).toBe(true);
  });

  it('rejects a tampered signature', async () => {
    const token = await createSessionToken();
    const [payload, signature] = token.split('.');
    const flipped = signature.slice(0, -1) + (signature.endsWith('a') ? 'b' : 'a');
    expect(await verifySessionToken(`${payload}.${flipped}`)).toBe(false);
  });

  it('rejects a token whose expiry was extended without re-signing', async () => {
    const token = await createSessionToken();
    const signature = token.split('.')[1];
    const farFuture = String(Date.now() + 10 * 365 * 24 * 3600 * 1000);
    expect(await verifySessionToken(`${farFuture}.${signature}`)).toBe(false);
  });

  it('rejects an expired token even though the signature is authentic', async () => {
    const issued = Date.now() - 31 * 24 * 3600 * 1000;
    const token = await createSessionToken(issued);
    expect(await verifySessionToken(token, issued)).toBe(true);
    expect(await verifySessionToken(token)).toBe(false);
  });

  it('rejects malformed and missing tokens', async () => {
    for (const bad of [undefined, '', 'nodot', '.', '.sig', 'abc.', 'a.b.c']) {
      expect(await verifySessionToken(bad as string | undefined)).toBe(false);
    }
  });

  it('does not accept a token signed with a different secret', async () => {
    const token = await createSessionToken();
    process.env.AUTH_SECRET = 'rotated-secret';
    // Rotating the secret invalidates every outstanding session.
    expect(await verifySessionToken(token)).toBe(false);
  });

  it('derives a key from the password when AUTH_SECRET is absent', async () => {
    delete process.env.AUTH_SECRET;
    const token = await createSessionToken();
    expect(await verifySessionToken(token)).toBe(true);

    // Changing the password must also invalidate sessions.
    process.env.APP_PASSWORD = 'a different password';
    expect(await verifySessionToken(token)).toBe(false);
  });
});
