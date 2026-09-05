/**
 * Alpaca market data adapter.
 *
 * Same interface as Polygon, so nothing downstream changes — which is the
 * point of the abstraction. Two differences from Polygon are worth knowing
 * about because they shape how this is configured:
 *
 *  - The free "Basic" plan streams the IEX feed only, and caps a websocket
 *    subscription at 30 symbols. IEX is roughly 2-3% of consolidated volume,
 *    so RVOL computed from it is a sample, not the tape. That is a real
 *    limitation, surfaced loudly rather than hidden.
 *  - Only one websocket connection is permitted per account. A second worker
 *    does not degrade; it is refused.
 *
 * REST is rate limited (200 req/min on Basic), so warm-up goes through a token
 * bucket and snapshots are fetched in one batched call rather than 249.
 */

import WebSocket from 'ws';
import type {
  Bar, IMarketDataProvider, MarketDataHandler, Quote, Snapshot, Timeframe, Trade,
} from '../../../shared/types';
import { Logger } from '../utils/logger';

const REST_BASE = 'https://data.alpaca.markets/v2/stocks';
const STREAM_BASE = 'wss://stream.data.alpaca.markets/v2';

/** IEX is the free feed; SIP is the consolidated tape and requires a paid plan. */
export type AlpacaFeed = 'iex' | 'sip';

export interface AlpacaProviderOptions {
  keyId: string;
  secretKey: string;
  feed?: AlpacaFeed;
  /** Every symbol the worker intends to watch, so snapshots can be batched. */
  symbols?: string[];
  /**
   * Websocket subscription cap. Alpaca's Basic plan allows 30; exceeding it
   * is rejected outright rather than truncated, so we truncate deliberately
   * and say which symbols were dropped.
   */
  maxStreamSymbols?: number;
  /** REST requests per minute. Basic allows 200. */
  requestsPerMinute?: number;
}

// ---------------------------------------------------------------------------
// Alpaca wire shapes
// ---------------------------------------------------------------------------

interface AlpacaBar { t: string; o: number; h: number; l: number; c: number; v: number; vw?: number }
interface AlpacaTradeMsg { T: 't'; S: string; p: number; s: number; t: string; c?: string[] }
interface AlpacaQuoteMsg { T: 'q'; S: string; bp: number; bs: number; ap: number; as: number; t: string }
interface AlpacaStatusMsg { T: 'success' | 'error' | 'subscription'; msg?: string; code?: number }
type AlpacaMessage = AlpacaTradeMsg | AlpacaQuoteMsg | AlpacaStatusMsg;

interface AlpacaSnapshot {
  latestTrade?: { p: number; t: string };
  latestQuote?: { bp: number; bs: number; ap: number; as: number; t: string };
  dailyBar?: AlpacaBar;
  prevDailyBar?: AlpacaBar;
  minuteBar?: AlpacaBar;
}

/**
 * Alpaca stamps times as RFC-3339 with nanosecond precision, which Date.parse
 * handles but silently truncates. Milliseconds are all the engines use.
 */
function toEpochMs(timestamp: string): number {
  const parsed = Date.parse(timestamp);
  return Number.isFinite(parsed) ? parsed : Date.now();
}

const TIMEFRAME: Record<Timeframe, string> = {
  '1m': '1Min', '5m': '5Min', '15m': '15Min', '1d': '1Day',
};

/** Simple token bucket, so warm-up cannot trip the per-minute rate limit. */
class RateLimiter {
  private tokens: number;
  private lastRefill = Date.now();

  constructor(private readonly perMinute: number) {
    this.tokens = perMinute;
  }

  async take(): Promise<void> {
    for (;;) {
      const now = Date.now();
      const elapsed = now - this.lastRefill;
      if (elapsed > 0) {
        this.tokens = Math.min(this.perMinute, this.tokens + (elapsed / 60_000) * this.perMinute);
        this.lastRefill = now;
      }
      if (this.tokens >= 1) {
        this.tokens -= 1;
        return;
      }
      // Wait for roughly one token to accrue.
      await new Promise((resolve) => setTimeout(resolve, Math.ceil(60_000 / this.perMinute)));
    }
  }
}

export class AlpacaProvider implements IMarketDataProvider {
  readonly providerName = 'ALPACA';

  private readonly feed: AlpacaFeed;
  private readonly maxStreamSymbols: number;
  private readonly limiter: RateLimiter;
  private readonly universe: string[];

  private ws: WebSocket | null = null;
  private authenticated = false;
  private closing = false;

  private tradeHandler: MarketDataHandler<Trade> | null = null;
  private quoteHandler: MarketDataHandler<Quote> | null = null;
  private disconnectHandler: ((reason: string) => void) | null = null;

  private readonly subscribedTrades = new Set<string>();
  private readonly subscribedQuotes = new Set<string>();

  /** One batched snapshot fetch serves the whole warm-up. */
  private snapshotCache: Map<string, AlpacaSnapshot> | null = null;
  private snapshotFetch: Promise<Map<string, AlpacaSnapshot>> | null = null;

  constructor(private readonly options: AlpacaProviderOptions) {
    if (!options.keyId || !options.secretKey) {
      throw new Error('AlpacaProvider requires both a key id and a secret key');
    }
    this.feed = options.feed ?? 'iex';
    this.universe = options.symbols ?? [];
    this.maxStreamSymbols = options.maxStreamSymbols
      ?? (this.feed === 'iex' ? 30 : Number.POSITIVE_INFINITY);
    this.limiter = new RateLimiter(options.requestsPerMinute ?? 200);
  }

  onDisconnect(handler: (reason: string) => void): void {
    this.disconnectHandler = handler;
  }

  // -------------------------------------------------------------------------
  // Streaming
  // -------------------------------------------------------------------------

  connect(): Promise<void> {
    this.closing = false;
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(`${STREAM_BASE}/${this.feed}`);
      this.ws = socket;

      const failFast = (reason: string) => {
        if (!this.authenticated) reject(new Error(reason));
      };

      socket.on('open', () => {
        // Alpaca sends {"T":"success","msg":"connected"} first; auth follows.
        socket.send(JSON.stringify({
          action: 'auth',
          key: this.options.keyId,
          secret: this.options.secretKey,
        }));
      });

      socket.on('message', (raw: WebSocket.RawData) => {
        let messages: AlpacaMessage[];
        try {
          messages = JSON.parse(raw.toString());
        } catch {
          return; // A malformed frame is not worth dropping the socket for.
        }

        for (const message of messages) {
          switch (message.T) {
            case 'success':
              if (message.msg === 'authenticated') {
                this.authenticated = true;
                Logger.info('Alpaca authenticated', { feed: this.feed });
                this.resubscribe();
                resolve();
              }
              break;

            case 'error': {
              const detail = `Alpaca error ${message.code ?? ''}: ${message.msg ?? 'unknown'}`;
              // 406 is the one that looks like a bug but is not: the account
              // already has a stream open somewhere else.
              if (message.code === 406) {
                Logger.error(
                  'Alpaca refused the connection: this account already has a websocket open. ' +
                  'Only one connection is permitted — stop the other worker.',
                );
              } else if (message.code === 405) {
                Logger.error(
                  'Alpaca rejected the subscription as too large for this plan. ' +
                  'Reduce the universe (UNIVERSE_SECTORS) or raise ALPACA_MAX_SYMBOLS on a paid feed.',
                );
              } else {
                Logger.error(detail);
              }
              failFast(detail);
              break;
            }

            case 'subscription':
              Logger.info('Alpaca subscription confirmed', {
                trades: this.subscribedTrades.size,
                quotes: this.subscribedQuotes.size,
              });
              break;

            default:
              this.dispatch(message);
          }
        }
      });

      socket.on('error', (error) => {
        Logger.error('Alpaca socket error', error);
        failFast(`Alpaca socket error: ${String(error)}`);
      });

      socket.on('close', (code, reasonBuf) => {
        this.authenticated = false;
        const reason = `Alpaca socket closed (${code}) ${reasonBuf?.toString() ?? ''}`.trim();
        failFast(reason);
        if (!this.closing) this.disconnectHandler?.(reason);
      });
    });
  }

  private dispatch(message: AlpacaTradeMsg | AlpacaQuoteMsg): void {
    if (message.T === 't' && this.tradeHandler) {
      void this.tradeHandler({
        symbol: message.S,
        price: message.p,
        size: message.s,
        timestamp: toEpochMs(message.t),
        conditions: message.c,
      });
      return;
    }
    if (message.T === 'q' && this.quoteHandler) {
      void this.quoteHandler({
        symbol: message.S,
        bidPrice: message.bp,
        bidSize: message.bs,
        askPrice: message.ap,
        askSize: message.as,
        timestamp: toEpochMs(message.t),
      });
    }
  }

  /**
   * Alpaca takes the full desired subscription in one message rather than
   * incremental adds, so this always sends the complete set.
   */
  private sendSubscription(): void {
    if (this.ws?.readyState !== WebSocket.OPEN || !this.authenticated) return;

    const trades = this.capped([...this.subscribedTrades], 'trades');
    const quotes = this.capped([...this.subscribedQuotes], 'quotes');
    if (trades.length === 0 && quotes.length === 0) return;

    this.ws.send(JSON.stringify({ action: 'subscribe', trades, quotes }));
  }

  /** Truncate to the plan's symbol cap, saying explicitly what was dropped. */
  private capped(symbols: string[], channel: string): string[] {
    if (symbols.length <= this.maxStreamSymbols) return symbols;

    const kept = symbols.slice(0, this.maxStreamSymbols);
    const dropped = symbols.slice(this.maxStreamSymbols);
    Logger.warn(
      `Alpaca ${channel} subscription capped at ${this.maxStreamSymbols} symbols by the plan. ` +
      'The dropped symbols will never produce metrics, and any sector containing them will ' +
      'compute breadth over an incomplete constituent set. Narrow the universe instead.',
      { kept: kept.length, dropped: dropped.length, examples: dropped.slice(0, 8) },
    );
    return kept;
  }

  private resubscribe(): void {
    this.sendSubscription();
  }

  async subscribeTrades(symbols: string[], handler: MarketDataHandler<Trade>): Promise<void> {
    this.tradeHandler = handler;
    for (const symbol of symbols) this.subscribedTrades.add(symbol);
    this.sendSubscription();
  }

  async subscribeQuotes(symbols: string[], handler: MarketDataHandler<Quote>): Promise<void> {
    this.quoteHandler = handler;
    for (const symbol of symbols) this.subscribedQuotes.add(symbol);
    this.sendSubscription();
  }

  async unsubscribe(symbols: string[]): Promise<void> {
    const trades: string[] = [];
    const quotes: string[] = [];
    for (const symbol of symbols) {
      if (this.subscribedTrades.delete(symbol)) trades.push(symbol);
      if (this.subscribedQuotes.delete(symbol)) quotes.push(symbol);
    }
    if (this.ws?.readyState === WebSocket.OPEN && (trades.length || quotes.length)) {
      this.ws.send(JSON.stringify({ action: 'unsubscribe', trades, quotes }));
    }
  }

  async disconnect(): Promise<void> {
    this.closing = true;
    this.ws?.close();
    this.ws = null;
    this.authenticated = false;
  }

  // -------------------------------------------------------------------------
  // REST
  // -------------------------------------------------------------------------

  private async rest<T>(path: string, params: Record<string, string> = {}): Promise<T> {
    await this.limiter.take();

    const url = new URL(REST_BASE + path);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

    const response = await fetch(url, {
      headers: {
        'APCA-API-KEY-ID': this.options.keyId,
        'APCA-API-SECRET-KEY': this.options.secretKey,
      },
    });

    if (response.status === 429) {
      // The limiter should prevent this; if it happens the plan is tighter
      // than configured, so back off and let the caller retry.
      throw new Error('Alpaca rate limit exceeded — lower ALPACA_REQUESTS_PER_MINUTE');
    }
    if (!response.ok) {
      throw new Error(`Alpaca REST ${path} failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  /**
   * Fetch every snapshot in one call, once.
   *
   * Warm-up asks for 249 snapshots; at 200 requests a minute that alone would
   * take longer than the rest of startup. Alpaca accepts a symbol list, so the
   * first request populates a cache the rest read from.
   */
  private async loadSnapshots(): Promise<Map<string, AlpacaSnapshot>> {
    if (this.snapshotCache) return this.snapshotCache;
    if (this.snapshotFetch) return this.snapshotFetch;

    this.snapshotFetch = (async () => {
      const cache = new Map<string, AlpacaSnapshot>();
      if (this.universe.length === 0) return cache;

      // Chunked: the symbols parameter is a URL, not an infinite list.
      const CHUNK = 100;
      for (let i = 0; i < this.universe.length; i += CHUNK) {
        const chunk = this.universe.slice(i, i + CHUNK);
        const res = await this.rest<{ snapshots?: Record<string, AlpacaSnapshot> }>(
          '/snapshots', { symbols: chunk.join(','), feed: this.feed },
        );
        for (const [symbol, snapshot] of Object.entries(res.snapshots ?? {})) {
          cache.set(symbol, snapshot);
        }
      }

      this.snapshotCache = cache;
      Logger.info('Alpaca snapshots loaded', { symbols: cache.size, feed: this.feed });
      return cache;
    })();

    return this.snapshotFetch;
  }

  async getSnapshot(symbol: string): Promise<Snapshot> {
    const cached = (await this.loadSnapshots()).get(symbol);
    const snapshot = cached ?? await this.rest<AlpacaSnapshot>(
      `/${symbol}/snapshot`, { feed: this.feed },
    );

    const { latestTrade, latestQuote, dailyBar, prevDailyBar } = snapshot;
    const lastPrice = latestTrade?.p ?? dailyBar?.c ?? prevDailyBar?.c ?? 0;

    if (!lastPrice) throw new Error(`Alpaca returned no price for ${symbol}`);

    return {
      symbol,
      bidPrice: latestQuote?.bp ?? 0,
      bidSize: latestQuote?.bs ?? 0,
      askPrice: latestQuote?.ap ?? 0,
      askSize: latestQuote?.as ?? 0,
      volume: dailyBar?.v ?? 0,
      vwap: dailyBar?.vw ?? lastPrice,
      lastPrice,
      previousClose: prevDailyBar?.c ?? lastPrice,
      dayHigh: dailyBar?.h ?? lastPrice,
      dayLow: dailyBar?.l ?? lastPrice,
      dayOpen: dailyBar?.o ?? lastPrice,
      timestamp: latestTrade ? toEpochMs(latestTrade.t) : Date.now(),
    };
  }

  async getHistoricalBars(symbol: string, timeframe: Timeframe, limit: number): Promise<Bar[]> {
    // Span enough calendar days to cover `limit` bars, allowing for weekends.
    const barsPerDay = timeframe === '1d' ? 1 : Math.floor(390 / (
      timeframe === '15m' ? 15 : timeframe === '5m' ? 5 : 1
    ));
    const tradingDays = Math.ceil(limit / barsPerDay);
    const start = new Date(Date.now() - Math.ceil(tradingDays * 1.6 + 5) * 86_400_000);

    const bars: Bar[] = [];
    let pageToken: string | undefined;

    // Alpaca caps a page at 10,000 bars and returns a continuation token.
    do {
      const res: { bars?: AlpacaBar[]; next_page_token?: string | null } = await this.rest(
        `/${symbol}/bars`,
        {
          timeframe: TIMEFRAME[timeframe],
          start: start.toISOString(),
          limit: String(Math.min(limit, 10_000)),
          adjustment: 'raw',
          feed: this.feed,
          ...(pageToken ? { page_token: pageToken } : {}),
        },
      );

      for (const bar of res.bars ?? []) {
        bars.push({
          symbol,
          open: bar.o, high: bar.h, low: bar.l, close: bar.c,
          volume: bar.v, vwap: bar.vw,
          timestamp: toEpochMs(bar.t),
        });
      }

      pageToken = res.next_page_token ?? undefined;
    } while (pageToken && bars.length < limit);

    return bars.slice(-limit);
  }
}
