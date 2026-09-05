/**
 * Alert rules and history.
 *
 * Delivery itself is a browser Notification raised by the client when a signal
 * arrives over SSE — the rules here decide which signals qualify.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { currentUserId, databaseRequired } from '@/lib/server/currentUser';
import type { SignalSeverity, SignalType } from '@shared/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SIGNAL_TYPES: SignalType[] = [
  'MOMENTUM_START', 'MOMENTUM_ACCELERATION', 'VOLUME_SPIKE', 'NEW_HIGH', 'VWAP_BREAK',
  'SECTOR_AWAKENING', 'SECTOR_BREAKOUT', 'SECTOR_ACCELERATION', 'CATALYST',
];
const SEVERITIES: SignalSeverity[] = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export async function GET(): Promise<Response> {
  const prisma = getPrisma();
  if (!prisma) return databaseRequired();

  const userId = await currentUserId();
  if (!userId) return databaseRequired();

  const [rules, history] = await Promise.all([
    prisma.alertRule.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),
    prisma.alertEvent.findMany({
      where: { userId },
      include: { signal: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  return NextResponse.json({
    rules: rules.map((r) => ({
      id: r.id, type: r.type, sectorId: r.sectorId,
      minSeverity: r.minSeverity, threshold: r.threshold, enabled: r.enabled,
    })),
    history: history.map((e) => ({
      id: e.id,
      delivered: e.delivered,
      deliveredAt: e.deliveredAt?.toISOString() ?? null,
      createdAt: e.createdAt.toISOString(),
      signal: {
        id: e.signal.id, type: e.signal.type, severity: e.signal.severity,
        headline: e.signal.headline, createdAt: e.signal.createdAt.toISOString(),
      },
    })),
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  const prisma = getPrisma();
  if (!prisma) return databaseRequired();

  const userId = await currentUserId();
  if (!userId) return databaseRequired();

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const type = body?.type;
  const minSeverity = body?.minSeverity;

  if (type !== null && type !== undefined && !SIGNAL_TYPES.includes(type as SignalType)) {
    return NextResponse.json({ error: 'Unknown signal type.' }, { status: 400 });
  }
  if (minSeverity !== undefined && !SEVERITIES.includes(minSeverity as SignalSeverity)) {
    return NextResponse.json({ error: 'Unknown severity.' }, { status: 400 });
  }

  const rule = await prisma.alertRule.create({
    data: {
      userId,
      type: (type as SignalType | null) ?? null,
      sectorId: typeof body?.sectorId === 'string' ? body.sectorId : null,
      minSeverity: (minSeverity as SignalSeverity) ?? 'LOW',
      threshold: typeof body?.threshold === 'number' ? body.threshold : 0,
      enabled: body?.enabled !== false,
    },
  });

  return NextResponse.json({ rule }, { status: 201 });
}

export async function PATCH(request: NextRequest): Promise<Response> {
  const prisma = getPrisma();
  if (!prisma) return databaseRequired();

  const userId = await currentUserId();
  if (!userId) return databaseRequired();

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const id = typeof body?.id === 'string' ? body.id : null;
  if (!id) return NextResponse.json({ error: 'An id is required.' }, { status: 400 });

  const { count } = await prisma.alertRule.updateMany({
    where: { id, userId },
    data: {
      ...(typeof body?.enabled === 'boolean' ? { enabled: body.enabled } : {}),
      ...(SEVERITIES.includes(body?.minSeverity as SignalSeverity)
        ? { minSeverity: body!.minSeverity as SignalSeverity } : {}),
      ...(typeof body?.threshold === 'number' ? { threshold: body.threshold } : {}),
    },
  });

  if (count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
