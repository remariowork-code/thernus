import { describe, expect, it } from 'vitest';
import { SectorEngine } from '@shared/engine/SectorEngine';
import { DEFAULT_CONFIG, mergeConfig } from '@shared/config';
import type { StockMetrics } from '@shared/types';

/** A metrics record with sane defaults, overridable per test. */
function metrics(symbol: string, over: Partial<StockMetrics> = {}): StockMetrics {
  return {
    symbol,
    price: 100, previousClose: 100, changePercent: 0,
    change1m: 0, change5m: 0, change15m: 0,
    volume: 10_000, rvol: 1, volumeAcceleration: 1,
    vwap: 100, vwapDistance: 0, aboveVwap: false,
    dayHigh: 100, dayLow: 100, distanceFromHigh: 0,
    isNewHigh: false, volatility: 1, momentumScore: 0,
    stage: 'IDLE', updatedAt: Date.now(),
    ...over,
  };
}

function engineOf(symbols: string[], sectorId = 'test') {
  return new SectorEngine(
    sectorId,
    'Test Sector',
    symbols.map((symbol) => ({ symbol, weight: 1 })),
    DEFAULT_CONFIG,
  );
}

describe('breadth', () => {
  it('is advancing / active — 8 of 10 is 80%', () => {
    const symbols = Array.from({ length: 10 }, (_, i) => `S${i}`);
    const engine = engineOf(symbols);
    symbols.forEach((s, i) => {
      engine.updateStock(s, metrics(s, { changePercent: i < 8 ? 1.2 : -0.4 }));
    });
    const m = engine.compute('REGULAR', null);
    expect(m.advancing).toBe(8);
    expect(m.active).toBe(10);
    expect(m.breadth).toBeCloseTo(0.8, 6);
  });

  it('excludes constituents that have not traded', () => {
    const engine = engineOf(['A', 'B', 'C']);
    engine.updateStock('A', metrics('A', { changePercent: 2 }));
    engine.updateStock('B', metrics('B', { changePercent: 1 }));
    engine.updateStock('C', metrics('C', { volume: 0, changePercent: 0 }));
    const m = engine.compute('REGULAR', null);
    // C is untraded, so breadth is 2/2, not 2/3.
    expect(m.active).toBe(2);
    expect(m.breadth).toBeCloseTo(1.0, 6);
  });

  it('ignores symbols outside the sector', () => {
    const engine = engineOf(['A', 'B']);
    engine.updateStock('ZZZZ', metrics('ZZZZ', { changePercent: 50 }));
    expect(engine.compute('REGULAR', null).active).toBe(0);
  });
});

describe('sector score and acceleration', () => {
  it('is the weighted mean of constituent momentum', () => {
    const engine = new SectorEngine('w', 'Weighted', [
      { symbol: 'BIG', weight: 3 },
      { symbol: 'SMALL', weight: 1 },
    ], DEFAULT_CONFIG);
    engine.updateStock('BIG', metrics('BIG', { momentumScore: 80, changePercent: 1 }));
    engine.updateStock('SMALL', metrics('SMALL', { momentumScore: 40, changePercent: 1 }));
    // (3·80 + 1·40) / 4 = 70
    expect(engine.compute('REGULAR', null).score).toBeCloseTo(70, 6);
  });

  it('is score now minus score five minutes ago', () => {
    const engine = engineOf(['A']);
    engine.updateStock('A', metrics('A', { momentumScore: 72, changePercent: 1 }));
    expect(engine.compute('REGULAR', 54).acceleration).toBeCloseTo(18, 6);
  });

  it('reports zero acceleration when no history exists yet', () => {
    const engine = engineOf(['A']);
    engine.updateStock('A', metrics('A', { momentumScore: 72 }));
    expect(engine.compute('REGULAR', null).acceleration).toBe(0);
  });
});

describe('the single-stock trap', () => {
  it('does not call a sector strong because one name is flying', () => {
    const symbols = Array.from({ length: 10 }, (_, i) => `S${i}`);
    const engine = engineOf(symbols);
    // One monster, nine flat-to-down. This is exactly the false positive a
    // top-gainers list produces and the spec exists to avoid.
    engine.updateStock('S0', metrics('S0', {
      changePercent: 9.5, momentumScore: 98, rvol: 6, isNewHigh: true,
    }));
    for (let i = 1; i < 10; i++) {
      engine.updateStock(`S${i}`, metrics(`S${i}`, { changePercent: -0.3, momentumScore: 10, rvol: 0.9 }));
    }
    const m = engine.compute('REGULAR', null);
    expect(m.breadth).toBeCloseTo(0.1, 6);
    expect(m.stage).toBe('IDLE');
    expect(engine.evaluate(m, 'REGULAR').stageNumber).toBe(0);
  });

  it('does call it strong when the move is broad', () => {
    const symbols = Array.from({ length: 10 }, (_, i) => `S${i}`);
    const engine = engineOf(symbols);
    symbols.forEach((s, i) => {
      engine.updateStock(s, metrics(s, {
        changePercent: i < 8 ? 1.8 : -0.2,
        momentumScore: i < 8 ? 70 : 20,
        rvol: i < 8 ? 2.0 : 1.0,
      }));
    });
    const m = engine.compute('REGULAR', null);
    expect(m.breadth).toBeCloseTo(0.8, 6);
    expect(engine.evaluate(m, 'REGULAR').stageNumber).toBeGreaterThanOrEqual(1);
  });
});

describe('stage thresholds', () => {
  /** Build a sector at a uniform move/rvol/score, n of `count` advancing. */
  function sectorAt(opts: {
    count: number; movers: number; move: number; rvol: number;
    score: number; newHighs?: number; sectorId?: string;
  }) {
    const symbols = Array.from({ length: opts.count }, (_, i) => `S${i}`);
    const engine = engineOf(symbols, opts.sectorId);
    symbols.forEach((s, i) => {
      const moving = i < opts.movers;
      engine.updateStock(s, metrics(s, {
        changePercent: moving ? opts.move : -0.2,
        momentumScore: moving ? opts.score : 15,
        rvol: opts.rvol,
        isNewHigh: i < (opts.newHighs ?? 0),
      }));
    });
    return { engine, metrics: engine.compute('REGULAR', null) };
  }

  it('stage 1 needs 3 movers, breadth over 50% and RVOL 1.5', () => {
    const { engine, metrics: m } = sectorAt({ count: 6, movers: 4, move: 1.6, rvol: 1.6, score: 60 });
    const evaluation = engine.evaluate(m, 'REGULAR');
    expect(evaluation.stageNumber).toBe(1);
    expect(evaluation.stage).toBe('AWAKENING');
  });

  it('stage 1 fails on thin volume even with the price move', () => {
    const { engine, metrics: m } = sectorAt({ count: 6, movers: 4, move: 1.6, rvol: 1.0, score: 60 });
    expect(engine.evaluate(m, 'REGULAR').stageNumber).toBe(0);
  });

  it('stage 3 needs 3 leaders above +3%, RVOL 2.5 and multiple new highs', () => {
    const { engine, metrics: m } = sectorAt({
      count: 8, movers: 6, move: 3.4, rvol: 2.8, score: 85, newHighs: 3,
    });
    const evaluation = engine.evaluate(m, 'REGULAR');
    expect(m.strongLeaderCount).toBeGreaterThanOrEqual(3);
    expect(evaluation.stageNumber).toBeGreaterThanOrEqual(3);
  });

  it('reports the highest satisfied stage, not the lowest', () => {
    const { engine, metrics: m } = sectorAt({
      count: 10, movers: 10, move: 3.6, rvol: 3.4, score: 92, newHighs: 4,
    });
    expect(engine.evaluate(m, 'REGULAR').stageNumber).toBe(4);
  });

  it('waives the RVOL gate outside regular hours instead of blocking', () => {
    const symbols = ['A', 'B', 'C', 'D'];
    const engine = engineOf(symbols);
    // Premarket: thresholds are 1.5x, so +2.4% clears the adjusted +2.25%.
    symbols.forEach((s) => engine.updateStock(s, metrics(s, {
      changePercent: 2.4, momentumScore: 60, rvol: 0,
    })));
    const m = engine.compute('PREMARKET', null);
    expect(engine.evaluate(m, 'PREMARKET').stageNumber).toBeGreaterThanOrEqual(1);
  });

  it('applies the premarket multiplier to move thresholds', () => {
    const symbols = ['A', 'B', 'C', 'D'];
    const engine = engineOf(symbols);
    // +1.8% clears the regular +1.5% but not the premarket +2.25%.
    symbols.forEach((s) => engine.updateStock(s, metrics(s, {
      changePercent: 1.8, momentumScore: 60, rvol: 2.0,
    })));
    expect(engine.evaluate(engine.compute('REGULAR', null), 'REGULAR').stageNumber)
      .toBeGreaterThanOrEqual(1);
    expect(engine.evaluate(engine.compute('PREMARKET', null), 'PREMARKET').stageNumber)
      .toBe(0);
  });
});

describe('per-sector overrides', () => {
  it('the memory group triggers stage 1 on two names, where a broad sector needs three', () => {
    const build = (sectorId: string) => {
      const engine = engineOf(['MU', 'SNDK', 'WDC', 'STX'], sectorId);
      engine.updateStock('MU', metrics('MU', { changePercent: 1.9, momentumScore: 65, rvol: 1.8 }));
      engine.updateStock('SNDK', metrics('SNDK', { changePercent: 1.7, momentumScore: 62, rvol: 1.7 }));
      engine.updateStock('WDC', metrics('WDC', { changePercent: 0.2, momentumScore: 25, rvol: 1.4 }));
      engine.updateStock('STX', metrics('STX', { changePercent: 0.1, momentumScore: 22, rvol: 1.3 }));
      return engine;
    };
    const memory = build('memory');
    const generic = build('semiconductors');
    expect(memory.evaluate(memory.compute('REGULAR', null), 'REGULAR').stageNumber).toBe(1);
    expect(generic.evaluate(generic.compute('REGULAR', null), 'REGULAR').stageNumber).toBe(0);
  });
});

describe('cooling lifecycle', () => {
  it('falls to COOLING only after sustained negative acceleration', () => {
    const engine = engineOf(['A', 'B', 'C', 'D']);
    const strong = () => {
      ['A', 'B', 'C', 'D'].forEach((s) => engine.updateStock(s, metrics(s, {
        changePercent: 2.0, momentumScore: 75, rvol: 2.2,
      })));
    };
    strong();
    const hot = engine.compute('REGULAR', null);
    expect(hot.stage).not.toBe('IDLE');

    // Conditions collapse.
    ['A', 'B', 'C', 'D'].forEach((s) => engine.updateStock(s, metrics(s, {
      changePercent: 0.1, momentumScore: 35, rvol: 0.8,
    })));

    const now = Date.now();
    // One negative sample is not cooling — it holds its prior stage.
    expect(engine.compute('REGULAR', 60, now).stage).toBe(hot.stage);

    // Six minutes of decay is.
    engine.markNegativeAccelerationSince(now - 6 * 60_000);
    expect(engine.compute('REGULAR', 60, now).stage).toBe('COOLING');
  });

  it('returns to IDLE once the score decays below the floor', () => {
    const engine = engineOf(['A']);
    engine.setStage('COOLING');
    engine.updateStock('A', metrics('A', { momentumScore: 10, changePercent: -0.5 }));
    expect(engine.compute('REGULAR', 20).stage).toBe('IDLE');
  });
});

describe('config is honoured, not hard-coded', () => {
  it('raising the breadth requirement suppresses a previously qualifying sector', () => {
    const strict = mergeConfig(DEFAULT_CONFIG, {
      sector: { stage1: { minBreadth: 0.95 } },
    });
    const symbols = Array.from({ length: 10 }, (_, i) => `S${i}`);
    const build = (config: typeof DEFAULT_CONFIG) => {
      const engine = new SectorEngine('t', 'T', symbols.map((s) => ({ symbol: s, weight: 1 })), config);
      symbols.forEach((s, i) => engine.updateStock(s, metrics(s, {
        changePercent: i < 8 ? 1.8 : -0.2, momentumScore: i < 8 ? 70 : 20, rvol: 2.0,
      })));
      return engine;
    };
    const loose = build(DEFAULT_CONFIG);
    const tight = build(strict);
    expect(loose.evaluate(loose.compute('REGULAR', null), 'REGULAR').stageNumber).toBeGreaterThanOrEqual(1);
    expect(tight.evaluate(tight.compute('REGULAR', null), 'REGULAR').stageNumber).toBe(0);
  });
});
