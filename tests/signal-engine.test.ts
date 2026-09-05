import { beforeEach, describe, expect, it } from 'vitest';
import { SignalDeduplicator } from '@shared/engine/SignalStateMachine';
import { SignalEngine } from '@shared/engine/SignalEngine';
import { classifyCatalyst, extractSymbols, NewsCatalystEngine } from '@shared/engine/NewsCatalystEngine';
import { DEFAULT_CONFIG } from '@shared/config';
import type { NewsHeadline, SectorMetrics, StockMetrics } from '@shared/types';

const MINUTE = 60_000;

function sector(over: Partial<SectorMetrics> = {}): SectorMetrics {
  return {
    sectorId: 'semiconductors', sectorName: 'AI / Semiconductors',
    score: 70, changePercent: 2.0, breadth: 0.8, advancing: 8, active: 10,
    avgRvol: 2.4, avgMomentum: 68, aboveVwapCount: 8, newHighCount: 2,
    volumeAcceleration: 2.1, acceleration: 12, strongLeaderCount: 3,
    leaders: [
      { symbol: 'MU', changePercent: 5.8, rvol: 3.4, momentumScore: 95, isNewHigh: true },
      { symbol: 'SNDK', changePercent: 5.2, rvol: 3.1, momentumScore: 91, isNewHigh: true },
      { symbol: 'WDC', changePercent: 4.7, rvol: 2.8, momentumScore: 88, isNewHigh: false },
    ],
    stage: 'AWAKENING', updatedAt: Date.now(), ...over,
  };
}

function stock(symbol: string, over: Partial<StockMetrics> = {}): StockMetrics {
  return {
    symbol, price: 100, previousClose: 100, changePercent: 0,
    change1m: 0, change5m: 0, change15m: 0, volume: 10_000, rvol: 1,
    volumeAcceleration: 1, vwap: 100, vwapDistance: 0, aboveVwap: false,
    dayHigh: 100, dayLow: 100, distanceFromHigh: 0, isNewHigh: false,
    volatility: 1, momentumScore: 0, stage: 'IDLE', updatedAt: Date.now(), ...over,
  };
}

describe('deduplication — the "100 identical alerts" requirement', () => {
  let dedup: SignalDeduplicator;
  beforeEach(() => { dedup = new SignalDeduplicator(DEFAULT_CONFIG); });

  it('emits once on entering a stage and stays silent while it holds', () => {
    const t0 = Date.now();
    expect(dedup.shouldEmit('sector:s', 'BREAKOUT', 80, t0).emit).toBe(true);
    // Twenty minutes of the same condition, sampled every second.
    let emissions = 0;
    for (let i = 1; i <= 20 * 60; i++) {
      if (dedup.shouldEmit('sector:s', 'BREAKOUT', 80, t0 + i * 1000).emit) emissions++;
    }
    expect(emissions).toBe(0);
  });

  it('always emits on escalation', () => {
    const t0 = Date.now();
    expect(dedup.shouldEmit('sector:s', 'AWAKENING', 50, t0).emit).toBe(true);
    expect(dedup.shouldEmit('sector:s', 'ACCELERATING', 62, t0 + 1000).emit).toBe(true);
    expect(dedup.shouldEmit('sector:s', 'BREAKOUT', 80, t0 + 2000).emit).toBe(true);
  });

  it('re-emits in the same stage only after the cooldown AND a real improvement', () => {
    const t0 = Date.now();
    dedup.shouldEmit('sector:s', 'BREAKOUT', 80, t0);

    // Past the cooldown but barely better — below the 5-point delta.
    expect(dedup.shouldEmit('sector:s', 'BREAKOUT', 83, t0 + 4 * MINUTE).emit).toBe(false);
    // Much better, but still inside the cooldown.
    expect(dedup.shouldEmit('sector:s', 'BREAKOUT', 95, t0 + MINUTE).emit).toBe(false);
    // Both conditions met.
    expect(dedup.shouldEmit('sector:s', 'BREAKOUT', 95, t0 + 4 * MINUTE).emit).toBe(true);
  });

  it('emits once when an active sector rolls over into cooling', () => {
    const t0 = Date.now();
    dedup.shouldEmit('sector:s', 'BREAKOUT', 80, t0);
    expect(dedup.shouldEmit('sector:s', 'COOLING', 40, t0 + MINUTE).emit).toBe(true);
    expect(dedup.shouldEmit('sector:s', 'COOLING', 38, t0 + 2 * MINUTE).emit).toBe(false);
  });

  it('never announces a return to idle', () => {
    const t0 = Date.now();
    dedup.shouldEmit('sector:s', 'AWAKENING', 55, t0);
    expect(dedup.shouldEmit('sector:s', 'IDLE', 10, t0 + MINUTE).emit).toBe(false);
  });

  it('allows a fresh cycle after the sector has gone quiet', () => {
    const t0 = Date.now();
    dedup.shouldEmit('sector:s', 'BREAKOUT', 80, t0);
    dedup.shouldEmit('sector:s', 'COOLING', 40, t0 + MINUTE);
    dedup.shouldEmit('sector:s', 'IDLE', 20, t0 + 2 * MINUTE);
    // A new move later that day must be reported.
    expect(dedup.shouldEmit('sector:s', 'AWAKENING', 60, t0 + 60 * MINUTE).emit).toBe(true);
  });

  it('tracks sectors independently', () => {
    const t0 = Date.now();
    expect(dedup.shouldEmit('sector:a', 'AWAKENING', 55, t0).emit).toBe(true);
    expect(dedup.shouldEmit('sector:b', 'AWAKENING', 55, t0).emit).toBe(true);
  });

  it('rate-limits intra-stage colour to once a minute', () => {
    const t0 = Date.now();
    expect(dedup.allowIntraStageUpdate('k', t0)).toBe(true);
    expect(dedup.allowIntraStageUpdate('k', t0 + 30_000)).toBe(false);
    expect(dedup.allowIntraStageUpdate('k', t0 + 61_000)).toBe(true);
  });
});

describe('sector signals', () => {
  let engine: SignalEngine;
  beforeEach(() => {
    engine = new SignalEngine({
      config: DEFAULT_CONFIG,
      deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
    });
  });

  it('renders the contextual sentence the spec asks for, not a bare price', () => {
    const signal = engine.evaluateSector(sector({ stage: 'AWAKENING' }), 'REGULAR')!;
    expect(signal).not.toBeNull();
    expect(signal.headline).toContain('AI / SEMICONDUCTORS AWAKENING');
    expect(signal.headline).toContain('8/10 advancing');
    expect(signal.headline).toContain('avg RVOL 2.4x');
    expect(signal.headline).toContain('MU +5.8%');
    expect(signal.headline).toContain('2 new intraday highs');
  });

  it('carries the supporting metrics that justify it', () => {
    const signal = engine.evaluateSector(sector(), 'REGULAR')!;
    expect(signal.metadata.breadth).toBeCloseTo(0.8, 6);
    expect(signal.metadata.advancing).toBe(8);
    expect(signal.metadata.avgRvol).toBeCloseTo(2.4, 6);
    expect(signal.metadata.leaders).toHaveLength(3);
    expect(signal.metadata.stageFrom).toBe('IDLE');
    expect(signal.metadata.stageTo).toBe('AWAKENING');
  });

  it('gives every signal a unique id', () => {
    const ids = new Set<string>();
    for (let i = 0; i < 200; i++) {
      const e = new SignalEngine({ config: DEFAULT_CONFIG, deduplicator: new SignalDeduplicator(DEFAULT_CONFIG) });
      ids.add(e.evaluateSector(sector(), 'REGULAR')!.id);
    }
    expect(ids.size).toBe(200);
  });

  it('maps stage to signal type and alert level', () => {
    const awakening = engine.evaluateSector(sector({ stage: 'AWAKENING' }), 'REGULAR')!;
    expect(awakening.type).toBe('SECTOR_AWAKENING');
    expect(awakening.severity).toBe('INFO');
    expect(awakening.metadata.alertLevel).toBe(1);

    const breakout = engine.evaluateSector(sector({ stage: 'BREAKOUT' }), 'REGULAR')!;
    expect(breakout.type).toBe('SECTOR_BREAKOUT');
    expect(breakout.metadata.alertLevel).toBeGreaterThanOrEqual(3);
  });

  it('reserves CRITICAL for a major move that arrives with a catalyst', () => {
    const major = sector({
      stage: 'BREAKOUT', changePercent: 3.6, strongLeaderCount: 7,
      avgRvol: 3.4, newHighCount: 3,
    });

    const withoutNews = new SignalEngine({
      config: DEFAULT_CONFIG, deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
    }).evaluateSector(major, 'REGULAR')!;
    expect(withoutNews.severity).toBe('HIGH');

    const news: NewsHeadline = {
      id: 'n1', headline: 'TSMC raises guidance on AI memory demand',
      source: 'Reuters', url: 'https://example.com/1',
      publishedAt: new Date().toISOString(), catalystType: 'GUIDANCE',
      symbols: ['MU'], sectorIds: ['semiconductors'],
    };
    const withNews = new SignalEngine({
      config: DEFAULT_CONFIG,
      deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
      recentCatalysts: new Map([['MU', news]]),
    }).evaluateSector(major, 'REGULAR')!;
    expect(withNews.severity).toBe('CRITICAL');
    expect(withNews.headline).toContain('Catalyst:');
  });

  it('does not escalate an ordinary breakout to CRITICAL just because news exists', () => {
    const news: NewsHeadline = {
      id: 'n2', headline: 'Micron announces new product line',
      source: 'PR', url: 'https://example.com/2',
      publishedAt: new Date().toISOString(), catalystType: 'PRODUCT',
      symbols: ['MU'], sectorIds: ['semiconductors'],
    };
    const modest = new SignalEngine({
      config: DEFAULT_CONFIG,
      deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
      recentCatalysts: new Map([['MU', news]]),
    }).evaluateSector(sector({ stage: 'BREAKOUT', changePercent: 2.1, strongLeaderCount: 3, avgRvol: 2.6 }), 'REGULAR')!;
    expect(modest.severity).toBe('MEDIUM');
  });
});

describe('stock signals', () => {
  let engine: SignalEngine;
  beforeEach(() => {
    engine = new SignalEngine({
      config: DEFAULT_CONFIG, deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
    });
  });

  it('fires MOMENTUM_START on the upward crossing only', () => {
    const t0 = Date.now();
    expect(engine.evaluateStock(stock('MU', { momentumScore: 30 }), 's', 'S', 'REGULAR', t0)
      .some((s) => s.type === 'MOMENTUM_START')).toBe(false);
    expect(engine.evaluateStock(stock('MU', { momentumScore: 60 }), 's', 'S', 'REGULAR', t0 + 1000)
      .some((s) => s.type === 'MOMENTUM_START')).toBe(true);
    // Still above, but no longer a crossing.
    expect(engine.evaluateStock(stock('MU', { momentumScore: 62 }), 's', 'S', 'REGULAR', t0 + 2000)
      .some((s) => s.type === 'MOMENTUM_START')).toBe(false);
  });

  it('fires MOMENTUM_ACCELERATION on a fast score gain', () => {
    const t0 = Date.now();
    engine.evaluateStock(stock('MU', { momentumScore: 40 }), 's', 'S', 'REGULAR', t0);
    const out = engine.evaluateStock(stock('MU', { momentumScore: 70 }), 's', 'S', 'REGULAR', t0 + 2 * MINUTE);
    expect(out.some((s) => s.type === 'MOMENTUM_ACCELERATION')).toBe(true);
  });

  it('rate-limits VOLUME_SPIKE while RVOL stays elevated', () => {
    const t0 = Date.now();
    const hot = stock('MU', { rvol: 4.0, changePercent: 3 });
    let spikes = 0;
    for (let i = 0; i < 120; i++) {
      if (engine.evaluateStock(hot, 's', 'S', 'REGULAR', t0 + i * 1000)
        .some((s) => s.type === 'VOLUME_SPIKE')) spikes++;
    }
    expect(spikes).toBe(1);
  });

  it('fires VWAP_BREAK on the crossing, with volume, and not on the first sighting', () => {
    const t0 = Date.now();
    // First observation establishes a baseline; it must not emit.
    expect(engine.evaluateStock(stock('MU', { aboveVwap: false, rvol: 2 }), 's', 'S', 'REGULAR', t0)
      .some((s) => s.type === 'VWAP_BREAK')).toBe(false);
    expect(engine.evaluateStock(stock('MU', { aboveVwap: true, rvol: 2 }), 's', 'S', 'REGULAR', t0 + 1000)
      .some((s) => s.type === 'VWAP_BREAK')).toBe(true);
  });

  it('suppresses VWAP_BREAK without volume behind it', () => {
    const t0 = Date.now();
    engine.evaluateStock(stock('MU', { aboveVwap: false, rvol: 0.8 }), 's', 'S', 'REGULAR', t0);
    expect(engine.evaluateStock(stock('MU', { aboveVwap: true, rvol: 0.8 }), 's', 'S', 'REGULAR', t0 + 1000)
      .some((s) => s.type === 'VWAP_BREAK')).toBe(false);
  });
});

describe('news and catalyst classification', () => {
  it('classifies the spec\'s catalyst categories', () => {
    expect(classifyCatalyst('Micron reports Q3 earnings beat')).toBe('EARNINGS');
    expect(classifyCatalyst('Nvidia raises outlook for datacenter revenue')).toBe('GUIDANCE');
    expect(classifyCatalyst('FDA grants approval for Moderna vaccine')).toBe('FDA');
    expect(classifyCatalyst('AMD to acquire ZT Systems')).toBe('M_AND_A');
    expect(classifyCatalyst('Goldman upgrades Micron to buy rating')).toBe('ANALYST');
    expect(classifyCatalyst('Lockheed awarded $2bn defense contract')).toBe('CONTRACT');
    expect(classifyCatalyst('US tightens export controls on chip equipment')).toBe('REGULATORY');
    expect(classifyCatalyst('Fed signals rate cut as CPI cools')).toBe('MACRO');
    expect(classifyCatalyst('Company announces quarterly dividend')).toBe('OTHER');
  });

  it('prefers the specific class over the broad one', () => {
    // Mentions AI, but it is fundamentally an earnings story.
    expect(classifyCatalyst('Nvidia Q4 earnings beat on AI GPU demand')).toBe('EARNINGS');
  });

  it('extracts tickers without matching English words', () => {
    const universe = new Set(['MU', 'NVDA', 'ON', 'ALL', 'STX']);
    expect(extractSymbols('Micron (MU) surges on memory pricing', universe)).toEqual(['MU']);
    expect(extractSymbols('$NVDA leads the tape higher', universe)).toContain('NVDA');
    // "ON" and "ALL" are words here, not tickers — matching them would produce
    // a constant stream of false catalysts.
    expect(extractSymbols('All eyes on the print', universe)).toEqual([]);
  });

  it('trusts provider-tagged symbols even when the text does not name them', () => {
    const universe = new Set(['MU']);
    expect(extractSymbols('Memory prices climb again', universe, ['MU'])).toEqual(['MU']);
  });

  it('maps a headline to every sector its symbols belong to', () => {
    const news = new NewsCatalystEngine([
      { id: 'semis', name: 'Semis', description: '', active: true, constituents: [{ symbol: 'MU', weight: 1 }] },
      { id: 'memory', name: 'Memory', description: '', active: true, constituents: [{ symbol: 'MU', weight: 1 }] },
    ]);
    const item = news.ingest({
      headline: 'Micron (MU) raises guidance', source: 'Reuters', url: 'https://x/1',
    })!;
    expect(item.sectorIds.sort()).toEqual(['memory', 'semis']);
    expect(item.catalystType).toBe('GUIDANCE');
  });

  it('drops duplicate headlines by url', () => {
    const news = new NewsCatalystEngine([
      { id: 's', name: 'S', description: '', active: true, constituents: [{ symbol: 'MU', weight: 1 }] },
    ]);
    expect(news.ingest({ headline: '$MU up', source: 'x', url: 'https://x/1' })).not.toBeNull();
    expect(news.ingest({ headline: '$MU up', source: 'x', url: 'https://x/1' })).toBeNull();
  });

  it('ignores headlines with no universe symbol', () => {
    const news = new NewsCatalystEngine([
      { id: 's', name: 'S', description: '', active: true, constituents: [{ symbol: 'MU', weight: 1 }] },
    ]);
    expect(news.ingest({ headline: 'Unrelated market commentary', source: 'x', url: 'https://x/2' })).toBeNull();
  });
});

describe('catalyst correlation — "moving" vs "moving because"', () => {
  const news: NewsHeadline = {
    id: 'n', headline: 'Micron raises guidance on HBM demand', source: 'Reuters',
    url: 'https://x/1', publishedAt: new Date().toISOString(),
    catalystType: 'GUIDANCE', symbols: ['MU'], sectorIds: ['semiconductors'],
  };

  it('emits a catalyst signal when the sector is already moving', () => {
    const engine = new SignalEngine({
      config: DEFAULT_CONFIG, deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
    });
    const signal = engine.catalystSignal(news, sector({ score: 72 }));
    expect(signal).not.toBeNull();
    expect(signal!.type).toBe('CATALYST');
    expect(signal!.severity).toBe('HIGH');
    expect(signal!.symbol).toBe('MU');
  });

  it('stays silent on news to a quiet sector', () => {
    const engine = new SignalEngine({
      config: DEFAULT_CONFIG, deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
    });
    expect(engine.catalystSignal(news, sector({ score: 20 }))).toBeNull();
  });
});

describe('momentum threshold hysteresis', () => {
  /**
   * Regression: a score hovering at the threshold re-fired MOMENTUM_START on
   * every upward crossing. One symbol produced 25 identical alerts in five
   * minutes — the exact failure the spec's state machine exists to prevent.
   */
  it('does not re-fire while a score oscillates around the threshold', () => {
    const engine = new SignalEngine({
      config: DEFAULT_CONFIG, deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
    });
    const t0 = Date.now();
    const threshold = DEFAULT_CONFIG.stock.momentumStartScore;

    let fired = 0;
    // Wobble either side of the threshold for five minutes.
    for (let i = 0; i < 300; i++) {
      const score = threshold + (i % 2 === 0 ? 2 : -2);
      const signals = engine.evaluateStock(
        stock('MCHP', { momentumScore: score }), 's', 'S', 'REGULAR', t0 + i * 1000,
      );
      fired += signals.filter((s) => s.type === 'MOMENTUM_START').length;
    }

    expect(fired).toBe(1);
  });

  it('re-arms only after the score falls clear of the hysteresis band', () => {
    const engine = new SignalEngine({
      config: DEFAULT_CONFIG, deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
    });
    const t0 = Date.now();
    const { momentumStartScore, momentumStartHysteresis } = DEFAULT_CONFIG.stock;

    const fire = (score: number, at: number) =>
      engine.evaluateStock(stock('MU', { momentumScore: score }), 's', 'S', 'REGULAR', at)
        .some((s) => s.type === 'MOMENTUM_START');

    expect(fire(momentumStartScore + 5, t0)).toBe(true);

    // Falling only just below the threshold does not re-arm it.
    fire(momentumStartScore - 2, t0 + 60_000);
    expect(fire(momentumStartScore + 5, t0 + 120_000)).toBe(false);

    // Falling clear of the band does — after the cooldown.
    fire(momentumStartScore - momentumStartHysteresis - 5, t0 + 180_000);
    expect(fire(momentumStartScore + 5, t0 + 400_000)).toBe(true);
  });
});

describe('momentum acceleration', () => {
  it('is rate limited for a stock that climbs steadily', () => {
    const engine = new SignalEngine({
      config: DEFAULT_CONFIG, deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
    });
    const t0 = Date.now();

    let fired = 0;
    // A score marching from 20 to 95 over two minutes, evaluated every second.
    for (let i = 0; i <= 120; i++) {
      const signals = engine.evaluateStock(
        stock('GFS', { momentumScore: 20 + i * 0.625 }), 's', 'S', 'REGULAR', t0 + i * 1000,
      );
      fired += signals.filter((s) => s.type === 'MOMENTUM_ACCELERATION').length;
    }

    expect(fired).toBeLessThanOrEqual(1);
  });

  it('phrases sub-minute intervals in seconds, never as "0m"', () => {
    const engine = new SignalEngine({
      config: DEFAULT_CONFIG, deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
    });
    const t0 = Date.now();
    engine.evaluateStock(stock('MU', { momentumScore: 30 }), 's', 'S', 'REGULAR', t0);
    const signal = engine.evaluateStock(
      stock('MU', { momentumScore: 70 }), 's', 'S', 'REGULAR', t0 + 40_000,
    ).find((s) => s.type === 'MOMENTUM_ACCELERATION')!;

    expect(signal.headline).toContain('40s');
    expect(signal.headline).not.toContain('0m');
  });
});

describe('acceleration is measured over a window, not between ticks', () => {
  /**
   * Regression: the detector compared each evaluation with the immediately
   * previous one, so a one-second jump reported "score +16 in 1s" — jitter
   * dressed up as a trend.
   */
  it('ignores a large jump between two adjacent evaluations', () => {
    const engine = new SignalEngine({
      config: DEFAULT_CONFIG, deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
    });
    const t0 = Date.now();
    engine.evaluateStock(stock('TSM', { momentumScore: 40 }), 's', 'S', 'REGULAR', t0);
    const out = engine.evaluateStock(stock('TSM', { momentumScore: 80 }), 's', 'S', 'REGULAR', t0 + 1_000);
    expect(out.some((s) => s.type === 'MOMENTUM_ACCELERATION')).toBe(false);
  });

  it('reports the span actually observed', () => {
    const engine = new SignalEngine({
      config: DEFAULT_CONFIG, deduplicator: new SignalDeduplicator(DEFAULT_CONFIG),
    });
    const t0 = Date.now();

    // Sampled every 10 seconds, climbing slowly, over three minutes.
    let signal;
    for (let i = 0; i <= 18; i++) {
      const found = engine.evaluateStock(
        stock('MU', { momentumScore: 40 + i * 2 }), 's', 'S', 'REGULAR', t0 + i * 10_000,
      ).find((s) => s.type === 'MOMENTUM_ACCELERATION');
      if (found && !signal) signal = found;
    }

    expect(signal).toBeDefined();
    // The gain is real and spans minutes, not one tick.
    expect(signal!.headline).toMatch(/in \d+[ms]/);
    expect(signal!.headline).not.toMatch(/in [0-9]s\b/);
    expect(signal!.previousValue).toBeLessThan(signal!.score - DEFAULT_CONFIG.stock.momentumAccelDelta + 1);
  });
});
