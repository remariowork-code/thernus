import { unlinkSync, writeFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DEFAULT_TRADER_CONFIG } from '../trader/src/config';
import {
  RiskManager, businessDaysBefore, type RiskContext,
} from '../trader/src/engine/RiskManager';
import type { AccountState, ClosedTrade, Position } from '../trader/src/types';

const LIMITS = DEFAULT_TRADER_CONFIG.risk;

function account(overrides: Partial<AccountState> = {}): AccountState {
  return { equity: 100, cash: 100, buyingPower: 100, dayTradesUsed: 0, ...overrides };
}

function ctx(overrides: Partial<RiskContext> = {}): RiskContext {
  return {
    account: account(),
    openPositions: [],
    tradesToday: 0,
    realizedPnlToday: 0,
    recentTrades: [],
    now: new Date('2026-09-15T14:00:00Z'),
    ...overrides,
  };
}

function position(symbol: string): Position {
  return {
    symbol,
    quantity: 1,
    entryPrice: 10,
    entryAt: '2026-09-15T13:45:00Z',
    entryReasons: [],
    stopPrice: 9.7,
    initialStopPrice: 9.7,
    targetPrice: 10.6,
    highWaterMark: 10,
    stopRaised: false,
    entryOrderId: 'o1',
    entryCommission: 0.35,
    lastKnownPrice: 10,
    updatedAt: '2026-09-15T13:45:00Z',
  };
}

function closedDayTrade(exitAt: string): ClosedTrade {
  return {
    ...position('X'),
    exitPrice: 10.5,
    exitAt,
    exitReason: 'PROFIT_TARGET',
    exitOrderId: 'o2',
    realizedPnl: 0.5,
    commission: 0.7,
    rMultiple: 1.6,
    wasDayTrade: true,
  };
}

describe('position sizing', () => {
  it('sizes from the risk budget and reports what limited it', () => {
    const rm = new RiskManager({ ...LIMITS, accountEquity: 10_000 });
    // $10k equity, 1% risk = $100 budget; 3% stop on a $10 share = $0.30/share.
    // $100 / $0.30 = 333 shares by risk, but the 20% position cap allows far
    // fewer, so the capital cap must be the binding constraint.
    const decision = rm.evaluateEntry('AAA', 10, 3, 2, ctx({
      account: account({ equity: 10_000, cash: 10_000, buyingPower: 10_000 }),
    }));

    expect(decision.allowed).toBe(true);
    expect(decision.quantity).toBe(2); // $20 cap / $10
    expect(decision.reason).toContain('capital cap');
    expect(decision.stopPrice).toBe(9.7);
    expect(decision.targetPrice).toBeCloseTo(10.6, 2);
  });

  it('refuses when the size rounds to zero shares', () => {
    const rm = new RiskManager(LIMITS);
    // $100 equity, 1% = $1 risk budget. A $50 share with a 3% stop risks
    // $1.50/share, so a single share exceeds the budget.
    const decision = rm.evaluateEntry('BBB', 50, 3, 2, ctx());

    expect(decision.allowed).toBe(false);
    expect(decision.quantity).toBe(0);
    expect(decision.reason).toContain('rounds to zero shares');
  });

  it('never sizes past available buying power', () => {
    const rm = new RiskManager({ ...LIMITS, accountEquity: 10_000, maxPositionDollars: 5_000 });
    const decision = rm.evaluateEntry('CCC', 10, 3, 2, ctx({
      account: account({ equity: 10_000, cash: 35, buyingPower: 35 }),
    }));

    expect(decision.quantity).toBe(3); // $35 buying power / $10
  });
});

describe('trading limits', () => {
  it('refuses a symbol already held', () => {
    const rm = new RiskManager({ ...LIMITS, accountEquity: 10_000 });
    const decision = rm.evaluateEntry('AAA', 10, 3, 2, ctx({
      account: account({ equity: 10_000, buyingPower: 10_000 }),
      openPositions: [position('AAA')],
    }));

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('already holding AAA');
  });

  it('refuses past the concurrent position limit', () => {
    const rm = new RiskManager({ ...LIMITS, accountEquity: 10_000 });
    const decision = rm.evaluateEntry('CCC', 10, 3, 2, ctx({
      account: account({ equity: 10_000, buyingPower: 10_000 }),
      openPositions: [position('AAA'), position('BBB')],
    }));

    expect(decision.reason).toContain('position limit');
  });

  it('refuses past the daily trade count', () => {
    const rm = new RiskManager({ ...LIMITS, accountEquity: 10_000 });
    const decision = rm.evaluateEntry('AAA', 10, 3, 2, ctx({
      account: account({ equity: 10_000, buyingPower: 10_000 }),
      tradesToday: 3,
    }));

    expect(decision.reason).toContain('daily trade limit');
  });

  it('stops trading once the daily loss allowance is spent', () => {
    const rm = new RiskManager({ ...LIMITS, accountEquity: 10_000 });
    // 5% of $10,000 is $500.
    const decision = rm.evaluateEntry('AAA', 10, 3, 2, ctx({
      account: account({ equity: 10_000, buyingPower: 10_000 }),
      realizedPnlToday: -500,
    }));

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('daily loss limit');
  });
});

describe('pattern day trader accounting', () => {
  it('counts day trades over business days, not calendar days', () => {
    const rm = new RiskManager(LIMITS);
    const monday = new Date('2026-09-14T14:00:00Z');
    // The previous Tuesday is four business days back, so it is still inside a
    // five-business-day window even though it is six calendar days ago.
    const previousTuesday = '2026-09-08T18:00:00Z';

    expect(rm.dayTradesUsed([closedDayTrade(previousTuesday)], monday)).toBe(1);
    // The Monday before that has aged out.
    expect(rm.dayTradesUsed([closedDayTrade('2026-09-07T18:00:00Z')], monday)).toBe(0);
  });

  it('blocks the fourth day trade before the broker has to', () => {
    const rm = new RiskManager(LIMITS);
    const now = new Date('2026-09-15T14:00:00Z');
    const trades = [
      closedDayTrade('2026-09-15T13:00:00Z'),
      closedDayTrade('2026-09-14T18:00:00Z'),
      closedDayTrade('2026-09-11T18:00:00Z'),
    ];

    const decision = rm.evaluateEntry('AAA', 10, 3, 2, ctx({ now, recentTrades: trades }));
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('pattern day trader limit');
  });

  it('ignores the rule above the equity threshold', () => {
    const rm = new RiskManager({ ...LIMITS, accountEquity: 30_000 });
    const now = new Date('2026-09-15T14:00:00Z');
    const trades = [
      closedDayTrade('2026-09-15T13:00:00Z'),
      closedDayTrade('2026-09-14T18:00:00Z'),
      closedDayTrade('2026-09-11T18:00:00Z'),
    ];

    const decision = rm.evaluateEntry('AAA', 10, 3, 2, ctx({
      account: account({ equity: 30_000, cash: 30_000, buyingPower: 30_000 }),
      now,
      recentTrades: trades,
    }));
    expect(decision.allowed).toBe(true);
  });

  it('does not count positions closed on a later day', () => {
    const rm = new RiskManager(LIMITS);
    const overnight: ClosedTrade = { ...closedDayTrade('2026-09-15T13:00:00Z'), wasDayTrade: false };
    expect(rm.dayTradesUsed([overnight], new Date('2026-09-15T14:00:00Z'))).toBe(0);
  });
});

describe('kill switch', () => {
  it('refuses every entry once tripped, and stays tripped', () => {
    const rm = new RiskManager({ ...LIMITS, accountEquity: 10_000 });
    rm.trip('manual halt');

    const decision = rm.evaluateEntry('AAA', 10, 3, 2, ctx({
      account: account({ equity: 10_000, buyingPower: 10_000 }),
    }));
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('manual halt');

    // A later, different reason must not overwrite the original.
    rm.trip('something else');
    expect(rm.haltReason()).toContain('manual halt');
  });

  it('trips after consecutive failures and resets on success', () => {
    const rm = new RiskManager(LIMITS);
    rm.recordFailure(3, 'timeout');
    rm.recordFailure(3, 'timeout');
    expect(rm.isHalted()).toBe(false);

    rm.recordSuccess();
    rm.recordFailure(3, 'timeout');
    rm.recordFailure(3, 'timeout');
    expect(rm.isHalted()).toBe(false);

    rm.recordFailure(3, 'timeout');
    expect(rm.haltReason()).toContain('3 consecutive failures');
  });

  it('honours a kill switch file appearing mid-session', () => {
    const path = `/tmp/thernus-kill-${process.pid}-${Date.now()}`;
    const rm = new RiskManager(LIMITS, path);
    expect(rm.isHalted()).toBe(false);

    writeFileSync(path, 'stop');
    try {
      expect(rm.haltReason()).toContain('kill switch file present');
    } finally {
      unlinkSync(path);
    }
    expect(rm.isHalted()).toBe(false);
  });
});

describe('businessDaysBefore', () => {
  it('skips weekends', () => {
    // Monday 2026-09-14 minus 1 business day is Friday the 11th.
    expect(businessDaysBefore(new Date('2026-09-14T12:00:00Z'), 1).getDate()).toBe(11);
    // Minus 4 business days reaches Tuesday the 8th.
    expect(businessDaysBefore(new Date('2026-09-14T12:00:00Z'), 4).getDate()).toBe(8);
  });
});
