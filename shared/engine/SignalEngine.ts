/**
 * Signal construction.
 *
 * Every signal carries a pre-rendered human sentence. That is deliberate: the
 * spec's whole complaint about existing scanners is that "MU +4.7%" makes the
 * trader do the interpretation. A signal here says what happened, how broad it
 * is, and who is leading — in one line, ready to display or speak.
 */

import type { MarketPulseConfig } from '../config';
import { SEVERITY_TO_LEVEL } from '../types';
import type {
  MarketSession, NewsHeadline, SectorMetrics, Signal, SignalSeverity, SignalType,
  StockMetrics,
} from '../types';
import { SignalDeduplicator, type Stage } from './SignalStateMachine';

let sequence = 0;

/** Sortable, collision-resistant id without pulling in a uuid dependency. */
function signalId(prefix: string): string {
  sequence = (sequence + 1) % 1_000_000;
  return `${prefix}_${Date.now().toString(36)}_${sequence.toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

const pct = (n: number): string => `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;
const rvolText = (n: number): string => `${n.toFixed(1)}x`;

/** "45s" / "3m" — never "0m", which reads as though nothing happened. */
const duration = (ms: number): string => {
  const seconds = Math.round(ms / 1000);
  return seconds < 90 ? `${seconds}s` : `${Math.round(seconds / 60)}m`;
};

/** Sector stage -> the signal type and severity that announce it. */
const SECTOR_STAGE_SIGNAL: Record<Stage, { type: SignalType; severity: SignalSeverity } | null> = {
  IDLE: null,
  AWAKENING: { type: 'SECTOR_AWAKENING', severity: 'INFO' },
  ACCELERATING: { type: 'SECTOR_ACCELERATION', severity: 'LOW' },
  BREAKOUT: { type: 'SECTOR_BREAKOUT', severity: 'MEDIUM' },
  COOLING: { type: 'SECTOR_ACCELERATION', severity: 'INFO' },
};

export interface SignalEngineDeps {
  config: MarketPulseConfig;
  deduplicator: SignalDeduplicator;
  /** Recent catalysts by symbol, for the stage-4 escalation rule. */
  recentCatalysts?: Map<string, NewsHeadline>;
}

export class SignalEngine {
  private readonly config: MarketPulseConfig;
  private readonly dedup: SignalDeduplicator;
  private recentCatalysts: Map<string, NewsHeadline>;

  /** Per-symbol memory for the stock-level detectors. */
  /**
   * A short rolling score history per symbol.
   *
   * Acceleration is defined over a window, so comparing against the previous
   * evaluation — which is one tick, often a single second — measures jitter
   * rather than a trend, and reports it as "score +16 in 1s".
   */
  private readonly scoreHistory = new Map<string, Array<{ score: number; at: number }>>();
  private readonly lastAboveVwap = new Map<string, boolean>();
  private readonly announcedHighs = new Map<string, number>();
  private readonly announcedVolumeSpike = new Map<string, number>();
  /** Symbols currently above the momentum threshold, so re-crossing is not re-news. */
  private readonly momentumArmed = new Set<string>();
  private readonly announcedMomentumStart = new Map<string, number>();
  private readonly announcedMomentumAccel = new Map<string, number>();

  constructor(deps: SignalEngineDeps) {
    this.config = deps.config;
    this.dedup = deps.deduplicator;
    this.recentCatalysts = deps.recentCatalysts ?? new Map();
  }

  setRecentCatalysts(map: Map<string, NewsHeadline>): void {
    this.recentCatalysts = map;
  }

  // -------------------------------------------------------------------------
  // Sector signals
  // -------------------------------------------------------------------------

  /**
   * Emit at most one signal for a sector's current state. Returns null when the
   * deduplicator decides this is a repeat.
   */
  evaluateSector(
    metrics: SectorMetrics,
    session: MarketSession,
    now = Date.now(),
  ): Signal | null {
    const decision = this.dedup.shouldEmit(
      `sector:${metrics.sectorId}`,
      metrics.stage,
      metrics.score,
      now,
    );
    if (!decision.emit) return null;

    const mapping = SECTOR_STAGE_SIGNAL[metrics.stage];
    if (!mapping) return null;

    const catalyst = this.correlatedCatalyst(metrics, now);
    const severity = this.escalate(metrics, mapping.severity, catalyst !== null);

    return {
      id: signalId('sig'),
      symbol: null,
      sectorId: metrics.sectorId,
      sectorName: metrics.sectorName,
      type: metrics.stage === 'COOLING' ? 'SECTOR_ACCELERATION' : mapping.type,
      severity,
      score: metrics.score,
      triggerValue: metrics.changePercent,
      previousValue: metrics.changePercent - metrics.acceleration,
      headline: this.sectorHeadline(metrics, decision.reason === 'COOLING', catalyst),
      metadata: {
        breadth: metrics.breadth,
        advancing: metrics.advancing,
        active: metrics.active,
        avgRvol: metrics.avgRvol,
        newHighCount: metrics.newHighCount,
        acceleration: metrics.acceleration,
        leaders: metrics.leaders,
        stageFrom: decision.previousStage,
        stageTo: metrics.stage,
        alertLevel: SEVERITY_TO_LEVEL[severity],
        session,
        ...(catalyst
          ? {
              catalyst: {
                headline: catalyst.headline,
                url: catalyst.url,
                source: catalyst.source,
                catalystType: catalyst.catalystType,
              },
            }
          : {}),
      },
      createdAt: new Date(now).toISOString(),
    };
  }

  /**
   * A stage-4 move that arrives with a matching headline is the strongest thing
   * this system can say, so it is the only route to CRITICAL.
   */
  private escalate(
    metrics: SectorMetrics,
    base: SignalSeverity,
    hasCatalyst: boolean,
  ): SignalSeverity {
    if (metrics.stage !== 'BREAKOUT') return base;

    const stage4 = this.config.sector.stage4;
    const isMajor =
      metrics.changePercent >= stage4.minSectorAvgMovePct &&
      metrics.strongLeaderCount >= stage4.minStrongLeaders &&
      metrics.avgRvol >= stage4.minAvgRvol &&
      metrics.newHighCount >= stage4.minNewHighs;

    if (!isMajor) return base;
    return hasCatalyst ? 'CRITICAL' : 'HIGH';
  }

  /** A catalyst on any constituent, inside the configured window. */
  private correlatedCatalyst(metrics: SectorMetrics, now: number): NewsHeadline | null {
    const windowMs = this.config.sector.catalystWindowMinutes * 60_000;
    for (const leader of metrics.leaders) {
      const news = this.recentCatalysts.get(leader.symbol);
      if (news && now - new Date(news.publishedAt).getTime() <= windowMs) return news;
    }
    for (const news of this.recentCatalysts.values()) {
      if (news.sectorIds.includes(metrics.sectorId) &&
          now - new Date(news.publishedAt).getTime() <= windowMs) {
        return news;
      }
    }
    return null;
  }

  /**
   * The sentence the spec asked for, in place of "MU +4.7%":
   * "SEMICONDUCTORS AWAKENING: 8/12 advancing. Sector +2.1%, avg RVOL 2.3x.
   *  Leaders: MU +4.7%, SNDK +5.1%. 2 new intraday highs."
   */
  private sectorHeadline(
    m: SectorMetrics,
    cooling: boolean,
    catalyst: NewsHeadline | null,
  ): string {
    const name = m.sectorName.toUpperCase();

    if (cooling) {
      return `${name} COOLING: momentum fading, score ${m.score.toFixed(0)} (${m.acceleration.toFixed(0)} over 5m). ${m.advancing}/${m.active} still advancing.`;
    }

    const label =
      m.stage === 'AWAKENING' ? 'AWAKENING'
      : m.stage === 'ACCELERATING' ? 'CONFIRMED'
      : 'BREAKOUT';

    const parts = [
      `${name} ${label}: ${m.advancing}/${m.active} advancing.`,
      `Sector ${pct(m.changePercent)}, avg RVOL ${rvolText(m.avgRvol)}.`,
    ];

    if (m.leaders.length) {
      const leaders = m.leaders
        .slice(0, 3)
        .map((l) => `${l.symbol} ${pct(l.changePercent)}`)
        .join(', ');
      parts.push(`Leaders: ${leaders}.`);
    }
    if (m.newHighCount > 0) {
      parts.push(`${m.newHighCount} new intraday high${m.newHighCount === 1 ? '' : 's'}.`);
    }
    if (catalyst) {
      parts.push(`Catalyst: ${catalyst.headline}`);
    }
    return parts.join(' ');
  }

  // -------------------------------------------------------------------------
  // Stock signals
  // -------------------------------------------------------------------------

  /**
   * Stock-level detectors. These are the supporting cast — the sector signals
   * are the headline act — so they stay at INFO/LOW severity and are heavily
   * rate limited.
   */
  evaluateStock(
    m: StockMetrics,
    sectorId: string | null,
    sectorName: string | null,
    session: MarketSession,
    now = Date.now(),
  ): Signal[] {
    const out: Signal[] = [];
    const make = (
      type: SignalType,
      severity: SignalSeverity,
      triggerValue: number,
      previousValue: number | null,
      headline: string,
    ): Signal => ({
      id: signalId('stk'),
      symbol: m.symbol,
      sectorId,
      sectorName,
      type,
      severity,
      score: m.momentumScore,
      triggerValue,
      previousValue,
      headline,
      metadata: {
        rvol: m.rvol,
        changePercent: m.changePercent,
        volumeAcceleration: m.volumeAcceleration,
        vwapDistance: m.vwapDistance,
        alertLevel: SEVERITY_TO_LEVEL[severity],
        session,
      },
      createdAt: new Date(now).toISOString(),
    });

    const { stock } = this.config;
    const windowMs = stock.momentumAccelWindowMinutes * 60_000;

    const history = this.scoreHistory.get(m.symbol) ?? [];
    // Everything still inside the window, oldest first.
    const inWindow = history.filter((sample) => now - sample.at <= windowMs);
    const previous = inWindow[0];
    const lastSample = history[history.length - 1];

    // MOMENTUM_START — the upward crossing, once.
    //
    // Guarded two ways. A hysteresis band means the score must drop well back
    // below the threshold before this can fire again, so a stock hovering at
    // the boundary does not emit on every tick; and a cooldown bounds it even
    // if the score does genuinely round-trip.
    const armed = this.momentumArmed.has(m.symbol);
    if (m.momentumScore >= stock.momentumStartScore && !armed) {
      this.momentumArmed.add(m.symbol);
      const lastAt = this.announcedMomentumStart.get(m.symbol) ?? 0;
      if (now - lastAt > this.config.dedup.cooldownMs) {
        this.announcedMomentumStart.set(m.symbol, now);
        out.push(make(
          'MOMENTUM_START', 'LOW', m.momentumScore, previous?.score ?? null,
          `${m.symbol} momentum building: score ${m.momentumScore.toFixed(0)}, ${pct(m.changePercent)} on ${rvolText(m.rvol)} volume.`,
        ));
      }
    } else if (armed && m.momentumScore < stock.momentumStartScore - stock.momentumStartHysteresis) {
      this.momentumArmed.delete(m.symbol);
    }

    // MOMENTUM_ACCELERATION — a large score gain inside the window.
    //
    // Cooled down like the others: a stock climbing steadily satisfies this on
    // every evaluation, and the feed fills with the same claim about the same
    // symbol seconds apart.
    // Requires a real span of observation, not just two adjacent ticks.
    const MIN_SPAN_MS = 30_000;
    if (previous) {
      const elapsedMs = now - previous.at;
      const delta = m.momentumScore - previous.score;
      const lastAt = this.announcedMomentumAccel.get(m.symbol) ?? 0;
      if (
        elapsedMs >= MIN_SPAN_MS &&
        delta >= stock.momentumAccelDelta &&
        now - lastAt > this.config.dedup.cooldownMs
      ) {
        this.announcedMomentumAccel.set(m.symbol, now);
        out.push(make(
          'MOMENTUM_ACCELERATION', 'MEDIUM', m.momentumScore, previous.score,
          `${m.symbol} accelerating: score +${delta.toFixed(0)} in ${duration(elapsedMs)} to ${m.momentumScore.toFixed(0)}, now ${pct(m.changePercent)}.`,
        ));
      }
    }
    // Sampled sparsely — one point every few seconds is plenty for a
    // five-minute window, and keeps this bounded across 250 symbols.
    if (!lastSample || now - lastSample.at >= 5_000) {
      this.scoreHistory.set(m.symbol, [...inWindow, { score: m.momentumScore, at: now }]);
    } else {
      this.scoreHistory.set(m.symbol, inWindow.length ? inWindow : [{ score: m.momentumScore, at: now }]);
    }

    // VOLUME_SPIKE — rate limited, since RVOL stays elevated once it spikes.
    if (m.rvol >= stock.volumeSpikeRvol) {
      const lastAt = this.announcedVolumeSpike.get(m.symbol) ?? 0;
      if (now - lastAt > this.config.dedup.cooldownMs) {
        this.announcedVolumeSpike.set(m.symbol, now);
        out.push(make(
          'VOLUME_SPIKE', 'LOW', m.rvol, null,
          `${m.symbol} unusual volume: ${rvolText(m.rvol)} normal for this time of day, ${pct(m.changePercent)}.`,
        ));
      }
    }

    // NEW_HIGH — once per high, not once per tick above it.
    if (m.isNewHigh) {
      const lastAt = this.announcedHighs.get(m.symbol) ?? 0;
      if (now - lastAt > this.config.dedup.intraStageUpdateMs) {
        this.announcedHighs.set(m.symbol, now);
        out.push(make(
          'NEW_HIGH', 'LOW', m.dayHigh, null,
          `${m.symbol} new intraday high ${m.dayHigh.toFixed(2)} (${pct(m.changePercent)}).`,
        ));
      }
    }

    // VWAP_BREAK — the crossing itself, and only with volume behind it.
    const wasAbove = this.lastAboveVwap.get(m.symbol);
    if (wasAbove !== undefined && wasAbove !== m.aboveVwap && m.rvol >= stock.vwapBreakMinRvol) {
      out.push(make(
        'VWAP_BREAK', 'INFO', m.vwap, null,
        `${m.symbol} crossed ${m.aboveVwap ? 'above' : 'below'} VWAP ${m.vwap.toFixed(2)} on ${rvolText(m.rvol)} volume.`,
      ));
    }
    this.lastAboveVwap.set(m.symbol, m.aboveVwap);

    return out;
  }

  // -------------------------------------------------------------------------
  // Catalyst signals
  // -------------------------------------------------------------------------

  /**
   * A headline only becomes a signal when the market is already agreeing with
   * it. News on a flat sector gets stored and tagged, not alerted — that is the
   * "stock is moving" versus "stock is moving because something happened"
   * distinction the spec insists on.
   */
  catalystSignal(
    news: NewsHeadline,
    sector: SectorMetrics,
    now = Date.now(),
  ): Signal | null {
    if (sector.score < this.config.sector.catalystCorrelationScore) return null;
    if (!this.dedup.allowIntraStageUpdate(`catalyst:${sector.sectorId}:${news.id}`, now)) return null;

    const symbol = news.symbols.find((s) => sector.leaders.some((l) => l.symbol === s)) ?? news.symbols[0] ?? null;

    return {
      id: signalId('cat'),
      symbol,
      sectorId: sector.sectorId,
      sectorName: sector.sectorName,
      type: 'CATALYST',
      severity: 'HIGH',
      score: sector.score,
      triggerValue: sector.score,
      previousValue: null,
      headline: `${sector.sectorName.toUpperCase()} catalyst — ${news.headline}${symbol ? ` (${symbol})` : ''}. Sector ${pct(sector.changePercent)}, ${sector.advancing}/${sector.active} advancing.`,
      metadata: {
        breadth: sector.breadth,
        advancing: sector.advancing,
        active: sector.active,
        avgRvol: sector.avgRvol,
        leaders: sector.leaders,
        alertLevel: SEVERITY_TO_LEVEL.HIGH,
        catalyst: {
          headline: news.headline,
          url: news.url,
          source: news.source,
          catalystType: news.catalystType,
        },
      },
      createdAt: new Date(now).toISOString(),
    };
  }
}
