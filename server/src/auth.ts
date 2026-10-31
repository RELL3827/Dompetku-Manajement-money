import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dompetku-dev-session-secret-change-in-production-3827';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const ADMIN_DEV_PASSWORD = process.env.ADMIN_DEV_PASSWORD || '3827';

// In-Memory Brute-force Tracking (Zero Persistence: never written to DB or disk)
interface BruteForceEntry {
  attempts: number;
  lockedUntil: number;
}
const loginAttempts = new Map<string, BruteForceEntry>();

// Clean expired memory records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of loginAttempts.entries()) {
    if (value.lockedUntil < now && now - value.lockedUntil > 15 * 60 * 1000) {
      loginAttempts.delete(key);
    }
  }
}, 10 * 60 * 1000);

// Helper to hash ephemeral IP identifier for in-memory rate-limiting
// Uses a daily salt rotated at runtime so real IPs cannot be reversed
const ephemeralSalt = crypto.randomBytes(16).toString('hex');
function getAnonymizedIpToken(req: FastifyRequest): string {
  const rawIp = req.ip || '127.0.0.1';
  return crypto.createHmac('sha256', ephemeralSalt).update(rawIp).digest('hex').slice(0, 16);
}

export function checkLoginBruteForce(req: FastifyRequest): { allowed: boolean; waitMinutes: number } {
  const token = getAnonymizedIpToken(req);
  const now = Date.now();
  const entry = loginAttempts.get(token);

  if (!entry) return { allowed: true, waitMinutes: 0 };

  if (entry.lockedUntil > now) {
    const waitMinutes = Math.ceil((entry.lockedUntil - now) / 60000);
    return { allowed: false, waitMinutes };
  }

  return { allowed: true, waitMinutes: 0 };
}

export function recordLoginFailure(req: FastifyRequest) {
  const token = getAnonymizedIpToken(req);
  const now = Date.now();
  const entry = loginAttempts.get(token) || { attempts: 0, lockedUntil: 0 };

  entry.attempts += 1;
  // If 5 failed attempts, lock for 15 minutes
  if (entry.attempts >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000;
  }
  loginAttempts.set(token, entry);
}

export function resetLoginFailure(req: FastifyRequest) {
  const token = getAnonymizedIpToken(req);
  loginAttempts.delete(token);
}

// Session Token Generation & Verification
export function createSessionToken(username: string = 'admin'): string {
  const payload = {
    sub: username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days session
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifySessionToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [body, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', SESSION_SECRET).update(body).digest('base64url');

  if (crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    try {
      const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (decoded.exp && decoded.exp > Math.floor(Date.now() / 1000)) {
        return true;
      }
    } catch {
      return false;
    }
  }
  return false;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (ADMIN_PASSWORD_HASH) {
    return bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  }
  // Local development fallback: allows testing with PIN/password 3827
  if (process.env.NODE_ENV !== 'production' && ADMIN_DEV_PASSWORD) {
    return password === ADMIN_DEV_PASSWORD;
  }
  console.warn('[SECURITY] ADMIN_PASSWORD_HASH is not set! Admin login is disabled.');
  return false;
}

// Fastify Auth Guard Hook
export async function requireAdminAuth(req: FastifyRequest, reply: FastifyReply) {
  const sessionCookie = req.cookies?.admin_session;

  if (!sessionCookie || !verifySessionToken(sessionCookie)) {
    reply.status(401).send({
      error: 'Unauthorized',
      message: 'Sesi autentikasi admin tidak valid atau telah kedaluwarsa.',
    });
    return;
  }
}

