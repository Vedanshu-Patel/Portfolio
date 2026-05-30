import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenerativeAI, SchemaType, type Content } from '@google/generative-ai';
import { buildSystemPrompt } from '@/lib/persona';
import { getRedis } from '@/lib/redis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const INTENTS = [
  'projects',
  'skills',
  'experience',
  'education',
  'contact',
  'resume',
  'about',
  'offtopic',
  'unknown',
  'lead_capture',
] as const;
const CONFIDENCES = ['high', 'medium', 'low'] as const;

const BodySchema = z.object({
  sessionId: z.string().min(1).max(128),
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(40),
});

const GeminiResponseSchema = z.object({
  reply: z.string().min(1).max(3000),
  intent: z.enum(INTENTS),
  isLead: z.boolean(),
  confidence: z.enum(CONFIDENCES),
});

type ChatResponse = z.infer<typeof GeminiResponseSchema>;

const FALLBACK: ChatResponse = {
  reply:
    "I'm having a momentary issue reaching my brain — try again in a few seconds. If it keeps happening, reach me at vedanshu.patel02@gmail.com.",
  intent: 'unknown',
  isLead: false,
  confidence: 'low',
};

const TOO_LONG: ChatResponse = {
  reply:
    "That message is past 500 characters — mind tightening it up? I respond best to focused questions.",
  intent: 'offtopic',
  isLead: false,
  confidence: 'high',
};

const RATE_LIMITED: ChatResponse = {
  reply:
    "You're sending messages quickly — let's slow it down. Try again in a bit, or email me at vedanshu.patel02@gmail.com.",
  intent: 'offtopic',
  isLead: false,
  confidence: 'high',
};

export async function POST(req: NextRequest) {
  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { ...FALLBACK, reply: 'Invalid request shape.' },
      { status: 400 }
    );
  }

  const { sessionId, messages } = body;

  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUser) {
    return NextResponse.json(
      { ...FALLBACK, reply: 'No user message in payload.' },
      { status: 400 }
    );
  }

  if (lastUser.content.length > 500) {
    return NextResponse.json(TOO_LONG, { status: 200 });
  }

  try {
    const redis = getRedis();
    const rateKey = `rate:${sessionId}`;
    const count = await redis.incr(rateKey);
    if (count === 1) await redis.expire(rateKey, 3600);
    if (count > 20) return NextResponse.json(RATE_LIMITED, { status: 429 });
  } catch (e) {
    console.error('[chat] rate-limit error (non-fatal):', e);
  }

  const trimmed = messages.slice(-20);

  let parsed: ChatResponse;
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: buildSystemPrompt(),
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            reply: { type: SchemaType.STRING },
            intent: { type: SchemaType.STRING, format: 'enum', enum: [...INTENTS] },
            isLead: { type: SchemaType.BOOLEAN },
            confidence: {
              type: SchemaType.STRING,
              format: 'enum',
              enum: [...CONFIDENCES],
            },
          },
          required: ['reply', 'intent', 'isLead', 'confidence'],
        },
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const last = trimmed[trimmed.length - 1];
    const historyRaw: Content[] = trimmed.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    while (historyRaw.length > 0 && historyRaw[0].role !== 'user') {
      historyRaw.shift();
    }

    const chat = model.startChat({ history: historyRaw });
    const result = await chat.sendMessage(last.content);
    const text = result.response.text();

    let json: unknown;
    try {
      json = JSON.parse(text);
    } catch {
      console.error('[chat] Gemini returned non-JSON:', text);
      return NextResponse.json(FALLBACK, { status: 200 });
    }

    parsed = GeminiResponseSchema.parse(json);
  } catch (e) {
    console.error('[chat] Gemini error:', e);
    try {
      const redis = getRedis();
      await redis.lpush('events:list', {
        sessionId,
        type: 'chat_error',
        userMessage: lastUser.content,
        timestamp: Date.now(),
        error: e instanceof Error ? e.message : String(e),
      });
      await redis.ltrim('events:list', 0, 4999);
    } catch {}
    return NextResponse.json(FALLBACK, { status: 200 });
  }

  try {
    const redis = getRedis();
    const timestamp = Date.now();

    const ops: Promise<unknown>[] = [
      redis.lpush('events:list', {
        sessionId,
        type: 'chat',
        intent: parsed.intent,
        confidence: parsed.confidence,
        userMessage: lastUser.content,
        timestamp,
      }),
      redis.hincrby('intent:counts', parsed.intent, 1),
    ];
    if (parsed.confidence === 'low') {
      ops.push(
        redis.lpush('gaps:list', {
          sessionId,
          question: lastUser.content,
          timestamp,
        })
      );
    }
    await Promise.all(ops);

    const trims: Promise<unknown>[] = [redis.ltrim('events:list', 0, 4999)];
    if (parsed.confidence === 'low') trims.push(redis.ltrim('gaps:list', 0, 499));
    await Promise.all(trims);
  } catch (e) {
    console.error('[chat] logging error (non-fatal):', e);
  }

  return NextResponse.json(parsed, { status: 200 });
}
