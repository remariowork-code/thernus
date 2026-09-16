import type { AccountState, Order, OrderRequest, Position } from '../types';

/**
 * Everything the engine is allowed to ask a broker to do.
 *
 * The engine is written against this and nothing else, so the same rules run
 * unchanged against the in-memory simulator, an IBKR paper account, and — once
 * it has earned the right — an IBKR live account. Swapping those is a one-line
 * change in the entry point, which is the only way the phased rollout in the
 * brief can be honest: Phase 2 must test the *same* code Phase 3 runs.
 */
export interface IBroker {
  /** Human-readable, for logs and notifications: "simulator", "IBKR paper". */
  readonly name: string;
  /** True only for an account that can lose real money. */
  readonly isLive: boolean;

  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  getAccount(): Promise<AccountState>;
  getPositions(): Promise<Position[]>;

  /**
   * Submit an order. Resolves once the broker has acknowledged it — not once
   * it has filled. Callers poll getOrder for the fill.
   */
  placeOrder(request: OrderRequest): Promise<Order>;
  getOrder(clientOrderId: string): Promise<Order | null>;

  /**
   * Block until an order reaches a terminal state, or the timeout expires.
   *
   * This is on the interface because "did it fill?" is not a question a broker
   * can always answer synchronously. IBKR acknowledges an order immediately and
   * reports the fill later as an event, so a caller that reads the status
   * straight back from placeOrder sees PENDING and, if it treats that as a
   * failure, ends up believing it holds nothing while a live order works at the
   * exchange. Returns the order as it stands on timeout: not-yet-filled is a
   * fact to act on, not an error.
   */
  waitForFill(clientOrderId: string, timeoutMs: number): Promise<Order | null>;
  cancelOrder(clientOrderId: string): Promise<void>;

  /** Last trade price, used for marking positions and evaluating exits. */
  getLastPrice(symbol: string): Promise<number | null>;
}

export class BrokerError extends Error {
  constructor(
    message: string,
    readonly code?: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = 'BrokerError';
  }
}
