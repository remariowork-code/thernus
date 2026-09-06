/**
 * Access gate.
 *
 * Everything is private unless APP_PASSWORD is unset, in which case the gate is
 * off entirely so local development needs no configuration. `/api/health`
 * reports which of those is in force, so an unprotected deployment is
 * detectable rather than silent.
 *
 * Pages redirect to the sign-in screen; API routes get a 401, because a
 * redirect to HTML is useless to fetch() and to the SSE stream.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

/** Reachable without a session: the sign-in screen and the endpoints it uses. */
const PUBLIC_PATHS = ['/login', '/api/auth/login', '/api/auth/logout'];

export async function middleware(request: NextRequest) {
  // No password configured: the gate does not exist.
  if (!process.env.APP_PASSWORD) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const signIn = request.nextUrl.clone();
  signIn.pathname = '/login';
  // Return the visitor where they were headed once they are in.
  signIn.searchParams.set('next', pathname + request.nextUrl.search);
  return NextResponse.redirect(signIn);
}

export const config = {
  // Everything except Next's own assets and the favicon. The API is included
  // deliberately: the data is the thing worth protecting.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
