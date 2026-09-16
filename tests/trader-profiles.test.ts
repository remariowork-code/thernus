import { afterEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_TRADER_CONFIG, PROFILES, describeConfig, getTraderConfig,
  isProfileName, mergeTraderConfig, resetTraderConfig,
} from '../trader/src/config';
import { evaluateExit } from '../trader/src/engine/ExitRules';
import type { Position } from '../trader/src/types';

afterEach(() => {
  resetTraderConfig();
  delete process.env.TRADER_PROFILE;
  delete process.env.TRADER_CONFIG;
});

function resolve(name: 'standard' | 'penny') {
  return mergeTraderConfig(DEFAULT_TRADER_CONFIG, PROFILES[name]);
}

describe('profiles', () => {
  it('selects the standard profile by default', () => {
    expect(getTraderConfig().profile).toBe('standard');
  });

  it('selects a profile from the environment', () => {
    process.env.TRADER_PROFILE = 'penny';
    expect(getTraderConfig().profile).toBe('penny');
  });

  it('ignores an unrecognised profile name rather than failing open', () => {
    process.env.TRADER_PROFILE = 'aggressive';
    expect(getTraderConfig().profile).toBe('standard');
  });

  it('lets an explicit override beat the profile', () => {
    process.env.TRADER_PROFILE = 'penny';
    process.env.TRADER_CONFIG = '{"exit":{"stopLossPercent":4}}';
    const config = getTraderConfig();
    expect(config.exit.stopLossPercent).toBe(4);
    // Everything else still comes from the profile.
    expect(config.exit.breakEvenAtR).toBe(PROFILES.penny.exit!.breakEvenAtR);
  });

  it('falls back to the profile when the override is malformed', () => {
    process.env.TRADER_PROFILE = 'penny';
    process.env.TRADER_CONFIG = '{not json';
    expect(getTraderConfig().exit.stopLossPercent).toBe(PROFILES.penny.exit!.stopLossPercent);
  });

  it('never enables live trading from a profile alone', () => {
    process.env.TRADER_PROFILE = 'penny';
    expect(getTraderConfig().liveTrading).toBe(false);
  });

  it('recognises exactly the two profile names', () => {
    expect(isProfileName('standard')).toBe(true);
    expect(isProfileName('penny')).toBe(true);
    expect(isProfileName('Penny')).toBe(false);
    expect(isProfileName('')).toBe(false);
  });
});

describe('the profiles describe different instruments', () => {
  it('penny hunts cheaper, faster-moving stocks than standard', () => {
    const standard = resolve('standard');
    const penny = resolve('penny');

    expect(penny.entry.maxPrice).toBeLessThan(standard.entry.minPrice * 3);
    // A penny candidate must be doing something far more dramatic.
    expect(penny.entry.minChangePercent).toBeGreaterThan(standard.entry.minChangePercent);
    expect(penny.entry.minRvol).toBeGreaterThan(standard.entry.minRvol);
    // And it is given far more room before being stopped or choked.
    expect(penny.exit.stopLossPercent).toBeGreaterThan(standard.exit.stopLossPercent);
    expect(penny.exit.breakEvenAtR).toBeGreaterThan(standard.exit.breakEvenAtR);
  });

  it('penny takes one trade a day, within the PDT allowance', () => {
    const penny = resolve('penny');
    // FINRA permits three day trades per five business days under $25k, so a
    // profile that re-enters the same name repeatedly would spend the week on
    // one session.
    expect(penny.risk.maxTradesPerDay).toBe(1);
    expect(penny.risk.maxTradesPerDay).toBeLessThanOrEqual(penny.risk.maxDayTradesPerWindow);
  });

  it('penny sets no fixed target, standard does', () => {
    expect(resolve('penny').exit.targetRMultiple).toBeNull();
    expect(resolve('standard').exit.targetRMultiple).not.toBeNull();
  });

  it('describes a missing target in words rather than printing null', () => {
    const lines = describeConfig(resolve('penny')).join(' ');
    expect(lines).toContain('no fixed target');
    expect(lines).not.toContain('null');
    expect(lines).toContain('Profile: penny');
  });
});

describe('a position with no fixed target', () => {
  const penny = resolve('penny');

  function open(overrides: Partial<Position> = {}): Position {
    return {
      symbol: 'AAA', quantity: 10, entryPrice: 1, entryAt: '2026-09-15T14:00:00Z',
      entryReasons: [], stopPrice: 0.88, initialStopPrice: 0.88,
      // Zero is how "no target" reaches the exit rules.
      targetPrice: 0,
      highWaterMark: 1, stopRaised: false, entryOrderId: 'o1', entryCommission: 0.01,
      lastKnownPrice: 1, updatedAt: '2026-09-15T14:00:00Z',
      ...overrides,
    };
  }

  it('never exits on the target however far it runs', () => {
    const d = evaluateExit(
      open(),
      { price: 12, momentumScore: 90, now: new Date('2026-09-15T14:30:00Z'), minutesToClose: 200 },
      penny.exit,
    );
    expect(d.shouldExit).toBe(false);
    expect(d.reason).toBeNull();
  });

  it('still honours the stop', () => {
    const d = evaluateExit(
      open(),
      { price: 0.85, momentumScore: 90, now: new Date('2026-09-15T14:30:00Z'), minutesToClose: 200 },
      penny.exit,
    );
    expect(d.reason).toBe('STOP_LOSS');
  });

  it('holds through a 1R gain instead of choking the trade at break-even', () => {
    // The standard profile moves the stop to entry at 2R. The penny profile
    // waits for 5R, because on a 12% stop an early break-even converts the
    // stop to 0% and guarantees a shakeout on a stock with 17% bars.
    const d = evaluateExit(
      open(),
      { price: 1.15, momentumScore: 90, now: new Date('2026-09-15T14:30:00Z'), minutesToClose: 200 },
      penny.exit,
    );
    expect(d.newStopPrice).toBeUndefined();
  });

  it('raises the stop once the trade is well ahead', () => {
    // 5R on a $0.12 risk is $0.60, so $1.65 is where the stop may finally move.
    const d = evaluateExit(
      open(),
      { price: 1.7, momentumScore: 90, now: new Date('2026-09-15T14:30:00Z'), minutesToClose: 200 },
      penny.exit,
    );
    expect(d.newStopPrice).toBeGreaterThan(1);
  });
});

describe('replaying several symbols together', () => {
  // Regression: the backtest used to step symbols by bar index rather than by
  // time. Bars are sparse and each symbol has a different count — RETO printed
  // 109 session bars on 2026-09-15 while PDSB printed 304 — so index-stepping
  // ran them at different speeds and put the clock an hour out.
  it('advances every symbol on one shared timeline', () => {
    const sparse = ['09:35', '11:24', '15:30'];
    const dense = ['09:31', '09:32', '09:33', '11:24', '11:25'];

    const timeline = [...new Set([...sparse, ...dense])].sort();
    expect(timeline).toEqual(['09:31', '09:32', '09:33', '09:35', '11:24', '11:25', '15:30']);

    // At each stamp a symbol is positioned at its most recent bar at or before
    // that time, never at "its nth bar".
    const cursorAt = (bars: string[], stamp: string): number => {
      let index = -1;
      while (index + 1 < bars.length && bars[index + 1] <= stamp) index += 1;
      return index;
    };

    // At 11:24 both symbols are genuinely at 11:24, not at unrelated points.
    expect(sparse[cursorAt(sparse, '11:24')]).toBe('11:24');
    expect(dense[cursorAt(dense, '11:24')]).toBe('11:24');

    // The old index-based approach would have paired these, an hour apart.
    expect(sparse[1]).toBe('11:24');
    expect(dense[1]).toBe('09:32');

    // A symbol with no bar yet is absent rather than borrowing another's.
    expect(cursorAt(sparse, '09:31')).toBe(-1);
    // And one that has stopped printing holds its last known bar.
    expect(sparse[cursorAt(sparse, '23:00')]).toBe('15:30');
  });
});
