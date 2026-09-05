/**
 * Watchlists.
 *
 * Persisted, so they survive a restart, and scoped to the current user so that
 * adding real accounts later does not change the shape of any of this.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { currentUserId, databaseRequired } from '@/lib/server/currentUser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const prisma = getPrisma();
  if (!prisma) return databaseRequired();

  const userId = await currentUserId();
  if (!userId) return databaseRequired();

  const watchlists = await prisma.watchlist.findMany({
    where: { userId },
    include: { symbols: { orderBy: { symbol: 'asc' } } },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({
    watchlists: watchlists.map((w) => ({
      id: w.id,
      name: w.name,
      symbols: w.symbols.map((s) => s.symbol),
      createdAt: w.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  const prisma = getPrisma();
  if (!prisma) return databaseRequired();

  const userId = await currentUserId();
  if (!userId) return databaseRequired();

  const body = await request.json().catch(() => null) as { name?: unknown; symbols?: unknown } | null;
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name) return NextResponse.json({ error: 'A name is required.' }, { status: 400 });

  const symbols = Array.isArray(body?.symbols)
    ? [...new Set(body.symbols.filter((s): s is string => typeof s === 'string')
        .map((s) => s.trim().toUpperCase()).filter(Boolean))]
    : [];

  const existing = await prisma.watchlist.findFirst({ where: { userId, name } });
  if (existing) {
    return NextResponse.json({ error: 'A watchlist with that name already exists.' }, { status: 409 });
  }

  const watchlist = await prisma.watchlist.create({
    data: { userId, name, symbols: { create: symbols.map((symbol) => ({ symbol })) } },
    include: { symbols: true },
  });

  return NextResponse.json({
    watchlist: {
      id: watchlist.id,
      name: watchlist.name,
      symbols: watchlist.symbols.map((s) => s.symbol),
    },
  }, { status: 201 });
}
