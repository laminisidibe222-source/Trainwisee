/**
 * First-party authentication: scrypt password hashes + opaque session tokens.
 *
 * Deliberate choices:
 * - No third-party dependency. `node:crypto` scrypt is a memory-hard KDF and is
 *   fine for this volume of logins.
 * - The cookie holds a 32-byte random token; the database only stores its
 *   SHA-256, so a database leak does not hand out live sessions.
 * - Cookies are httpOnly + SameSite=Lax. SameSite=Lax plus the JSON-only API
 *   keeps cross-site form posts from riding a session (no CSRF token yet — add
 *   one before exposing any state-changing GETs or a wider domain).
 */
import { randomBytes, scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import type { Request, Response, NextFunction } from 'express';

const scryptAsync = promisify(scrypt) as (
  password: string | Buffer,
  salt: string | Buffer,
  keylen: number
) => Promise<Buffer>;

export const SESSION_COOKIE = 'tw_session';
const SESSION_DAYS = 30;

/* ---------------- passwords ---------------- */

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(password.normalize('NFKC'), salt, 64);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const [scheme, saltHex, keyHex] = stored.split('$');
  if (scheme !== 'scrypt' || !saltHex || !keyHex) return false;

  const expected = Buffer.from(keyHex, 'hex');
  const actual = await scryptAsync(password.normalize('NFKC'), Buffer.from(saltHex, 'hex'), expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/* ---------------- tokens ---------------- */

export function newToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashToken(token) };
}

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const sessionExpiry = () => new Date(Date.now() + SESSION_DAYS * 86_400_000);

/* ---------------- cookies ---------------- */

export function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return decodeURIComponent(part.slice(idx + 1).trim());
  }
  return null;
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_DAYS * 86_400_000,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, { path: '/' });
}

/* ---------------- naive rate limiting ---------------- */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Returns false when the caller has exhausted its attempts. */
export function allowAttempt(key: string, limit = 10, windowMs = 15 * 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

/** Keep the map from growing without bound on a long-running process. */
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
}, 5 * 60_000).unref?.();

/* ---------------- validation ---------------- */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function passwordProblem(password: unknown): string | null {
  if (typeof password !== 'string') return 'Password is required.';
  if (password.length < 8) return 'Use at least 8 characters.';
  if (password.length > 200) return 'Password is too long (200 characters max).';
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Include at least one letter and one number.';
  }
  return null;
}

export type AuthUser = { id: number; email: string; name: string | null };

/* Attach the signed-in user (if any) to the request. */
export function attachUser(lookup: (tokenHash: string) => Promise<AuthUser | null>) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const token = readCookie(req, SESSION_COOKIE);
    if (token) {
      try {
        const user = await lookup(hashToken(token));
        if (user) (req as AuthedRequest).user = user;
      } catch (err) {
        console.error('[auth] session lookup failed', err);
      }
    }
    next();
  };
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
}

export function requireUser(req: Request, res: Response): AuthUser | null {
  const user = (req as AuthedRequest).user;
  if (!user) {
    res.status(401).json({ error: 'Sign in to continue.' });
    return null;
  }
  return user;
}
