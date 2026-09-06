/**
 * Redis connectivity check.
 *
 * Confirms the URL resolves, authenticates and answers, and reports what the
 * worker has written. Prints the host but never the credential.
 *
 *   npm run check:redis
 */
import { readFileSync } from 'node:fs';
import Redis from 'ioredis';

let fileEnv = {};
try {
  fileEnv = Object.fromEntries(
    readFileSync(new URL('../.env.worker', import.meta.url), 'utf8')
      .split('\n').map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
  );
} catch { /* environment may carry the values instead */ }

const url = process.env.REDIS_URL || fileEnv.REDIS_URL;
if (!url) {
  console.error('REDIS_URL is not set (checked the environment and .env.worker)');
  process.exit(1);
}

let host;
try {
  host = new URL(url).host;
} catch {
  console.error('REDIS_URL is not a parseable URL');
  process.exit(1);
}

console.log(`\nhost:      ${host}`);
console.log(`encrypted: ${url.startsWith('rediss://') ? 'yes (TLS)' : 'NO — redis:// sends the password in cleartext'}`);

const redis = new Redis(url, {
  maxRetriesPerRequest: 2,
  retryStrategy: (t) => (t > 2 ? null : 500),
  connectTimeout: 10_000,
});

try {
  const started = Date.now();
  const pong = await redis.ping();
  console.log(`ping:      ${pong} (${Date.now() - started}ms)`);

  // What the worker has actually written, so a shared-Redis mismatch shows up.
  const provider = await redis.hgetall('market:provider');
  console.log(`\nworker last reported: ${
    provider.providerName
      ? `${provider.providerName} (simulated=${provider.simulated}), ${
          Math.round((Date.now() - Number(provider.startedAt)) / 1000)}s ago`
      : 'nothing — no worker has written to this instance'
  }`);

  let cursor = '0';
  const counts = {};
  do {
    const [next, batch] = await redis.scan(cursor, 'MATCH', '*', 'COUNT', 500);
    cursor = next;
    for (const key of batch) {
      const prefix = key.split(':')[0];
      counts[prefix] = (counts[prefix] ?? 0) + 1;
    }
  } while (cursor !== '0');

  console.log('keys by prefix:      ', Object.keys(counts).length ? counts : '(empty)');
  console.log();
} catch (error) {
  console.error(`\nFAILED: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
} finally {
  redis.disconnect();
}
