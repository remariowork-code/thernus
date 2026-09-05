'use client';

/**
 * Alert preferences, as an external store.
 *
 * These live in localStorage rather than the database: they are per-device by
 * nature (this browser's notification permission, this machine's speakers) and
 * must work before any database is configured.
 *
 * Exposed through the `useSyncExternalStore` contract rather than read into
 * state inside an effect. That is what the API is for — it gives a stable
 * server snapshot, so the first client render matches the server's and there
 * is no hydration mismatch and no cascading render.
 */

import type { SignalSeverity } from '@shared/types';

const STORAGE_KEY = 'marketpulse.alerts.v1';

export interface AlertPreferences {
  enabled: boolean;
  sound: boolean;
  /** Only signals at or above this severity are delivered. */
  minSeverity: SignalSeverity;
  /** Suppress stock-level noise and alert on sector events only. */
  sectorOnly: boolean;
}

export const DEFAULT_PREFERENCES: AlertPreferences = {
  enabled: false,
  sound: true,
  minSeverity: 'MEDIUM',
  sectorOnly: true,
};

const listeners = new Set<() => void>();

// Cached so getSnapshot returns a stable reference; useSyncExternalStore
// re-renders in a loop if it sees a new object every call.
let snapshot: AlertPreferences = DEFAULT_PREFERENCES;
let hydrated = false;

function read(): AlertPreferences {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) } : DEFAULT_PREFERENCES;
  } catch {
    // Private browsing, or storage disabled entirely.
    return DEFAULT_PREFERENCES;
  }
}

export function subscribe(listener: () => void): () => void {
  // First subscription hydrates from storage and notifies, which happens after
  // commit and so cannot cause a hydration mismatch.
  if (!hydrated) {
    hydrated = true;
    const stored = read();
    if (JSON.stringify(stored) !== JSON.stringify(snapshot)) {
      snapshot = stored;
      queueMicrotask(() => listeners.forEach((l) => l()));
    }
  }

  listeners.add(listener);

  // Another tab changing preferences should be reflected here.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    snapshot = read();
    listeners.forEach((l) => l());
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function getSnapshot(): AlertPreferences {
  return snapshot;
}

/** The server has no storage; it always renders the defaults. */
export function getServerSnapshot(): AlertPreferences {
  return DEFAULT_PREFERENCES;
}

export function updatePreferences(patch: Partial<AlertPreferences>): void {
  snapshot = { ...snapshot, ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Non-persistent is still usable for this session.
  }
  listeners.forEach((listener) => listener());
}

// ---------------------------------------------------------------------------
// Notification permission
// ---------------------------------------------------------------------------

export type PermissionState = NotificationPermission | 'unsupported';

const permissionListeners = new Set<() => void>();
let permissionSnapshot: PermissionState = 'unsupported';

function readPermission(): PermissionState {
  return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
}

/**
 * Permission changes only in response to a user gesture, so there is nothing
 * to poll; `notifyPermissionChanged` is called after a request resolves.
 */
export function subscribePermission(listener: () => void): () => void {
  permissionSnapshot = readPermission();
  permissionListeners.add(listener);
  return () => permissionListeners.delete(listener);
}

export function getPermissionSnapshot(): PermissionState {
  return permissionSnapshot;
}

/** The server has no Notification API, so it always renders "unsupported". */
export function getPermissionServerSnapshot(): PermissionState {
  return 'unsupported';
}

export function notifyPermissionChanged(): void {
  permissionSnapshot = readPermission();
  permissionListeners.forEach((listener) => listener());
}
