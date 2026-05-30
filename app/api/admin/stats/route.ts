import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

type EventRecord = {
  sessionId?: string;
  type?: string;
  intent?: string;
  confidence?: string;
  userMessage?: string;
  timestamp?: number;
};

type GapRecord = {
  sessionId?: string;
  question?: string;
  timestamp?: number;
};

type LeadRecord = {
  sessionId?: string;
  email?: string;
  message?: string;
  wantsCall?: boolean;
  timestamp?: number;
};

function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const redis = getRedis();

    const [allEvents, intentCounts, recentGaps, recentLeads, totalMessages, totalLeads] =
      await Promise.all([
        redis.lrange('events:list', 0, 4999) as Promise<EventRecord[]>,
        redis.hgetall('intent:counts') as Promise<Record<string, string> | null>,
        redis.lrange('gaps:list', 0, 49) as Promise<GapRecord[]>,
        redis.lrange('leads:list', 0, 49) as Promise<LeadRecord[]>,
        redis.llen('events:list'),
        redis.llen('leads:list'),
      ]);

    const now = Date.now();
    const thirtyDayCutoff = now - THIRTY_DAYS_MS;
    const fourteenDayCutoff = now - FOURTEEN_DAYS_MS;

    const uniqueSessions = new Set<string>();
    const dayBuckets = new Map<string, number>();

    for (const ev of allEvents) {
      if (!ev || typeof ev.timestamp !== 'number') continue;
      if (ev.timestamp >= thirtyDayCutoff && ev.sessionId) {
        uniqueSessions.add(ev.sessionId);
      }
      if (ev.timestamp >= fourteenDayCutoff) {
        const key = dayKey(ev.timestamp);
        dayBuckets.set(key, (dayBuckets.get(key) ?? 0) + 1);
      }
    }

    const dailyCounts: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = dayKey(now - i * DAY_MS);
      dailyCounts.push({ date, count: dayBuckets.get(date) ?? 0 });
    }

    return NextResponse.json({
      totalSessions: uniqueSessions.size,
      totalMessages,
      totalLeads,
      intentCounts: intentCounts ?? {},
      recentGaps,
      recentLeads,
      dailyCounts,
    });
  } catch (e) {
    console.error('[admin/stats] error:', e);
    return NextResponse.json({ ok: false, error: 'stats failed' }, { status: 500 });
  }
}
