import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Sign in — MarketPulse' };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-sm font-bold uppercase tracking-[0.18em] text-text">MarketPulse</h1>
          <p className="mt-1 text-xs uppercase tracking-wider text-faint">Sector-first scanner</p>
        </div>
        {/* useSearchParams needs a boundary during prerender. */}
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
