export const ADMIN_COOKIE_NAME = 'vp_admin';
export const ADMIN_COOKIE_MAX_AGE_SEC = 7 * 24 * 60 * 60;

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return toHex(buf);
}

async function hmacSha256Hex(secret: string, text: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(text));
  return toHex(sig);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function signAdminCookie(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!password || !secret) {
    throw new Error('ADMIN_PASSWORD and ADMIN_COOKIE_SECRET must be set');
  }
  const expiry = Date.now() + ADMIN_COOKIE_MAX_AGE_SEC * 1000;
  const pwHash = await sha256Hex(password);
  const sig = await hmacSha256Hex(secret, `${expiry}.${pwHash}`);
  return `${expiry}.${sig}`;
}

export async function verifyAdminCookie(value: string | undefined): Promise<boolean> {
  if (!value) return false;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_COOKIE_SECRET;
  if (!password || !secret) return false;

  const parts = value.split('.');
  if (parts.length !== 2) return false;
  const [expiryStr, sig] = parts;
  const expiry = Number.parseInt(expiryStr, 10);
  if (!Number.isFinite(expiry) || Date.now() > expiry) return false;

  const pwHash = await sha256Hex(password);
  const expected = await hmacSha256Hex(secret, `${expiry}.${pwHash}`);
  return constantTimeEqual(sig, expected);
}
