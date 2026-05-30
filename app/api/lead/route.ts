import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getRedis } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const BodySchema = z.object({
  sessionId: z.string().min(1).max(128),
  email: z.string().email().max(254),
  message: z.string().max(2000).optional(),
  wantsCall: z.boolean(),
});

type EventRecord = {
  sessionId?: string;
  userMessage?: string;
  intent?: string;
  timestamp?: number;
};

export async function POST(req: NextRequest) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
  }

  try {
    const redis = getRedis();

    const recent = (await redis.lrange('events:list', 0, 199)) as EventRecord[];
    const contextEvents = recent
      .filter((e) => e?.sessionId === body.sessionId)
      .slice(0, 5);

    await Promise.all([
      redis.lpush('leads:list', {
        sessionId: body.sessionId,
        email: body.email,
        message: body.message ?? '',
        wantsCall: body.wantsCall,
        timestamp: Date.now(),
        context: contextEvents,
      }),
      redis.hincrby('intent:counts', 'lead', 1),
    ]);

    await redis.ltrim('leads:list', 0, 999);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[lead] error:', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
