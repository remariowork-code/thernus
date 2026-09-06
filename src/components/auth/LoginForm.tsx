'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? 'Could not sign in.');
        setPassword('');
        return;
      }

      // Only ever an internal path: `next` comes from the URL, so a full URL
      // there would be an open redirect.
      const next = params.get('next');
      router.replace(next && next.startsWith('/') && !next.startsWith('//') ? next : '/');
      router.refresh();
    } catch {
      setError('Network error. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-border bg-surface p-5">
      <label htmlFor="password" className="block text-xs font-medium text-muted">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mt-2 w-full rounded border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
      />

      {error && <p className="mt-3 text-xs text-down">{error}</p>}

      <button
        type="submit"
        disabled={pending || password.length === 0}
        className="mt-4 w-full rounded border border-border bg-surface-2 px-3 py-2 text-xs font-medium text-text transition-colors hover:border-accent disabled:opacity-40"
      >
        {pending ? 'Checking…' : 'Sign in'}
      </button>
    </form>
  );
}
