'use client';

/**
 * Browser alert delivery.
 *
 * Signals are already deduplicated server-side by the state machine, so this
 * layer only decides whether the user wants to hear about a given signal, and
 * raises the notification.
 *
 * The delivered list is *derived* from the signal feed rather than accumulated
 * in state: the feed is already the source of truth, and mirroring it into
 * state inside an effect would mean two copies that can disagree. The effect
 * here does only what an effect is for — the imperative side effects (a chime,
 * an OS notification), and never a setState.
 */

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import type { Signal, SignalSeverity } from '@shared/types';
import {
  DEFAULT_PREFERENCES, getPermissionServerSnapshot, getPermissionSnapshot,
  getServerSnapshot, getSnapshot, notifyPermissionChanged, subscribe,
  subscribePermission, updatePreferences,
  type AlertPreferences, type PermissionState,
} from '@/lib/alertPreferences';

const SEVERITY_RANK: Record<SignalSeverity, number> = {
  INFO: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4,
};

const MAX_DELIVERED = 50;

export type { AlertPreferences };

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
  permission: PermissionState;
  requestPermission(): Promise<void>;
  /** Signals that met the alert criteria, newest first. */
  delivered: Signal[];
}

/**
 * @param latestSignal The most recent signal, used to fire side effects once.
 * @param signals      The full feed, from which the delivered list is derived.
 */
export function useAlerts(latestSignal: Signal | null, signals: Signal[] = []): AlertsApi {
  const preferences = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const permission = useSyncExternalStore(
    subscribePermission, getPermissionSnapshot, getPermissionServerSnapshot,
  );

  // Signals already announced, so a reconnect's hydration replay is silent.
  const announced = useRef(new Set<string>());

  const qualifies = useCallback((signal: Signal): boolean => {
    if (SEVERITY_RANK[signal.severity] < SEVERITY_RANK[preferences.minSeverity]) return false;
    if (preferences.sectorOnly && signal.symbol !== null) return false;
    return true;
  }, [preferences.minSeverity, preferences.sectorOnly]);

  const delivered = useMemo(
    () => (preferences.enabled ? signals.filter(qualifies).slice(0, MAX_DELIVERED) : []),
    [preferences.enabled, signals, qualifies],
  );

  const update = useCallback((patch: Partial<AlertPreferences>) => {
    updatePreferences(patch);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    notifyPermissionChanged();
    if (result === 'granted') updatePreferences({ enabled: true });
  }, []);

  // Side effects only: no state is written here.
  useEffect(() => {
    if (!latestSignal) return;
    if (announced.current.has(latestSignal.id)) return;
    announced.current.add(latestSignal.id);
    if (announced.current.size > 1_000) {
      announced.current = new Set([...announced.current].slice(-500));
    }

    if (!preferences.enabled || !qualifies(latestSignal)) return;

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
  }, [latestSignal, preferences.enabled, preferences.sound, qualifies]);

  return { preferences, update, permission, requestPermission, delivered };
}

export { DEFAULT_PREFERENCES };
