/**
 * Trading domain types.
 *
 * Deliberately separate from the scanner's types in shared/: the scanner
 * describes what the market is doing, these describe what we are doing about
 * it. Nothing here imports a broker SDK — the broker is an interface.
 */

export type Side = 'BUY' | 'SELL';

/** Every reason a position can be closed, so an exit is never unexplained. */
export type ExitReason =
  | 'STOP_LOSS'
  | 'PROFIT_TARGET'
  | 'TRAILING_STOP'
  | 'MAX_HOLD'
  | 'MOMENTUM_REVERSAL'
  | 'END_OF_DAY'
  | 'KILL_SWITCH'
  | 'MANUAL';

export type OrderStatus =
  | 'PENDING'      // submitted, no acknowledgement yet
  | 'SUBMITTED'    // broker acknowledged
  | 'PARTIAL'      // partially filled
  | 'FILLED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'FAILED';      // never reached the broker

export interface OrderRequest {
  symbol: string;
  side: Side;
  quantity: number;
  /** Absent means market order. */
  limitPrice?: number;
  /**
   * Caller-generated and stable across retries. The broker echoes it back,
   * which is what makes duplicate submission detectable rather than assumed.
   */
  clientOrderId: string;
}

export interface Order {
  clientOrderId: string;
  brokerOrderId: string | null;
  symbol: string;
  side: Side;
  requestedQuantity: number;
  filledQuantity: number;
  /** Volume-weighted across partial fills. */
  averageFillPrice: number | null;
  status: OrderStatus;
  submittedAt: string;
  updatedAt: string;
  /** Broker text for a rejection, verbatim. */
  message: string | null;
}

export interface Position {
  symbol: string;
  quantity: number;
  entryPrice: number;
  entryAt: string;
  /** What the entry rules saw, kept so the trade stays explainable later. */
  entryReasons: string[];

  stopPrice: number;
  /** The stop as first placed, which fixes R for the life of the trade. */
  initialStopPrice: number;
  targetPrice: number;

  /** Highest price seen since entry, for the trailing stop. */
  highWaterMark: number;
  /** Set once the stop has been moved to break-even or better. */
  stopRaised: boolean;

  entryOrderId: string;
  /** Commission paid to open, so the exit can report P&L net of costs. */
  entryCommission: number;
  lastKnownPrice: number;
  updatedAt: string;
}

export interface ClosedTrade extends Omit<Position, 'lastKnownPrice' | 'updatedAt'> {
  exitPrice: number;
  exitAt: string;
  exitReason: ExitReason;
  exitOrderId: string;
  /** Net of commission on both sides — what the account actually changed by. */
  realizedPnl: number;
  /** Commission paid across entry and exit. */
  commission: number;
  /** Profit in units of initial risk. The only comparable measure across sizes. */
  rMultiple: number;
  /** True when entry and exit fell on the same session — the PDT definition. */
  wasDayTrade: boolean;
}

/** A qualifying setup: what was seen, and what would be done about it. */
export interface Signal {
  symbol: string;
  price: number;
  reasons: string[];
  /** Metric values behind the decision, recorded for the audit trail. */
  evidence: Record<string, number>;
  at: string;
}

export interface AccountState {
  equity: number;
  cash: number;
  buyingPower: number;
  /** Day trades used in the rolling window the broker counts. */
  dayTradesUsed: number;
}

/** Why the risk engine refused, in words fit to show a human. */
export interface RiskDecision {
  allowed: boolean;
  reason: string;
  /** Shares to buy when allowed; zero otherwise. */
  quantity: number;
  stopPrice: number;
  targetPrice: number;
  riskAmount: number;
}
