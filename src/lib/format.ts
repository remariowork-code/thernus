/**
 * Display formatting.
 *
 * Centralised because an information-dense table is only readable if a number
 * looks the same everywhere it appears.
 */

export const pct = (value: number, digits = 1): string =>
  `${value >= 0 ? '+' : ''}${value.toFixed(digits)}%`;

export const pctPlain = (value: number, digits = 0): string => `${(value * 100).toFixed(digits)}%`;

export const rvol = (value: number): string => `${value.toFixed(1)}x`;

export const price = (value: number): string =>
  value >= 1000 ? value.toFixed(0) : value >= 1 ? value.toFixed(2) : value.toFixed(4);

export const score = (value: number): string => value.toFixed(0);

export const signed = (value: number, digits = 0): string =>
  `${value > 0 ? '+' : ''}${value.toFixed(digits)}`;

export function compactVolume(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(Math.round(value));
}

/** 09:41:02 in New York, which is the only clock a US equities trader uses. */
export function marketTime(input: string | number | Date): string {
  const date = input instanceof Date ? input : new Date(input);
  return date.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function marketClock(input: string | number | Date = Date.now()): string {
  return `${marketTime(input)} ET`;
}

export function relativeTime(input: string | number | Date): string {
  const ms = Date.now() - new Date(input).getTime();
  if (ms < 5_000) return 'now';
  if (ms < 60_000) return `${Math.floor(ms / 1000)}s ago`;
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  return `${Math.floor(ms / 3_600_000)}h ago`;
}

/** Tailwind class for a signed value, neutral at zero. */
export function changeClass(value: number): string {
  if (value > 0.001) return 'text-emerald-400';
  if (value < -0.001) return 'text-rose-400';
  return 'text-neutral-500';
}
