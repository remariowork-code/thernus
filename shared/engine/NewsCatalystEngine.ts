/**
 * News ingestion and catalyst classification.
 *
 * Workflow: headline -> tickers -> sectors -> catalyst class -> correlate with
 * live momentum -> maybe a signal.
 *
 * Classification is keyword-based on purpose. It is auditable, it costs nothing
 * per headline, and it is trivially replaceable by a model later — the seam is
 * `classifyCatalyst`.
 */

import type { CatalystType, NewsHeadline, UniverseSector } from '../types';

interface Rule {
  type: CatalystType;
  patterns: RegExp[];
}

/**
 * Ordered: the first match wins, so specific classes are listed before the
 * broad ones. "Q3 earnings beat lifts AI chip demand" should be EARNINGS, not AI.
 */
const RULES: Rule[] = [
  { type: 'EARNINGS', patterns: [/\bearnings\b/, /\bq[1-4]\s+(results|earnings)\b/, /\breports?\s+(q[1-4]|first|second|third|fourth)\b/, /\bbeats?\s+(estimates|expectations)\b/, /\bmisses\s+(estimates|expectations)\b/, /\beps\b/] },
  { type: 'GUIDANCE', patterns: [/\bguidance\b/, /\braises?\s+outlook\b/, /\bcuts?\s+outlook\b/, /\bforecast\b/, /\bpre-?announce/] },
  { type: 'FDA', patterns: [/\bfda\b/, /\bphase\s*[123]\b/, /\bclinical\s+trial\b/, /\bapproval\b/, /\bbreakthrough\s+therapy\b/, /\bcrl\b/] },
  // "to buy" alone is a trap: "upgrades to buy rating" is an analyst call,
  // not a merger. Require an explicit agreement verb in front of it.
  { type: 'M_AND_A', patterns: [/\bacquir/, /\bacquisition\b/, /\bmerger\b/, /\bbuyout\b/, /\btakeover\b/, /\bagree[sd]?\s+to\s+buy\b/, /\bin\s+talks\s+to\s+buy\b/, /\bstake\s+in\b/, /\bspin-?off\b/] },
  { type: 'ANALYST', patterns: [/\bupgrade[sd]?\b/, /\bdowngrade[sd]?\b/, /\bprice\s+target\b/, /\binitiate[sd]?\s+coverage\b/, /\boverweight\b/, /\bunderweight\b/, /\bbuy\s+rating\b/] },
  { type: 'CONTRACT', patterns: [/\bcontract\b/, /\bawarded?\b/, /\bwins?\b/, /\bdeal\s+with\b/, /\bpartnership\b/, /\border\s+worth\b/, /\bsupply\s+agreement\b/] },
  { type: 'REGULATORY', patterns: [/\bantitrust\b/, /\bregulator/, /\bsec\s+(probe|investigation)\b/, /\blawsuit\b/, /\bsubpoena\b/, /\bfine[sd]?\b/, /\bsanction/, /\bexport\s+(ban|control|restriction)/] },
  { type: 'PRODUCT', patterns: [/\blaunch/, /\bunveil/, /\bannounces?\s+new\b/, /\bnext-?gen\b/, /\bproduct\b/, /\brelease[sd]?\b/] },
  { type: 'AI', patterns: [/\bai\b/, /\bartificial\s+intelligence\b/, /\bgpu\b/, /\bdata\s?cent(er|re)\b/, /\bhbm\b/, /\bmodel\s+training\b/, /\binference\b/] },
  { type: 'COMMODITY', patterns: [/\boil\s+price/, /\bcrude\b/, /\bopec\b/, /\bgold\s+price/, /\bcopper\b/, /\blithium\b/, /\buranium\b/, /\bnat\s?gas\b/] },
  { type: 'MACRO', patterns: [/\bfed\b/, /\bfomc\b/, /\binflation\b/, /\bcpi\b/, /\bjobs\s+report\b/, /\brate\s+(cut|hike)\b/, /\btariff/, /\byield/] },
  { type: 'SECTOR', patterns: [/\bsector\b/, /\bindustry\s+(wide|outlook)\b/, /\bpeers\b/] },
];

export function classifyCatalyst(headline: string): CatalystType {
  const text = headline.toLowerCase();
  for (const rule of RULES) {
    if (rule.patterns.some((p) => p.test(text))) return rule.type;
  }
  return 'OTHER';
}

/**
 * Pull tickers out of a headline.
 *
 * Two sources, because vendors differ: symbols the provider already tagged, and
 * symbols named in the text. Text extraction is restricted to the known
 * universe and requires either a cashtag ($MU) or a parenthetical
 * ("Micron (MU)") — a bare "ON" or "ALL" in prose is a word, not a ticker, and
 * matching those produces constant false catalysts.
 */
export function extractSymbols(
  headline: string,
  universeSymbols: Set<string>,
  providerSymbols: string[] = [],
): string[] {
  const found = new Set<string>();

  for (const symbol of providerSymbols) {
    const upper = symbol.toUpperCase();
    if (universeSymbols.has(upper)) found.add(upper);
  }

  for (const match of headline.matchAll(/\$([A-Z]{1,5})\b/g)) {
    if (universeSymbols.has(match[1])) found.add(match[1]);
  }
  for (const match of headline.matchAll(/\(([A-Z]{1,5})\)/g)) {
    if (universeSymbols.has(match[1])) found.add(match[1]);
  }
  // Standalone caps are only trusted at 3+ characters, which excludes the
  // short English words that dominate false positives.
  for (const match of headline.matchAll(/\b([A-Z]{3,5})\b/g)) {
    if (universeSymbols.has(match[1])) found.add(match[1]);
  }

  return [...found];
}

export interface RawHeadline {
  id?: string;
  headline: string;
  source: string;
  url: string;
  publishedAt?: string;
  symbols?: string[];
}

export class NewsCatalystEngine {
  private readonly universeSymbols: Set<string>;
  private readonly sectorsBySymbol: Map<string, string[]>;
  /** Most recent catalyst per symbol, for signal correlation. */
  private readonly recent = new Map<string, NewsHeadline>();
  private readonly seenUrls = new Set<string>();

  constructor(sectors: UniverseSector[]) {
    this.universeSymbols = new Set();
    this.sectorsBySymbol = new Map();
    for (const sector of sectors) {
      for (const { symbol } of sector.constituents) {
        this.universeSymbols.add(symbol);
        this.sectorsBySymbol.set(symbol, [...(this.sectorsBySymbol.get(symbol) ?? []), sector.id]);
      }
    }
  }

  /** Normalise a vendor headline. Returns null for duplicates and non-matches. */
  ingest(raw: RawHeadline, now = Date.now()): NewsHeadline | null {
    if (this.seenUrls.has(raw.url)) return null;
    this.seenUrls.add(raw.url);
    if (this.seenUrls.size > 5_000) {
      // Bounded: keep the most recent half.
      const kept = [...this.seenUrls].slice(-2_500);
      this.seenUrls.clear();
      for (const u of kept) this.seenUrls.add(u);
    }

    const symbols = extractSymbols(raw.headline, this.universeSymbols, raw.symbols ?? []);
    if (symbols.length === 0) return null;

    const sectorIds = [...new Set(symbols.flatMap((s) => this.sectorsBySymbol.get(s) ?? []))];

    const item: NewsHeadline = {
      id: raw.id ?? `news_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      headline: raw.headline,
      source: raw.source,
      url: raw.url,
      publishedAt: raw.publishedAt ?? new Date(now).toISOString(),
      catalystType: classifyCatalyst(raw.headline),
      symbols,
      sectorIds,
    };

    for (const symbol of symbols) this.recent.set(symbol, item);
    return item;
  }

  /** Catalysts inside the window, keyed by symbol. */
  recentCatalysts(windowMinutes: number, now = Date.now()): Map<string, NewsHeadline> {
    const cutoff = now - windowMinutes * 60_000;
    const out = new Map<string, NewsHeadline>();
    for (const [symbol, news] of this.recent) {
      if (new Date(news.publishedAt).getTime() >= cutoff) out.set(symbol, news);
      else this.recent.delete(symbol);
    }
    return out;
  }
}
