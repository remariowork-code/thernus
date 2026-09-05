import { StatusBarShell } from '@/components/dashboard/StatusBarShell';
import { WatchlistsView } from '@/components/stocks/WatchlistsView';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Watchlists — MarketPulse' };

export default function WatchlistsPage() {
  return (
    <StatusBarShell>
      <WatchlistsView />
    </StatusBarShell>
  );
}
