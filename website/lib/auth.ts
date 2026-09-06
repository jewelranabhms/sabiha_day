import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

/**
 * Lightweight, dependency-free session auth.
 *
 * Two independent sessions:
 *   · `sabiha_admin` — the admin dashboard (password from ADMIN_PASSWORD)
 *   · `sabiha_day`   — the private app (Sabiha's account + optional PIN lock)
 *
 * Tokens are HMAC-signed JSON. Nothing sensitive is stored in the cookie.
 */

export const ADMIN_COOKIE = 'sabiha_admin';
export const DAY_COOKIE = 'sabiha_day';

function secret(): string {
  return process.env.SESSION_SECRET || 'sabiha-dev-secret-change-me';
}

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64url');
}

function sign(payload: Record<string, unknown>) {
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verify<T>(token: string | undefined): T | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = createHmac('sha256', secret()).update(body).digest();
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length) return null;
  if (!timingSafeEqual(given, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as {
      exp?: number;
    };
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload as T;
  } catch {
    return null;
  }
}

/* ── password helpers ─────────────────────────────────────────────────── */

export function hashPin(pin: string, salt = randomBytes(8).toString('hex')) {
  const derived = scryptSync(pin, salt, 32).toString('hex');
  return `s1$${salt}$${derived}`;
}

export function verifyPin(pin: string, stored?: string | null) {
  if (!stored) return false;
  const [v, salt, hash] = stored.split('$');
  if (v !== 's1' || !salt || !hash) return false;
  const derived = scryptSync(pin, salt, 32).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(derived, 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}

export const DEMO_ADMIN_PASSWORD = 'sabiha-admin-2026';
export const DEMO_APP_PASSWORD = 'sabiha2026';

export function verifyAdminPassword(candidate: string) {
  // In production the password MUST come from the environment.
  const expected =
    process.env.ADMIN_PASSWORD ||
    (process.env.NODE_ENV === 'production' ? null : DEMO_ADMIN_PASSWORD);
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/* ── sessions ─────────────────────────────────────────────────────────── */

const DAY_MS = 86_400_000;

export async function createAdminSession() {
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, sign({ role: 'admin', exp: Date.now() + 7 * DAY_MS }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 3600,
  });
}

export async function destroyAdminSession() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return !!verify<{ role: string }>(jar.get(ADMIN_COOKIE)?.value);
}

export interface DaySession {
  userId: string;
  name: string;
  role: string;
  pinLocked: boolean; // true until the PIN is entered
  exp: number;
}

export async function createDaySession(userId: string, name: string, role: string, pinLocked: boolean) {
  const jar = await cookies();
  jar.set(
    DAY_COOKIE,
    sign({ userId, name, role, pinLocked, exp: Date.now() + 30 * DAY_MS }),
    {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 30 * 24 * 3600,
    },
  );
}

export async function getDaySession(): Promise<DaySession | null> {
  const jar = await cookies();
  return verify<DaySession>(jar.get(DAY_COOKIE)?.value);
}

export async function destroyDaySession() {
  const jar = await cookies();
  jar.delete(DAY_COOKIE);
}
