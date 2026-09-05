import { StatusBarShell } from '@/components/dashboard/StatusBarShell';
import { AlertsView } from '@/components/alerts/AlertsView';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Alerts — MarketPulse' };

export default function AlertsPage() {
  return (
    <StatusBarShell>
      <AlertsView />
    </StatusBarShell>
  );
}
