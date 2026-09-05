/**
 * MarketPulse shared domain types.
 *
 * These are the contract between the market worker (which computes everything)
 * and the Next.js application (which only ever renders). Nothing in here may
 * import from `next`, `ioredis` or `@prisma/client` — it is consumed by both
 * runtimes and by the test suite.
 */

// ---------------------------------------------------------------------------
// Raw provider-level market data
// ---------------------------------------------------------------------------

export interface Quote {
  symbol: string;
  bidPrice: number;
  bidSize: number;
  askPrice: number;
  askSize: number;
  timestamp: number;
}

export interface Trade {
  symbol: string;
  price: number;
  size: number;
  timestamp: number;
  conditions?: string[];
}

export interface Bar {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  vwap?: number;
  timestamp: number;
}

export interface Snapshot extends Quote {
  volume: number;
  vwap: number;
  lastPrice: number;
  previousClose: number;
}

export type MarketDataHandler<T> = (data: T) => void | Promise<void>;

export type Timeframe = '1m' | '5m' | '15m' | '1d';

/**
 * The single seam between the scanner and any market data vendor. Adding
 * Alpaca or Finnhub later means implementing this interface and changing one
 * line of provider construction — no engine code moves.
 */
export interface IMarketDataProvider {
  readonly providerName: string;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  subscribeQuotes(symbols: string[], handler: MarketDataHandler<Quote>): Promise<void>;
  subscribeTrades(symbols: string[], handler: MarketDataHandler<Trade>): Promise<void>;
  unsubscribe(symbols: string[]): Promise<void>;
  getSnapshot(symbol: string): Promise<Snapshot>;
  getHistoricalBars(symbol: string, timeframe: Timeframe, limit: number): Promise<Bar[]>;
  /** Emitted when the underlying transport drops, so the worker can reconnect. */
  onDisconnect(handler: (reason: string) => void): void;
}

// ---------------------------------------------------------------------------
// Market session
// ---------------------------------------------------------------------------

export type MarketSession = 'PREMARKET' | 'REGULAR' | 'AFTER_HOURS' | 'CLOSED';

// ---------------------------------------------------------------------------
// Computed stock state
// ---------------------------------------------------------------------------

export interface StockMetrics {
  symbol: string;
  price: number;
  previousClose: number;
  /** Percent change vs previous official close. */
  changePercent: number;
  change1m: number;
  change5m: number;
  change15m: number;
  volume: number;
  /** Time-of-day normalised relative volume. 1.0 == exactly typical. */
  rvol: number;
  /** 5-minute volume rate over the preceding 15-minute rate. */
  volumeAcceleration: number;
  vwap: number;
  /** Percent distance of price from VWAP. Positive == above. */
  vwapDistance: number;
  aboveVwap: boolean;
  dayHigh: number;
  dayLow: number;
  /** Percent below the intraday high. 0 == sitting at the high. */
  distanceFromHigh: number;
  /** True when a new intraday high was printed inside NEW_HIGH_WINDOW_MS. */
  isNewHigh: boolean;
  /** Realised 5-minute volatility over the 20-day baseline. */
  volatility: number;
  momentumScore: number;
  stage: StockStage;
  updatedAt: number;
}

export type StockStage = 'IDLE' | 'AWAKENING' | 'ACCELERATING' | 'BREAKOUT' | 'COOLING';

/** Per-component breakdown, retained so the UI can explain a score. */
export interface MomentumBreakdown {
  total: number;
  components: Array<{ key: string; label: string; weight: number; raw: number; contribution: number }>;
}

// ---------------------------------------------------------------------------
// Computed sector state
// ---------------------------------------------------------------------------

export interface SectorLeader {
  symbol: string;
  changePercent: number;
  rvol: number;
  momentumScore: number;
  isNewHigh: boolean;
}

export interface SectorMetrics {
  sectorId: string;
  sectorName: string;
  /** Weighted mean of constituent momentum scores, 0-100. */
  score: number;
  /** Mean constituent daily percent change. */
  changePercent: number;
  /** Advancing constituents / active constituents, 0-1. */
  breadth: number;
  advancing: number;
  active: number;
  avgRvol: number;
  avgMomentum: number;
  aboveVwapCount: number;
  newHighCount: number;
  volumeAcceleration: number;
  /** Score now minus score 5 minutes ago. The early-warning term. */
  acceleration: number;
  /** Count of constituents at or above the breakout move threshold. */
  strongLeaderCount: number;
  leaders: SectorLeader[];
  stage: SectorStage;
  updatedAt: number;
}

export type SectorStage = 'IDLE' | 'AWAKENING' | 'ACCELERATING' | 'BREAKOUT' | 'COOLING';

// ---------------------------------------------------------------------------
// Signals & alerts
// ---------------------------------------------------------------------------

export type SignalType =
  | 'MOMENTUM_START'
  | 'MOMENTUM_ACCELERATION'
  | 'VOLUME_SPIKE'
  | 'NEW_HIGH'
  | 'VWAP_BREAK'
  | 'SECTOR_AWAKENING'
  | 'SECTOR_BREAKOUT'
  | 'SECTOR_ACCELERATION'
  | 'CATALYST';

export type SignalSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

/** Alert levels 1-5 as described in the spec, derived from severity. */
export const SEVERITY_TO_LEVEL: Record<SignalSeverity, 1 | 2 | 3 | 4 | 5> = {
  INFO: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
  CRITICAL: 5,
};

export interface Signal {
  id: string;
  symbol: string | null;
  sectorId: string | null;
  sectorName: string | null;
  type: SignalType;
  severity: SignalSeverity;
  score: number;
  triggerValue: number;
  previousValue: number | null;
  /** Pre-rendered human sentence — the product's whole point. */
  headline: string;
  metadata: SignalMetadata;
  createdAt: string;
}

export interface SignalMetadata {
  breadth?: number;
  advancing?: number;
  active?: number;
  avgRvol?: number;
  newHighCount?: number;
  acceleration?: number;
  leaders?: SectorLeader[];
  stageFrom?: SectorStage | StockStage;
  stageTo?: SectorStage | StockStage;
  catalyst?: { headline: string; url: string; source: string; catalystType: CatalystType };
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// News / catalyst
// ---------------------------------------------------------------------------

export type CatalystType =
  | 'EARNINGS'
  | 'GUIDANCE'
  | 'FDA'
  | 'ANALYST'
  | 'CONTRACT'
  | 'M_AND_A'
  | 'PRODUCT'
  | 'REGULATORY'
  | 'MACRO'
  | 'AI'
  | 'COMMODITY'
  | 'SECTOR'
  | 'OTHER';

export interface NewsHeadline {
  id: string;
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
  catalystType: CatalystType;
  symbols: string[];
  sectorIds: string[];
}

// ---------------------------------------------------------------------------
// SSE envelope
// ---------------------------------------------------------------------------

export type MarketEvent =
  | { type: 'METRICS'; data: StockMetrics[] }
  | { type: 'SECTORS'; data: SectorMetrics[] }
  | { type: 'SIGNAL'; data: Signal }
  | { type: 'NEWS'; data: NewsHeadline }
  | { type: 'SESSION'; data: { session: MarketSession; asOf: string } }
  | { type: 'HEARTBEAT'; data: { ts: number } };

// ---------------------------------------------------------------------------
// Universe
// ---------------------------------------------------------------------------

export interface UniverseStock {
  symbol: string;
  name: string;
  exchange: string;
  active: boolean;
}

export interface UniverseSector {
  id: string;
  name: string;
  description: string;
  active: boolean;
  /** Constituent symbol -> weight in the sector score. */
  constituents: Array<{ symbol: string; weight: number }>;
}

export interface Universe {
  sectors: UniverseSector[];
  stocks: UniverseStock[];
}
