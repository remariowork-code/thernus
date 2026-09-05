import { type NextRequest, NextResponse } from 'next/server';
import { marketStore } from '@/lib/server/market';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<Response> {
  const limit = Math.min(Number(request.nextUrl.searchParams.get('limit') ?? 50), 200);
  const sectorId = request.nextUrl.searchParams.get('sector');

  let news = await marketStore().readNews(limit);
  if (sectorId) news = news.filter((n) => n.sectorIds.includes(sectorId));

  return NextResponse.json({ news });
}
