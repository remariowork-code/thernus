import { describe, expect, it } from 'vitest';
import {
  adjustMoveThreshold, getCurrentSession, isHalfDay, isMarketHoliday,
  isRvolMeaningful, isVwapMeaningful, minutesIntoSession, nyParts,
} from '@shared/market/session';

/** Helper: a UTC instant for a given New York wall-clock time in September (EDT, UTC-4). */
const nyEDT = (day: number, hh: number, mm: number) =>
  new Date(Date.parse(`2026-09-${String(day).padStart(2, '0')}T${String(hh + 4).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00Z`));

describe('market session', () => {
  it('identifies the regular session', () => {
    expect(getCurrentSession(nyEDT(8, 9, 30))).toBe('REGULAR');
    expect(getCurrentSession(nyEDT(8, 12, 0))).toBe('REGULAR');
    expect(getCurrentSession(nyEDT(8, 15, 59))).toBe('REGULAR');
  });

  it('identifies premarket and after-hours', () => {
    expect(getCurrentSession(nyEDT(8, 4, 0))).toBe('PREMARKET');
    expect(getCurrentSession(nyEDT(8, 9, 29))).toBe('PREMARKET');
    expect(getCurrentSession(nyEDT(8, 16, 0))).toBe('AFTER_HOURS');
    expect(getCurrentSession(nyEDT(8, 19, 59))).toBe('AFTER_HOURS');
  });

  it('is closed overnight and at weekends', () => {
    expect(getCurrentSession(nyEDT(8, 3, 0))).toBe('CLOSED');
    expect(getCurrentSession(nyEDT(8, 20, 0))).toBe('CLOSED');
    // 2026-09-05 is a Saturday, 2026-09-06 a Sunday.
    expect(getCurrentSession(nyEDT(5, 12, 0))).toBe('CLOSED');
    expect(getCurrentSession(nyEDT(6, 12, 0))).toBe('CLOSED');
  });

  it('is closed on market holidays', () => {
    // 2026-09-07 is Labor Day.
    expect(isMarketHoliday(nyEDT(7, 12, 0))).toBe(true);
    expect(getCurrentSession(nyEDT(7, 12, 0))).toBe('CLOSED');
  });

  it('closes half-days early', () => {
    const blackFriday = new Date(Date.parse('2026-11-27T18:30:00Z')); // 13:30 EST
    expect(isHalfDay(blackFriday)).toBe(true);
    expect(getCurrentSession(blackFriday)).toBe('AFTER_HOURS');
  });

  it('decomposes New York wall-clock correctly', () => {
    const parts = nyParts(nyEDT(8, 9, 30));
    expect(parts.dateKey).toBe('2026-09-08');
    expect(parts.minutesOfDay).toBe(9 * 60 + 30);
    expect(parts.dayOfWeek).toBe(2); // Tuesday
  });

  it('counts minutes into the session', () => {
    expect(minutesIntoSession(nyEDT(8, 9, 30))).toBe(0);
    expect(minutesIntoSession(nyEDT(8, 9, 45))).toBe(15);
    expect(minutesIntoSession(nyEDT(8, 3, 0))).toBe(0);
  });
});

describe('session-aware thresholds', () => {
  it('raises move thresholds outside regular hours', () => {
    // The spec's example: stage 1 needs +2.25% premarket instead of +1.5%.
    expect(adjustMoveThreshold(1.5, 'PREMARKET', 1.5)).toBeCloseTo(2.25, 6);
    expect(adjustMoveThreshold(1.5, 'AFTER_HOURS', 1.5)).toBeCloseTo(2.25, 6);
  });

  it('leaves regular-session thresholds alone', () => {
    expect(adjustMoveThreshold(1.5, 'REGULAR', 1.5)).toBe(1.5);
  });

  it('treats RVOL and VWAP as regular-session-only statistics', () => {
    expect(isRvolMeaningful('REGULAR')).toBe(true);
    expect(isRvolMeaningful('PREMARKET')).toBe(false);
    expect(isVwapMeaningful('AFTER_HOURS')).toBe(false);
  });
});
