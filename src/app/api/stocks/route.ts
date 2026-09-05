/**
 * Stock hydration.
 *
 * `?sector=` scopes to one sector's constituents; `?symbols=A,B` fetches a
 * specific set (used by watchlists). Without either, returns everything with
 * live metrics.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { marketStore, universe } from '@/lib/server/market';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<Response> {
  const params = request.nextUrl.searchParams;
  const sectorId = params.get('sector');
  const symbolList = params.get('symbols');

  const store = marketStore();
  const { value: uni } = await universe();

  let symbols: string[];
  if (symbolList) {
    symbols = symbolList.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
  } else if (sectorId) {
    const sector = uni.sectors.find((s) => s.id === sectorId);
    if (!sector) return NextResponse.json({ error: 'Unknown sector' }, { status: 404 });
    symbols = sector.constituents.map((c) => c.symbol);
  } else {
    symbols = await store.listMetricSymbols();
  }

  const metrics = await store.readManyMetrics(symbols);
  const names = new Map(uni.stocks.map((s) => [s.symbol, s.name]));

  return NextResponse.json({
    stocks: metrics
      .map((m) => ({ ...m, name: names.get(m.symbol) ?? m.symbol }))
      .sort((a, b) => b.momentumScore - a.momentumScore),
  });
}
