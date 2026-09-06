import { type NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS, authConfigured, createSessionToken, passwordMatches } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Slows down guessing without needing any shared state to rate limit against. */
const FAILURE_DELAY_MS = 750;

export async function POST(request: NextRequest): Promise<Response> {
  if (!authConfigured()) {
    return NextResponse.json({ error: 'No password is configured.' }, { status: 400 });
  }

  const body = await request.json().catch(() => null) as { password?: unknown } | null;
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!await passwordMatches(password)) {
    await new Promise((resolve) => setTimeout(resolve, FAILURE_DELAY_MS));
    // Deliberately vague: distinguishing "wrong" from "empty" helps nobody but
    // someone guessing.
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    // Not readable by script, not sent cross-site, HTTPS-only in production.
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
