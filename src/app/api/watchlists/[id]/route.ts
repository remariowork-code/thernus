import { type NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { currentUserId, databaseRequired } from '@/lib/server/currentUser';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

/** Rename, or replace the symbol set wholesale. */
export async function PATCH(request: NextRequest, { params }: Params): Promise<Response> {
  const prisma = getPrisma();
  if (!prisma) return databaseRequired();

  const userId = await currentUserId();
  if (!userId) return databaseRequired();

  const { id } = await params;
  // Scoped by userId as well as id: an id alone must never be enough to reach
  // another user's row once real accounts exist.
  const watchlist = await prisma.watchlist.findFirst({ where: { id, userId } });
  if (!watchlist) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json().catch(() => null) as { name?: unknown; symbols?: unknown } | null;

  if (typeof body?.name === 'string' && body.name.trim()) {
    await prisma.watchlist.update({ where: { id }, data: { name: body.name.trim() } });
  }

  if (Array.isArray(body?.symbols)) {
    const symbols = [...new Set(body.symbols
      .filter((s): s is string => typeof s === 'string')
      .map((s) => s.trim().toUpperCase()).filter(Boolean))];

    await prisma.$transaction([
      prisma.watchlistSymbol.deleteMany({ where: { watchlistId: id } }),
      prisma.watchlistSymbol.createMany({
        data: symbols.map((symbol) => ({ watchlistId: id, symbol })),
      }),
    ]);
  }

  const updated = await prisma.watchlist.findUnique({
    where: { id },
    include: { symbols: { orderBy: { symbol: 'asc' } } },
  });

  return NextResponse.json({
    watchlist: {
      id: updated!.id,
      name: updated!.name,
      symbols: updated!.symbols.map((s) => s.symbol),
    },
  });
}

export async function DELETE(_request: NextRequest, { params }: Params): Promise<Response> {
  const prisma = getPrisma();
  if (!prisma) return databaseRequired();

  const userId = await currentUserId();
  if (!userId) return databaseRequired();

  const { id } = await params;
  const { count } = await prisma.watchlist.deleteMany({ where: { id, userId } });
  if (count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return new Response(null, { status: 204 });
}
