import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Context, Next } from 'hono';

import { get, run, all, now } from './db.ts';

export type Admin = { id: number; name: string; email: string };

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

const sha = (value: string) => createHash('sha256').update(value).digest('hex');

const DAY = 24 * 60 * 60 * 1000;

export function createSession(adminId: number, remember: boolean): { token: string; expiresAt: string } {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + (remember ? 30 * DAY : DAY)).toISOString();
  run('DELETE FROM sessions WHERE expires_at < ?', now());
  run('INSERT INTO sessions (token_hash, admin_id, expires_at) VALUES (?, ?, ?)', sha(token), adminId, expiresAt);
  return { token, expiresAt };
}

export function destroySession(token: string) {
  run('DELETE FROM sessions WHERE token_hash = ?', sha(token));
}

export function createResetToken(adminId: number): string {
  const token = randomBytes(24).toString('hex');
  run('DELETE FROM reset_tokens WHERE admin_id = ?', adminId);
  run('INSERT INTO reset_tokens (token_hash, admin_id, expires_at) VALUES (?, ?, ?)', sha(token), adminId, new Date(Date.now() + 60 * 60 * 1000).toISOString());
  return token;
}

/** Returns the admin id the reset token belongs to, and consumes the token. */
export function consumeResetToken(token: string): number | undefined {
  const row = get<{ admin_id: number; expires_at: string }>('SELECT admin_id, expires_at FROM reset_tokens WHERE token_hash = ?', sha(token));
  if (!row) return undefined;
  run('DELETE FROM reset_tokens WHERE token_hash = ?', sha(token));
  return row.expires_at > now() ? row.admin_id : undefined;
}

export function revokeAllSessions(adminId: number) {
  run('DELETE FROM sessions WHERE admin_id = ?', adminId);
}

export function bearer(c: Context): string | undefined {
  const header = c.req.header('Authorization');
  return header?.startsWith('Bearer ') ? header.slice(7) : undefined;
}

export function adminFor(token: string | undefined): Admin | undefined {
  if (!token) return undefined;
  return get<Admin>(
    `SELECT a.id, a.name, a.email FROM sessions s JOIN admins a ON a.id = s.admin_id
     WHERE s.token_hash = ? AND s.expires_at > ?`,
    sha(token),
    now(),
  );
}

export async function requireAdmin(c: Context, next: Next) {
  const admin = adminFor(bearer(c));
  if (!admin) return c.json({ error: 'Please sign in to continue.' }, 401);
  c.set('admin', admin);
  await next();
}

/** Very small in-memory limiter for sign-in attempts. */
const attempts = new Map<string, { count: number; resetAt: number }>();
export function tooManyAttempts(key: string, limit = 8, windowMs = 15 * 60 * 1000): boolean {
  const entry = attempts.get(key);
  const t = Date.now();
  if (!entry || entry.resetAt < t) {
    attempts.set(key, { count: 1, resetAt: t + windowMs });
    return false;
  }
  entry.count += 1;
  return entry.count > limit;
}
export function clearAttempts(key: string) {
  attempts.delete(key);
}

export function listAdmins() {
  return all('SELECT id, name, email FROM admins');
}
