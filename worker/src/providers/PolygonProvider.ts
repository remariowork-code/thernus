/**
 * Polygon.io adapter.
 *
 * All Polygon-specific shapes stop here. The engines downstream only ever see
 * the normalised Quote/Trade/Bar types, which is what makes swapping in Alpaca
 * or Finnhub a matter of writing one more file.
 *
 * Uses the raw WebSocket rather than the vendor SDK: the subscription and
 * reconnection semantics are the parts most likely to need tuning under load,
 * and they should be visible here rather than behind a wrapper.
 */

import WebSocket from 'ws';
import type {
  Bar, IMarketDataProvider, MarketDataHandler, Quote, Snapshot, Timeframe, Trade,
} from '../../../shared/types';
import { Logger } from '../utils/logger';

const WS_URL = 'wss://socket.polygon.io/stocks';
const REST_BASE = 'https://api.polygon.io';

interface PolygonTradeMessage { ev: 'T'; sym: string; p: number; s: number; t: number; c?: number[] }
interface PolygonQuoteMessage { ev: 'Q'; sym: string; bp: number; bs: number; ap: number; as: number; t: number }
interface PolygonStatusMessage { ev: 'status'; status: string; message: string }
type PolygonMessage = PolygonTradeMessage | PolygonQuoteMessage | PolygonStatusMessage;

export class PolygonProvider implements IMarketDataProvider {
  readonly providerName = 'POLYGON';

  private ws: WebSocket | null = null;
  private authenticated = false;
  private readonly subscribedTrades = new Set<string>();
  private readonly subscribedQuotes = new Set<string>();
  private tradeHandler: MarketDataHandler<Trade> | null = null;
  private quoteHandler: MarketDataHandler<Quote> | null = null;
  private disconnectHandler: ((reason: string) => void) | null = null;
  private closing = false;

  constructor(private readonly apiKey: string) {
    if (!apiKey) throw new Error('PolygonProvider requires an API key');
  }

  onDisconnect(handler: (reason: string) => void): void {
    this.disconnectHandler = handler;
  }

  connect(): Promise<void> {
    this.closing = false;
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(WS_URL);
      this.ws = socket;

      const failFast = (reason: string) => {
        if (!this.authenticated) reject(new Error(reason));
      };

      socket.on('open', () => {
        socket.send(JSON.stringify({ action: 'auth', params: this.apiKey }));
      });

      socket.on('message', (raw: WebSocket.RawData) => {
        let messages: PolygonMessage[];
        try {
          messages = JSON.parse(raw.toString());
        } catch {
          return; // A malformed frame is not worth tearing the socket down for.
        }
        for (const message of messages) {
          if (message.ev === 'status') {
            if (message.status === 'auth_success') {
              this.authenticated = true;
              Logger.info('Polygon authenticated');
              // Re-arm any subscriptions that existed before a reconnect.
              this.resubscribe();
              resolve();
            } else if (message.status === 'auth_failed') {
              failFast(`Polygon auth failed: ${message.message}`);
            }
            continue;
          }
          this.dispatch(message);
        }
      });

      socket.on('error', (error) => {
        Logger.error('Polygon socket error', error);
        failFast(`Polygon socket error: ${String(error)}`);
      });

      socket.on('close', (code, reasonBuf) => {
        this.authenticated = false;
        const reason = `Polygon socket closed (${code}) ${reasonBuf?.toString() ?? ''}`.trim();
        failFast(reason);
        // A close we did not ask for is a reconnect trigger for the worker.
        if (!this.closing) this.disconnectHandler?.(reason);
      });
    });
  }

  private dispatch(message: PolygonTradeMessage | PolygonQuoteMessage): void {
    if (message.ev === 'T' && this.tradeHandler) {
      void this.tradeHandler({
        symbol: message.sym,
        price: message.p,
        size: message.s,
        timestamp: message.t,
        conditions: message.c?.map(String),
      });
      return;
    }
    if (message.ev === 'Q' && this.quoteHandler) {
      void this.quoteHandler({
        symbol: message.sym,
        bidPrice: message.bp,
        bidSize: message.bs,
        askPrice: message.ap,
        askSize: message.as,
        timestamp: message.t,
      });
    }
  }

  private send(action: 'subscribe' | 'unsubscribe', channels: string[]): void {
    if (!channels.length) return;
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    // Polygon caps the params string; chunk rather than risk a silent drop.
    const CHUNK = 200;
    for (let i = 0; i < channels.length; i += CHUNK) {
      this.ws.send(JSON.stringify({ action, params: channels.slice(i, i + CHUNK).join(',') }));
    }
  }

  private resubscribe(): void {
    this.send('subscribe', [...this.subscribedTrades].map((s) => `T.${s}`));
    this.send('subscribe', [...this.subscribedQuotes].map((s) => `Q.${s}`));
  }

  async subscribeTrades(symbols: string[], handler: MarketDataHandler<Trade>): Promise<void> {
    this.tradeHandler = handler;
    for (const symbol of symbols) this.subscribedTrades.add(symbol);
    this.send('subscribe', symbols.map((s) => `T.${s}`));
  }

  async subscribeQuotes(symbols: string[], handler: MarketDataHandler<Quote>): Promise<void> {
    this.quoteHandler = handler;
    for (const symbol of symbols) this.subscribedQuotes.add(symbol);
    this.send('subscribe', symbols.map((s) => `Q.${s}`));
  }

  async unsubscribe(symbols: string[]): Promise<void> {
    const channels: string[] = [];
    for (const symbol of symbols) {
      if (this.subscribedTrades.delete(symbol)) channels.push(`T.${symbol}`);
      if (this.subscribedQuotes.delete(symbol)) channels.push(`Q.${symbol}`);
    }
    this.send('unsubscribe', channels);
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
    const url = new URL(`${REST_BASE}${path}`);
    for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
    // The key goes in a header, not the query string.
    const response = await fetch(url, { headers: { Authorization: `Bearer ${this.apiKey}` } });
    if (!response.ok) {
      throw new Error(`Polygon REST ${path} failed: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
  }

  async getSnapshot(symbol: string): Promise<Snapshot> {
    const res = await this.rest<{
      ticker: {
        day: { v: number; vw: number; c: number; o: number; h: number; l: number };
        prevDay: { c: number };
        lastQuote?: { p: number; s: number; P: number; S: number; t: number };
        lastTrade?: { p: number; t: number };
      };
    }>(`/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}`);

    const { day, prevDay, lastQuote, lastTrade } = res.ticker;
    return {
      symbol,
      bidPrice: lastQuote?.p ?? 0,
      bidSize: lastQuote?.s ?? 0,
      askPrice: lastQuote?.P ?? 0,
      askSize: lastQuote?.S ?? 0,
      volume: day.v,
      vwap: day.vw,
      lastPrice: lastTrade?.p ?? day.c,
      previousClose: prevDay.c,
      dayHigh: day.h,
      dayLow: day.l,
      dayOpen: day.o,
      timestamp: lastTrade?.t ?? Date.now(),
    };
  }

  async getHistoricalBars(symbol: string, timeframe: Timeframe, limit: number): Promise<Bar[]> {
    const multiplier = timeframe === '15m' ? 15 : timeframe === '5m' ? 5 : 1;
    const timespan = timeframe === '1d' ? 'day' : 'minute';

    // Span enough calendar days to cover `limit` bars, allowing for weekends.
    const barsPerDay = timeframe === '1d' ? 1 : Math.floor(390 / multiplier);
    const tradingDays = Math.ceil(limit / barsPerDay);
    const to = new Date();
    const from = new Date(to.getTime() - Math.ceil(tradingDays * 1.5 + 5) * 86_400_000);
    const iso = (d: Date) => d.toISOString().slice(0, 10);

    const res = await this.rest<{
      results?: Array<{ o: number; h: number; l: number; c: number; v: number; vw: number; t: number }>;
    }>(`/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${iso(from)}/${iso(to)}`, {
      adjusted: 'true', sort: 'asc', limit: String(Math.min(limit * 2, 50_000)),
    });

    return (res.results ?? []).slice(-limit).map((r) => ({
      symbol, open: r.o, high: r.h, low: r.l, close: r.c,
      volume: r.v, vwap: r.vw, timestamp: r.t,
    }));
  }
}
