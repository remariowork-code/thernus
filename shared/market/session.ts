/**
 * Market session awareness.
 *
 * Thresholds must be session-aware: a 1% premarket move on 40k shares is not
 * the same event as a 1% move at 10:15 on three times normal volume, and the
 * scanner must not pretend otherwise.
 */

import type { MarketSession } from '../types';

/**
 * NYSE/Nasdaq full closures. Half-days (early 13:00 close) are handled
 * separately since the tape is live, just short.
 */
const MARKET_HOLIDAYS = new Set([
  // 2026
  '2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03', '2026-05-25',
  '2026-06-19', '2026-07-03', '2026-09-07', '2026-11-26', '2026-12-25',
  // 2027
  '2027-01-01', '2027-01-18', '2027-02-15', '2027-03-26', '2027-05-31',
  '2027-06-18', '2027-07-05', '2027-09-06', '2027-11-25', '2027-12-24',
]);

/** Sessions closing at 13:00 EST. */
const HALF_DAYS = new Set([
  '2026-11-27', '2026-12-24',
  '2027-11-26',
]);

export interface SessionParts {
  /** YYYY-MM-DD in America/New_York. */
  dateKey: string;
  /** Minutes past midnight, EST/EDT. */
  minutesOfDay: number;
  /** 0 = Sunday. */
  dayOfWeek: number;
}

/**
 * Decompose an instant into New York wall-clock parts. Uses Intl rather than
 * toLocaleString round-tripping, which silently misreads under some locales.
 */
export function nyParts(at: Date = new Date()): SessionParts {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', weekday: 'short',
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(at).map((p) => [p.type, p.value]),
  ) as Record<string, string>;

  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  // Intl renders midnight as "24" in some ICU versions.
  const hour = parseInt(parts.hour, 10) % 24;

  return {
    dateKey: `${parts.year}-${parts.month}-${parts.day}`,
    minutesOfDay: hour * 60 + parseInt(parts.minute, 10),
    dayOfWeek: weekdays[parts.weekday] ?? 1,
  };
}

const PREMARKET_OPEN = 4 * 60;      // 04:00
const REGULAR_OPEN = 9 * 60 + 30;   // 09:30
const REGULAR_CLOSE = 16 * 60;      // 16:00
const HALF_DAY_CLOSE = 13 * 60;     // 13:00
const AFTER_HOURS_CLOSE = 20 * 60;  // 20:00

export function isMarketHoliday(at: Date = new Date()): boolean {
  return MARKET_HOLIDAYS.has(nyParts(at).dateKey);
}

export function isHalfDay(at: Date = new Date()): boolean {
  return HALF_DAYS.has(nyParts(at).dateKey);
}

export function getCurrentSession(at: Date = new Date()): MarketSession {
  const { dateKey, minutesOfDay, dayOfWeek } = nyParts(at);
  if (dayOfWeek === 0 || dayOfWeek === 6) return 'CLOSED';
  if (MARKET_HOLIDAYS.has(dateKey)) return 'CLOSED';

  const close = HALF_DAYS.has(dateKey) ? HALF_DAY_CLOSE : REGULAR_CLOSE;

  if (minutesOfDay >= PREMARKET_OPEN && minutesOfDay < REGULAR_OPEN) return 'PREMARKET';
  if (minutesOfDay >= REGULAR_OPEN && minutesOfDay < close) return 'REGULAR';
  if (minutesOfDay >= close && minutesOfDay < AFTER_HOURS_CLOSE) return 'AFTER_HOURS';
  return 'CLOSED';
}

export function isExtendedHours(session: MarketSession): boolean {
  return session === 'PREMARKET' || session === 'AFTER_HOURS';
}

/** Minutes elapsed since 09:30, clamped into the session. */
export function minutesIntoSession(at: Date = new Date(), sessionMinutes = 390): number {
  const { minutesOfDay } = nyParts(at);
  return Math.min(Math.max(minutesOfDay - REGULAR_OPEN, 0), sessionMinutes - 1);
}

/**
 * Session-adjusted move threshold.
 *
 * Outside regular hours the same percentage means less, so every move
 * threshold is multiplied — stage 1's +1.5% becomes +2.25% premarket.
 */
export function adjustMoveThreshold(
  threshold: number,
  session: MarketSession,
  multiplier: number,
): number {
  return isExtendedHours(session) ? threshold * multiplier : threshold;
}

/**
 * Whether RVOL is meaningful right now.
 *
 * Premarket volume is a rounding error against the intraday curve, so RVOL
 * explodes to meaningless numbers. Outside regular hours the engines fall back
 * to an absolute share-volume floor instead.
 */
export function isRvolMeaningful(session: MarketSession): boolean {
  return session === 'REGULAR';
}

/** VWAP is a session statistic; it means nothing before the open. */
export function isVwapMeaningful(session: MarketSession): boolean {
  return session === 'REGULAR';
}
