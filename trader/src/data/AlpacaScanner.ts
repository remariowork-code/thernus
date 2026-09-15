import type { Bar, StockMetrics } from '../../../shared/types';
import { getConfig } from '../../../shared/config';
import {
  buildRvolProfile, computeRvol, genericRvolProfile, minuteOfSession,
} from '../../../shared/calculations/rvol';
import { computeMomentumScore } from '../../../shared/calculations/momentum';
import { computeVolumeAcceleration } from '../../../shared/calculations/volume';
import { computeVolatilityExpansion } from '../../../shared/calculations/volatility';
import { vwapDistance } from '../../../shared/calculations/vwap';
import type { EntryRules } from '../config';
import type { MarketDataSource } from '../engine/TradingEngine';

interface Snapshot {
  latestTrade?: { p: number; t: string };
  dailyBar?: { o: number; h: number; l: number; c: number; v: number; vw: number; t: string };
  prevDailyBar?: { c: number; v: number; t: string };
  minuteBar?: { c: number; v: number; t: string };
}

interface AlpacaBar {
  t: string; o: number; h: number; l: number; c: number; v: number; vw: number;
}

const SNAPSHOT_CHUNK = 500;
const BAR_CHUNK = 50;
/** Symbols promoted from the coarse scan to the full metric computation. */
const SHORTLIST_SIZE = 20;
/** Prior sessions folded into each symbol's own volume curve. */
const BASELINE_DAYS = 5;

/**
 * The trader's view of the market, built from Alpaca's REST API.
 *
 * Two stages, for a reason that is purely about cost. A snapshot call returns
 * 500 symbols at once, so the whole tradable universe — about thirteen and a
 * half thousand names — costs roughly twenty-seven calls and a couple of
 * seconds. But a snapshot has no intraday history in it, so it cannot produce
 * a five-minute change, a real relative volume, or a momentum score.
 *
 * So the first stage scans everything cheaply and keeps only what could
 * plausibly qualify; the second stage pulls minute bars for that shortlist and
 * computes the real metrics. The universe stays complete while the expensive
 * work stays proportional to the number of stocks actually moving.
 *
 * This deliberately uses REST rather than the websocket. The free tier caps a
 * stream at thirty symbols, which would mean choosing in advance which stocks
 * are allowed to move — exactly the blind spot this is meant to remove.
 */
export class AlpacaScanner implements MarketDataSource {
  private readonly headers: Record<string, string>;
  private symbolCache: { day: string; symbols: string[] } | null = null;
  private readonly baselineCache = new Map<string, { day: string; profile: number[] }>();
  private readonly metricsCache = new Map<string, StockMetrics>();

  constructor(
    keyId: string,
    secretKey: string,
    private readonly entry: EntryRules,
    private readonly feed = 'iex',
    private readonly now: () => Date = () => new Date(),
  ) {
    this.headers = { 'APCA-API-KEY-ID': keyId, 'APCA-API-SECRET-KEY': secretKey };
  }

  private today(): string {
    return this.now().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  }

  private async get<T>(url: string): Promise<T> {
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`${res.status} ${res.statusText} ${body.slice(0, 200)}`);
    }
    return (await res.json()) as T;
  }

  /** Tradable US equities. Cached for the day; the list barely changes. */
  private async tradableSymbols(): Promise<string[]> {
    const day = this.today();
    if (this.symbolCache?.day === day) return this.symbolCache.symbols;

    const assets = await this.get<Array<{ symbol: string; tradable: boolean }>>(
      'https://paper-api.alpaca.markets/v2/assets?status=active&asset_class=us_equity',
    );
    const symbols = assets
      .filter((a) => a.tradable && !a.symbol.includes('/'))
      .map((a) => a.symbol);
    this.symbolCache = { day, symbols };
    return symbols;
  }

  /** Stage one: everything, cheaply, filtered to what could possibly qualify. */
  private async coarseScan(): Promise<Array<{ symbol: string; snapshot: Snapshot; changePercent: number }>> {
    const symbols = await this.tradableSymbols();
    const today = this.today();
    const out: Array<{ symbol: string; snapshot: Snapshot; changePercent: number }> = [];

    for (let i = 0; i < symbols.length; i += SNAPSHOT_CHUNK) {
      const chunk = symbols.slice(i, i + SNAPSHOT_CHUNK).join(',');
      let body: Record<string, Snapshot>;
      try {
        body = await this.get<Record<string, Snapshot>>(
          `https://data.alpaca.markets/v2/stocks/snapshots?symbols=${chunk}&feed=${this.feed}`,
        );
      } catch {
        // One bad chunk must not abandon the scan.
        continue;
      }

      for (const [symbol, snapshot] of Object.entries(body)) {
        const price = snapshot?.latestTrade?.p;
        if (!price) continue;

        // Before the open there is no bar for today, so dailyBar is the previous
        // session. Reading prevDailyBar as the previous close then reports a
        // two-session move as today's.
        const dailyIsToday = snapshot.dailyBar?.t?.slice(0, 10) === today;
        const previousClose = dailyIsToday ? snapshot.prevDailyBar?.c : snapshot.dailyBar?.c;
        const volume = dailyIsToday ? (snapshot.dailyBar?.v ?? 0) : 0;
        if (!previousClose || previousClose <= 0) continue;

        if (price < this.entry.minPrice || price > this.entry.maxPrice) continue;
        if (volume < this.entry.minDayVolume) continue;

        // A stale print is last session's close, not today's move.
        const ageMinutes = (this.now().getTime() - Date.parse(snapshot.latestTrade!.t)) / 60_000;
        if (ageMinutes > 30) continue;

        const changePercent = ((price - previousClose) / previousClose) * 100;
        if (changePercent < this.entry.minChangePercent) continue;

        out.push({ symbol, snapshot, changePercent });
      }
    }

    return out;
  }

  private async fetchBars(
    symbols: string[], timeframe: string, start: string, limit = 10_000,
  ): Promise<Record<string, AlpacaBar[]>> {
    const all: Record<string, AlpacaBar[]> = {};
    for (let i = 0; i < symbols.length; i += BAR_CHUNK) {
      const chunk = symbols.slice(i, i + BAR_CHUNK).join(',');
      let pageToken: string | null = null;
      do {
        const url =
          `https://data.alpaca.markets/v2/stocks/bars?symbols=${chunk}` +
          `&timeframe=${timeframe}&start=${start}&limit=${limit}&feed=${this.feed}` +
          // 'all' rather than 'raw': a reverse split in the baseline window
          // otherwise reads as a thousand-percent move.
          `&adjustment=all${pageToken ? `&page_token=${pageToken}` : ''}`;
        const body: { bars?: Record<string, AlpacaBar[]>; next_page_token?: string | null } =
          await this.get(url);
        for (const [symbol, bars] of Object.entries(body.bars ?? {})) {
          (all[symbol] ??= []).push(...bars);
        }
        pageToken = body.next_page_token ?? null;
      } while (pageToken);
    }
    return all;
  }

  /**
   * Each symbol's own cumulative volume curve for this time of day.
   *
   * Cached per symbol per day, because it is the expensive call and the answer
   * does not change intraday. When history is unavailable — a recent listing,
   * a thin name with no IEX prints — it falls back to a generic U-shaped curve
   * scaled by yesterday's volume. That is less accurate, and the caller should
   * know it: a generic curve makes an unusually quiet morning look normal.
   */
  private async baselineProfile(
    symbol: string, bars: AlpacaBar[], averageDailyVolume: number,
  ): Promise<number[]> {
    const day = this.today();
    const cached = this.baselineCache.get(symbol);
    if (cached?.day === day) return cached.profile;

    const historical: Bar[] = bars
      .filter((b) => b.t.slice(0, 10) !== day)
      .map((b) => ({
        symbol,
        timestamp: Date.parse(b.t),
        open: b.o, high: b.h, low: b.l, close: b.c, volume: b.v, vwap: b.vw,
      }));

    const profile = historical.length > 0
      ? buildRvolProfile(historical)
      : genericRvolProfile(averageDailyVolume);

    this.baselineCache.set(symbol, { day, profile });
    return profile;
  }

  private buildMetrics(
    symbol: string,
    snapshot: Snapshot,
    todayBars: AlpacaBar[],
    profile: number[],
    previousClose: number,
  ): StockMetrics | null {
    const price = snapshot.latestTrade?.p;
    if (!price || todayBars.length === 0) return null;

    // The scanner's own weights and scales, so the trader scores a stock
    // exactly as the dashboard does.
    const scanner = getConfig();
    const at = this.now().getTime();
    const closes = todayBars.map((b) => b.c);
    const last = closes[closes.length - 1];

    const changeOver = (minutes: number): number => {
      const reference = closes[Math.max(0, closes.length - 1 - minutes)];
      return reference > 0 ? ((last - reference) / reference) * 100 : 0;
    };

    const volume = todayBars.reduce((sum, b) => sum + b.v, 0);
    const dayHigh = Math.max(...todayBars.map((b) => b.h), price);
    const dayLow = Math.min(...todayBars.map((b) => b.l), price);

    // Volume-weighted across today's bars, which is what VWAP means; the
    // snapshot's own vw field is for the daily bar alone.
    const notional = todayBars.reduce((sum, b) => sum + b.vw * b.v, 0);
    const vwap = volume > 0 ? notional / volume : price;

    const minute = minuteOfSession(at);
    const rvol = computeRvol(volume, profile, minute);

    const perMinuteVolumes = todayBars.slice(-15).map((b) => b.v);
    const volumeAcceleration = computeVolumeAcceleration(perMinuteVolumes);
    const volatility = computeVolatilityExpansion(closes.slice(-6), closes);

    // When the high was set, for the new-high component.
    let msSinceNewHigh: number | null = null;
    for (let i = todayBars.length - 1; i >= 0; i -= 1) {
      if (todayBars[i].h >= dayHigh - 1e-9) {
        msSinceNewHigh = at - Date.parse(todayBars[i].t);
        break;
      }
    }

    const change1m = changeOver(1);
    const change5m = changeOver(5);
    const change15m = changeOver(15);

    const momentumScore = computeMomentumScore(
      {
        change1m, change5m, change15m, rvol, volumeAcceleration,
        price, vwap, dayHigh, msSinceNewHigh, volatilityExpansion: volatility,
      },
      scanner.momentum.weights,
      scanner.momentum.scales,
    );

    const newHighWindowMs = scanner.momentum.scales.newHighWindowSec * 1_000;

    return {
      symbol,
      price,
      previousClose,
      changePercent: ((price - previousClose) / previousClose) * 100,
      change1m, change5m, change15m,
      volume,
      rvol,
      volumeAcceleration,
      vwap,
      vwapDistance: vwapDistance(price, vwap),
      aboveVwap: price > vwap,
      dayHigh, dayLow,
      distanceFromHigh: dayHigh > 0 ? ((dayHigh - price) / dayHigh) * 100 : 0,
      isNewHigh: msSinceNewHigh !== null && msSinceNewHigh <= newHighWindowMs,
      volatility,
      momentumScore,
      stage: 'IDLE',
      updatedAt: at,
    };
  }

  async getCandidates(): Promise<StockMetrics[]> {
    const coarse = await this.coarseScan();
    if (coarse.length === 0) return [];

    // Rank by move before spending calls on bars. Volume has already served as
    // a floor; ordering by size of move is enough to pick who gets measured.
    const shortlist = [...coarse]
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, SHORTLIST_SIZE);

    const symbols = shortlist.map((c) => c.symbol);
    const start = new Date(this.now().getTime() - (BASELINE_DAYS + 4) * 86_400_000)
      .toISOString().slice(0, 10);

    let bars: Record<string, AlpacaBar[]>;
    try {
      bars = await this.fetchBars(symbols, '1Min', start);
    } catch (error) {
      throw new Error(`could not fetch bars: ${error instanceof Error ? error.message : error}`);
    }

    const today = this.today();
    const results: StockMetrics[] = [];

    for (const { symbol, snapshot } of shortlist) {
      const symbolBars = bars[symbol] ?? [];
      const todayBars = symbolBars.filter((b) => b.t.slice(0, 10) === today);
      if (todayBars.length === 0) continue;

      const dailyIsToday = snapshot.dailyBar?.t?.slice(0, 10) === today;
      const previousClose = (dailyIsToday ? snapshot.prevDailyBar?.c : snapshot.dailyBar?.c) ?? 0;
      const averageDailyVolume =
        (dailyIsToday ? snapshot.prevDailyBar?.v : snapshot.dailyBar?.v) ?? 0;
      if (previousClose <= 0) continue;

      const profile = await this.baselineProfile(symbol, symbolBars, averageDailyVolume);
      const metrics = this.buildMetrics(symbol, snapshot, todayBars, profile, previousClose);
      if (metrics) {
        this.metricsCache.set(symbol, metrics);
        results.push(metrics);
      }
    }

    return results;
  }

  /**
   * Fresh metrics for one held symbol.
   *
   * Held positions are refreshed individually rather than being pulled out of
   * the scan, because a position can — and often does — fall out of the
   * candidate list entirely while still being open. A stock that stops
   * qualifying is exactly the one whose exit needs evaluating.
   */
  async getMetrics(symbol: string): Promise<StockMetrics | null> {
    const today = this.today();
    const [snapshots, bars] = await Promise.all([
      this.get<Record<string, Snapshot>>(
        `https://data.alpaca.markets/v2/stocks/snapshots?symbols=${symbol}&feed=${this.feed}`,
      ),
      this.fetchBars([symbol], '1Min', today),
    ]);

    const snapshot = snapshots[symbol];
    const todayBars = (bars[symbol] ?? []).filter((b) => b.t.slice(0, 10) === today);
    if (!snapshot || todayBars.length === 0) return this.metricsCache.get(symbol) ?? null;

    const dailyIsToday = snapshot.dailyBar?.t?.slice(0, 10) === today;
    const previousClose = (dailyIsToday ? snapshot.prevDailyBar?.c : snapshot.dailyBar?.c) ?? 0;
    if (previousClose <= 0) return this.metricsCache.get(symbol) ?? null;

    const profile = this.baselineCache.get(symbol)?.profile
      ?? genericRvolProfile((dailyIsToday ? snapshot.prevDailyBar?.v : snapshot.dailyBar?.v) ?? 0);

    const metrics = this.buildMetrics(symbol, snapshot, todayBars, profile, previousClose);
    if (metrics) this.metricsCache.set(symbol, metrics);
    return metrics ?? this.metricsCache.get(symbol) ?? null;
  }
}
