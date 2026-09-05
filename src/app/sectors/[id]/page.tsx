import { notFound } from 'next/navigation';
import { SectorDetail } from '@/components/sectors/SectorDetail';
import { StatusBarShell } from '@/components/dashboard/StatusBarShell';
import { marketStore, universe } from '@/lib/server/market';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { value } = await universe();
  const sector = value.sectors.find((s) => s.id === id);
  return { title: sector ? `${sector.name} — MarketPulse` : 'Sector — MarketPulse' };
}

export default async function SectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { value } = await universe();
  const sector = value.sectors.find((s) => s.id === id);
  if (!sector) notFound();

  const initial = await marketStore().readSector(id).catch(() => null);

  return (
    <StatusBarShell>
      <SectorDetail
        sectorId={sector.id}
        sectorName={sector.name}
        constituents={sector.constituents.map((c) => c.symbol)}
        initial={initial}
      />
    </StatusBarShell>
  );
}
