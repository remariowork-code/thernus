import { notFound } from 'next/navigation';
import { StockDetail } from '@/components/stocks/StockDetail';
import { StatusBarShell } from '@/components/dashboard/StatusBarShell';
import { marketStore, universe } from '@/lib/server/market';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return { title: `${symbol.toUpperCase()} — MarketPulse` };
}

export default async function StockPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol: raw } = await params;
  const symbol = raw.toUpperCase();

  const { value } = await universe();
  const stock = value.stocks.find((s) => s.symbol === symbol);
  if (!stock) notFound();

  const sectors = value.sectors
    .filter((s) => s.constituents.some((c) => c.symbol === symbol))
    .map((s) => ({ id: s.id, name: s.name }));

  const initial = await marketStore().readMetrics(symbol).catch(() => null);

  return (
    <StatusBarShell>
      <StockDetail
        symbol={symbol}
        name={stock.name}
        exchange={stock.exchange}
        sectors={sectors}
        initial={initial}
      />
    </StatusBarShell>
  );
}
