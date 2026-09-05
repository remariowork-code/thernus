/**
 * Fast New York wall-clock conversion.
 *
 * Everything in this system is indexed by minute-of-session, so timestamps get
 * converted to New York time on a very hot path — warm-up alone folds tens of
 * thousands of bars per symbol. `Intl.DateTimeFormat` costs roughly a
 * microsecond per call, which turns a 250-symbol warm-up into minutes of pure
 * formatting.
 *
 * The offset from UTC only changes twice a year, so it is computed with Intl
 * once per UTC hour and cached; conversion then becomes arithmetic.
 */

const FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit',
  hour12: false,
});

const HOUR_MS = 3_600_000;
const offsetCache = new Map<number, number>();

/** Minutes to add to UTC to get New York local time (negative: -240 or -300). */
export function nyOffsetMinutes(timestamp: number): number {
  const bucket = Math.floor(timestamp / HOUR_MS);
  const cached = offsetCache.get(bucket);
  if (cached !== undefined) return cached;

  const parts = Object.fromEntries(
    FORMATTER.formatToParts(new Date(timestamp)).map((p) => [p.type, p.value]),
  ) as Record<string, string>;

  // Some ICU builds render midnight as hour "24".
  const hour = Number(parts.hour) % 24;
  const asIfUtc = Date.UTC(
    Number(parts.year), Number(parts.month) - 1, Number(parts.day),
    hour, Number(parts.minute), Number(parts.second),
  );

  // Compare against the source truncated to the second, since the formatter
  // discards sub-second precision.
  const offset = Math.round((asIfUtc - Math.floor(timestamp / 1000) * 1000) / 60_000);

  // Bounded: a long backfill would otherwise grow this without limit.
  if (offsetCache.size > 20_000) offsetCache.clear();
  offsetCache.set(bucket, offset);
  return offset;
}

export interface NyWallClock {
  /** YYYY-MM-DD in New York. */
  dateKey: string;
  /** Minutes past local midnight. */
  minutesOfDay: number;
  /** 0 = Sunday. */
  dayOfWeek: number;
  year: number;
  month: number;
  day: number;
}

const pad = (n: number): string => (n < 10 ? `0${n}` : String(n));

export function nyWallClock(timestamp: number): NyWallClock {
  // Shift the instant so UTC getters read out New York local time.
  const shifted = new Date(timestamp + nyOffsetMinutes(timestamp) * 60_000);
  const year = shifted.getUTCFullYear();
  const month = shifted.getUTCMonth() + 1;
  const day = shifted.getUTCDate();
  return {
    dateKey: `${year}-${pad(month)}-${pad(day)}`,
    minutesOfDay: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
    dayOfWeek: shifted.getUTCDay(),
    year, month, day,
  };
}

/** Test seam. */
export function resetNyClockCache(): void {
  offsetCache.clear();
}
