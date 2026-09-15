import { describe, expect, it } from 'vitest';
import type { StockMetrics } from '../shared/types';
import { DEFAULT_TRADER_CONFIG, estimateCommission } from '../trader/src/config';
import { evaluateEntry, rankCandidates } from '../trader/src/engine/EntryRules';
import { evaluateExit } from '../trader/src/engine/ExitRules';
import type { Position } from '../trader/src/types';

const ENTRY = DEFAULT_TRADER_CONFIG.entry;
const EXIT = DEFAULT_TRADER_CONFIG.exit;

/** A candidate that passes every entry condition, so tests can break one at a time. */
function candidate(overrides: Partial<StockMetrics> = {}): StockMetrics {
  return {
    symbol: 'AAA',
    price: 12,
    previousClose: 11,
    changePercent: 9,
    change1m: 0.3,
    change5m: 1.2,
    change15m: 3,
    volume: 2_000_000,
    rvol: 5,
    volumeAcceleration: 1.8,
    vwap: 11.6,
    vwapDistance: 3.4,
    aboveVwap: true,
    dayHigh: 12.1,
    dayLow: 10.9,
    distanceFromHigh: 0.8,
    isNewHigh: true,
    volatility: 1.4,
    momentumScore: 72,
    stage: 'ACCELERATING',
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe('entry rules', () => {
  it('accepts a candidate meeting every condition and explains why', () => {
    const result = evaluateEntry(candidate(), ENTRY);

    expect(result.pass).toBe(true);
    expect(result.blockedBy).toBeNull();
    expect(result.reasons).toHaveLength(8);
    expect(result.reasons.join(' ')).toContain('5.0x its normal volume');
  });

  it.each([
    ['price above the band', { price: 250 }, 'outside the $1-$100 band'],
    ['thin volume', { volume: 100_000 }, 'below the 500,000 floor'],
    ['too small a move', { changePercent: 1 }, 'under the 3% trigger'],
    ['ordinary volume', { rvol: 1.1 }, 'under the 2x requirement'],
    ['weak momentum', { momentumScore: 40 }, 'below 60'],
    ['under VWAP', { aboveVwap: false, vwapDistance: -1.5 }, 'underwater'],
    ['extended from the high', { distanceFromHigh: 7 }, "off the day's high"],
    ['stalling', { change5m: -0.4 }, 'stalled or falling'],
  ])('rejects %s', (_label, override, expected) => {
    const result = evaluateEntry(candidate(override), ENTRY);

    expect(result.pass).toBe(false);
    expect(result.blockedBy).toContain(expected);
  });

  it('reports only the first failure, so the log names one cause', () => {
    const result = evaluateEntry(candidate({ price: 250, volume: 1_000, rvol: 0.2 }), ENTRY);
    expect(result.blockedBy).toContain('outside the $1-$100 band');
  });

  it('honours the optional conditions being switched off', () => {
    const relaxed = { ...ENTRY, requireAboveVwap: false, requirePositiveFiveMinute: false };
    const result = evaluateEntry(candidate({ aboveVwap: false, change5m: -1 }), relaxed);
    expect(result.pass).toBe(true);
  });

  it('prefers volume conviction over a move already spent', () => {
    const spent = evaluateEntry(candidate({ symbol: 'SPENT', changePercent: 18, rvol: 2.1, change5m: 0.2 }), ENTRY);
    const building = evaluateEntry(candidate({ symbol: 'BUILDING', changePercent: 4, rvol: 9, change5m: 1.5 }), ENTRY);

    const ranked = rankCandidates([spent, building]);
    expect(ranked.map((c) => c.symbol)).toEqual(['BUILDING', 'SPENT']);
  });

  it('drops failures from the ranking entirely', () => {
    const ok = evaluateEntry(candidate({ symbol: 'OK' }), ENTRY);
    const bad = evaluateEntry(candidate({ symbol: 'BAD', rvol: 0.5 }), ENTRY);
    expect(rankCandidates([ok, bad]).map((c) => c.symbol)).toEqual(['OK']);
  });
});

/** A position entered at $10 with a 3% stop, so 1R is $0.30. */
function open(overrides: Partial<Position> = {}): Position {
  return {
    symbol: 'AAA',
    quantity: 5,
    entryPrice: 10,
    entryAt: '2026-09-15T14:00:00Z',
    entryReasons: ['test'],
    stopPrice: 9.7,
    initialStopPrice: 9.7,
    targetPrice: 10.6,
    highWaterMark: 10,
    stopRaised: false,
    entryOrderId: 'o1',
    entryCommission: 0.35,
    lastKnownPrice: 10,
    updatedAt: '2026-09-15T14:00:00Z',
    ...overrides,
  };
}

const AT = new Date('2026-09-15T14:30:00Z');

describe('exit rules', () => {
  it('holds a position that is working but has not reached anything', () => {
    const d = evaluateExit(open(), { price: 10.15, momentumScore: 70, now: AT, minutesToClose: 200 }, EXIT);
    expect(d.shouldExit).toBe(false);
    expect(d.newStopPrice).toBeUndefined();
  });

  it('closes at the stop', () => {
    const d = evaluateExit(open(), { price: 9.65, momentumScore: 70, now: AT, minutesToClose: 200 }, EXIT);
    expect(d.reason).toBe('STOP_LOSS');
    expect(d.explanation).toContain('hit the $9.70 stop');
  });

  it('closes at the target', () => {
    const d = evaluateExit(open(), { price: 10.62, momentumScore: 70, now: AT, minutesToClose: 200 }, EXIT);
    expect(d.reason).toBe('PROFIT_TARGET');
    expect(d.explanation).toContain('2.07R');
  });

  it('takes the stop, not the target, when a move straddles both', () => {
    // The pessimistic reading is the correct one: nothing in the data says
    // which price came first.
    const position = open({ stopPrice: 10.5, targetPrice: 10.6 });
    const d = evaluateExit(position, { price: 10.4, momentumScore: 70, now: AT, minutesToClose: 200 }, EXIT);
    expect(d.reason).toBe('STOP_LOSS');
  });

  it('flattens before the close regardless of profit', () => {
    const d = evaluateExit(open(), { price: 10.3, momentumScore: 80, now: AT, minutesToClose: 8 }, EXIT);
    expect(d.reason).toBe('END_OF_DAY');
  });

  it('closes a position that has gone nowhere for too long', () => {
    const late = new Date('2026-09-15T16:05:00Z'); // 125 minutes after entry
    const d = evaluateExit(open(), { price: 10.05, momentumScore: 70, now: late, minutesToClose: 200 }, EXIT);
    expect(d.reason).toBe('MAX_HOLD');
  });

  it('closes when momentum dies', () => {
    const d = evaluateExit(open(), { price: 10.2, momentumScore: 20, now: AT, minutesToClose: 200 }, EXIT);
    expect(d.reason).toBe('MOMENTUM_REVERSAL');
  });

  it('puts the kill switch ahead of every other consideration', () => {
    const d = evaluateExit(
      open(),
      { price: 10.55, momentumScore: 90, now: AT, minutesToClose: 200, killSwitchActive: true },
      EXIT,
    );
    expect(d.reason).toBe('KILL_SWITCH');
  });
});

describe('stop management', () => {
  it('moves the stop to break-even at 1R when the trail is wider', () => {
    // A 5% trail off a price 3.1% above entry sits below entry, so break-even
    // is the binding rule and the stop lands exactly on the entry price.
    const wide = { ...EXIT, trailPercent: 5 };
    const d = evaluateExit(open(), { price: 10.31, momentumScore: 70, now: AT, minutesToClose: 200 }, wide);
    expect(d.shouldExit).toBe(false);
    expect(d.newStopPrice).toBe(10);
    expect(d.stopExplanation).toContain('break-even');
  });

  it('takes the trail over break-even whenever the trail is higher', () => {
    // With the default 3% stop and 2% trail, reaching 1R puts price 3.1% above
    // entry, so the trail is already the better of the two and wins outright.
    const d = evaluateExit(open(), { price: 10.31, momentumScore: 70, now: AT, minutesToClose: 200 }, EXIT);
    expect(d.newStopPrice).toBe(10.1);
    expect(d.newStopPrice).toBeGreaterThan(open().entryPrice);
  });

  it('trails below the high-water mark once raised', () => {
    const position = open({ stopPrice: 10, stopRaised: true, highWaterMark: 10.5 });
    const d = evaluateExit(position, { price: 10.5, momentumScore: 70, now: AT, minutesToClose: 200 }, EXIT);
    expect(d.newStopPrice).toBe(10.29); // 2% below 10.50
    expect(d.stopExplanation).toContain('new high');
  });

  it('never moves the stop back down', () => {
    // Price has pulled back from a 10.80 high; the trailed level would be
    // 10.58 off that high, but the stop already sits at 10.60.
    const position = open({ stopPrice: 10.6, stopRaised: true, highWaterMark: 10.8 });
    const d = evaluateExit(position, { price: 10.65, momentumScore: 70, now: AT, minutesToClose: 200 }, EXIT);
    expect(d.newStopPrice).toBeUndefined();
  });

  it('leaves the stop alone below the break-even threshold', () => {
    const d = evaluateExit(open(), { price: 10.2, momentumScore: 70, now: AT, minutesToClose: 200 }, EXIT);
    expect(d.newStopPrice).toBeUndefined();
  });

  it('a trade that runs ends up stopped out in profit', () => {
    // Walk a winner forward: break-even, trail up, then a reversal through the
    // raised stop. The exit must be above the entry.
    let position = open({ targetPrice: 12 });
    for (const price of [10.31, 10.6, 10.9, 11.2]) {
      const d = evaluateExit(position, { price, momentumScore: 70, now: AT, minutesToClose: 200 }, EXIT);
      expect(d.shouldExit).toBe(false);
      if (d.newStopPrice) {
        position = {
          ...position,
          stopPrice: d.newStopPrice,
          stopRaised: true,
          highWaterMark: Math.max(position.highWaterMark, price),
        };
      }
    }
    expect(position.stopPrice).toBe(10.98);

    const final = evaluateExit(position, { price: 10.9, momentumScore: 70, now: AT, minutesToClose: 200 }, EXIT);
    expect(final.reason).toBe('TRAILING_STOP');
    expect(position.stopPrice).toBeGreaterThan(position.entryPrice);
  });
});

describe('commission', () => {
  const COSTS = DEFAULT_TRADER_CONFIG.costs;

  it('caps a small order at one percent rather than charging the minimum', () => {
    // 1 share at $15. The per-share rate is a third of a cent and the $0.35
    // minimum would be 2.3% of the trade, so the 1% ceiling binds instead and
    // the charge is $0.15. This ceiling is the reason a $100 account is
    // tradeable at all — without it the minimum alone would swamp every trade.
    expect(estimateCommission(1, 15, COSTS)).toBe(0.15);
  });

  it('charges the minimum when the order is large enough for it to bind', () => {
    // 50 shares at $1: per-share is $0.175, 1% of $50 is $0.50, so the $0.35
    // minimum sits between them and is what is charged.
    expect(estimateCommission(50, 1, COSTS)).toBe(0.35);
  });

  it('charges the per-share rate on a large order', () => {
    expect(estimateCommission(1_000, 50, COSTS)).toBe(3.5);
  });

  it('never exceeds one percent of the trade value', () => {
    // 1 share at $5 would be $0.35 by the minimum, which is 7% of the trade;
    // the cap brings it back to $0.05.
    expect(estimateCommission(1, 5, COSTS)).toBe(0.05);
  });

  it('is zero for an empty order', () => {
    expect(estimateCommission(0, 15, COSTS)).toBe(0);
  });

  it('costs 2% round trip on a small position', () => {
    // Stated as a test because it is the most important number for trading
    // this at $100: the 1% cap applies on the way in and again on the way out,
    // so a trade starts 2% behind and the 2R target is really 2R plus 2%.
    const roundTrip = estimateCommission(1, 20, COSTS) * 2;
    expect(roundTrip).toBeCloseTo(0.4, 2);
    expect(roundTrip / 20).toBeCloseTo(0.02, 4);
  });
});

describe('the momentum exit grace period', () => {
  it('does not sell into a pullback in the first minutes', () => {
    // Two minutes after entry, with momentum collapsed. The entry condition
    // itself produces a score that cannot persist, so acting on its decay
    // immediately would close every trade before it could work.
    const justAfterEntry = new Date('2026-09-15T14:02:00Z');
    const d = evaluateExit(
      open(),
      { price: 10.2, momentumScore: 10, now: justAfterEntry, minutesToClose: 200 },
      EXIT,
    );
    expect(d.shouldExit).toBe(false);
  });

  it('still honours the stop during the grace period', () => {
    // The grace period suspends the momentum exit, not risk control.
    const justAfterEntry = new Date('2026-09-15T14:02:00Z');
    const d = evaluateExit(
      open(),
      { price: 9.5, momentumScore: 10, now: justAfterEntry, minutesToClose: 200 },
      EXIT,
    );
    expect(d.reason).toBe('STOP_LOSS');
  });

  it('closes on dead momentum once the grace period has passed', () => {
    const later = new Date('2026-09-15T14:20:00Z'); // 20 minutes after entry
    const d = evaluateExit(
      open(),
      { price: 10.2, momentumScore: 10, now: later, minutesToClose: 200 },
      EXIT,
    );
    expect(d.reason).toBe('MOMENTUM_REVERSAL');
  });
});
