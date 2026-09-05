import 'server-only';

/**
 * Current user resolution.
 *
 * Authentication is explicitly out of scope for the MVP, so every request
 * resolves to the seeded default trader. This is isolated in one function so
 * that adding real auth later is a change here and nowhere else — no route
 * handler reaches for a user id by any other means.
 */

import { getPrisma } from '@/lib/prisma';

export const DEFAULT_USER_EMAIL = 'trader@marketpulse.io';

export async function currentUserId(): Promise<string | null> {
  const prisma = getPrisma();
  if (!prisma) return null;

  const user = await prisma.user.upsert({
    where: { email: DEFAULT_USER_EMAIL },
    update: {},
    create: { email: DEFAULT_USER_EMAIL, name: 'Default Trader' },
  });
  return user.id;
}

/** Uniform response for endpoints that genuinely require persistence. */
export function databaseRequired(): Response {
  return Response.json(
    {
      error: 'This feature needs a database.',
      detail: 'Set DATABASE_URL, then run `npm run db:migrate && npm run db:seed`.',
    },
    { status: 503 },
  );
}
