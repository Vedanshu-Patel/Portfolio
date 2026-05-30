import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_MAX_AGE_SEC,
  ADMIN_COOKIE_NAME,
  signAdminCookie,
} from '@/lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD;
  const valid = typeof password === 'string' && !!expected && password === expected;

  if (!valid) {
    await new Promise((r) => setTimeout(r, 400));
    return NextResponse.json({ ok: false, error: 'invalid' }, { status: 401 });
  }

  const value = await signAdminCookie();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE_SEC,
  });
  return res;
}
