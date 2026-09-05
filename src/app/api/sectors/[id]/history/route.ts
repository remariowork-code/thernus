/**
 * Intraday sector score history.
 *
 * Read from the sector history ZSET the worker maintains for the acceleration
 * term — the series already exists, so charting it costs nothing extra.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { KEYS } from '@shared/redis/store';
import { createRedisClient } from '@shared/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: Params): Promise<Response> {
  const { id } = await params;

  try {
    const client = createRedisClient();
    const members = await client.zrange(KEYS.sectorHistory(id), 0, -1);

    // "<timestamp>:<score>" — parsed here rather than trusting the shape.
    const points = members
      .map((member) => {
        const [timestamp, score] = member.split(':').map(Number);
        return { time: Math.floor(timestamp / 1000), value: score };
      })
      .filter((p) => Number.isFinite(p.time) && Number.isFinite(p.value))
      .sort((a, b) => a.time - b.time);

    // The series is sampled every worker tick; one point a second would swamp
    // the chart, so collapse to the last value in each 15-second bucket.
    const deduped: typeof points = [];
    for (const point of points) {
      const bucket = Math.floor(point.time / 15) * 15;
      const last = deduped[deduped.length - 1];
      if (last && last.time === bucket) last.value = point.value;
      else deduped.push({ time: bucket, value: point.value });
    }

    return NextResponse.json({ points: deduped });
  } catch {
    return NextResponse.json({ points: [] });
  }
}
