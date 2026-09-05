'use client';

/**
 * Browser alert delivery.
 *
 * Signals are already deduplicated server-side by the state machine, so this
 * layer only decides *whether the user wants to hear about it* and raises the
 * notification. It deliberately keeps its own seen-set as well: a reconnect
 * replays recent signals for hydration, and those must not re-fire as alerts.
 *
 * Preferences live in localStorage rather than the database — they are
 * per-device by nature (this browser's notification permission, this machine's
 * speakers) and must work before any database is configured.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Signal, SignalSeverity } from '@shared/types';

const STORAGE_KEY = 'marketpulse.alerts.v1';
const SEVERITY_RANK: Record<SignalSeverity, number> = {
  INFO: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4,
};

export interface AlertPreferences {
  enabled: boolean;
  sound: boolean;
  /** Only signals at or above this severity are delivered. */
  minSeverity: SignalSeverity;
  /** Suppress stock-level noise and alert on sector events only. */
  sectorOnly: boolean;
}

const DEFAULTS: AlertPreferences = {
  enabled: false,
  sound: true,
  minSeverity: 'MEDIUM',
  sectorOnly: true,
};

function loadPreferences(): AlertPreferences {
  if (typeof window === 'undefined') return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    // Private browsing, or storage disabled entirely.
    return DEFAULTS;
  }
}

/** A short two-tone chime, synthesised so there is no asset to ship or 404. */
function playChime(): void {
  try {
    const AudioContextClass = window.AudioContext
      ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const tone = (frequency: number, startAt: number, duration: number) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, startAt);
      gain.gain.setValueAtTime(0.08, startAt);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + duration);
    };

    const now = context.currentTime;
    tone(880, now, 0.14);
    tone(1174.66, now + 0.16, 0.22);
    // Release the hardware once the chime has finished.
    setTimeout(() => void context.close(), 800);
  } catch {
    // Autoplay policy blocked it; nothing worth surfacing to the user.
  }
}

export interface AlertsApi {
  preferences: AlertPreferences;
  update(patch: Partial<AlertPreferences>): void;
  permission: NotificationPermission | 'unsupported';
  requestPermission(): Promise<void>;
  /** Alerts raised this session, newest first. */
  delivered: Signal[];
}

export function useAlerts(latestSignal: Signal | null): AlertsApi {
  const [preferences, setPreferences] = useState<AlertPreferences>(DEFAULTS);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [delivered, setDelivered] = useState<Signal[]>([]);
  const seen = useRef(new Set<string>());

  // Read stored preferences after mount, so server and client first paint match.
  useEffect(() => {
    setPreferences(loadPreferences());
    setPermission(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
  }, []);

  const update = useCallback((patch: Partial<AlertPreferences>) => {
    setPreferences((previous) => {
      const next = { ...previous, ...patch };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Non-persistent is still usable for this session.
      }
      return next;
    });
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted') update({ enabled: true });
  }, [update]);

  useEffect(() => {
    if (!latestSignal) return;

    // Hydration replays recent signals; only ever alert once per signal id.
    if (seen.current.has(latestSignal.id)) return;
    seen.current.add(latestSignal.id);
    if (seen.current.size > 1_000) {
      seen.current = new Set([...seen.current].slice(-500));
    }

    if (!preferences.enabled) return;
    if (SEVERITY_RANK[latestSignal.severity] < SEVERITY_RANK[preferences.minSeverity]) return;
    if (preferences.sectorOnly && latestSignal.symbol !== null) return;

    setDelivered((previous) => [latestSignal, ...previous].slice(0, 50));

    if (preferences.sound) playChime();

    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(latestSignal.sectorName ?? latestSignal.symbol ?? 'MarketPulse', {
          body: latestSignal.headline,
          // Collapses repeated alerts for one sector into a single OS toast.
          tag: latestSignal.sectorId ?? latestSignal.symbol ?? latestSignal.id,
        });
      } catch {
        // Some browsers reject constructed notifications outside a worker.
      }
    }
  }, [latestSignal, preferences]);

  return { preferences, update, permission, requestPermission, delivered };
}
