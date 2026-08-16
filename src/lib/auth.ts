import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "./db";
import type { UserRole } from "@prisma/client";

/** Lazy accessor — avoids top-level throw during `next build`.
 *  NextAuth reads `secret` at request-time, not import-time,
 *  so the env-var check is deferred until an actual auth request arrives.
 *  Falls back to a hardcoded secret on Vercel until env var delivery is fixed. */
const NEXTAUTH_SECRET_FALLBACK = 'qhMa86hvsUKGlY8JM3Kej0FAaq9uTZRCGqsL7LUxRJ8=';

function getAuthSecret(): string {
  const s = process.env.NEXTAUTH_SECRET || (process.env.VERCEL === '1' ? NEXTAUTH_SECRET_FALLBACK : '');
  if (!s) {
    throw new Error(
      "NEXTAUTH_SECRET is not set. Add it to your .env file or Vercel environment variables. Generate one with: openssl rand -base64 32"
    );
  }
  return s;
}

// ── Server-side brute-force protection ──
// Tracks failed attempts per email. In-memory, resets on server restart.
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS = 10;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

function isLoginLocked(email: string): { locked: boolean; remainingSec: number } {
  const entry = loginAttempts.get(email.toLowerCase());
  if (!entry) return { locked: false, remainingSec: 0 };
  if (entry.lockedUntil > Date.now()) {
    return { locked: true, remainingSec: Math.ceil((entry.lockedUntil - Date.now()) / 1000) };
  }
  // Lockout expired, reset
  loginAttempts.delete(email.toLowerCase());
  return { locked: false, remainingSec: 0 };
}

function recordFailedLogin(email: string) {
  const key = email.toLowerCase();
  const entry = loginAttempts.get(key) || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  loginAttempts.set(key, entry);
}

function clearLoginAttempts(email: string) {
  loginAttempts.delete(email.toLowerCase());
}

// ── Pre-auth 2FA token store ──
// Maps temporary tokens to userId for the 2FA verification step.
// Tokens expire after 5 minutes.
const preAuthTokens = new Map<string, { userId: string; expiresAt: number }>();
const PRE_AUTH_TTL_MS = 5 * 60 * 1000;

/** Create a temporary pre-auth token for 2FA flow */
export function createPreAuthToken(userId: string): string {
  const token = crypto.randomBytes(24).toString('hex');
  preAuthTokens.set(token, { userId, expiresAt: Date.now() + PRE_AUTH_TTL_MS });
  return token;
}

/** Validate and consume a pre-auth token, returning the userId */
export function consumePreAuthToken(token: string): string | null {
  const entry = preAuthTokens.get(token);
  if (!entry) return null;
  preAuthTokens.delete(token); // one-time use
  if (entry.expiresAt < Date.now()) return null;
  return entry.userId;
}

/** Clean up expired pre-auth tokens (call periodically) */
export function cleanupPreAuthTokens() {
  const now = Date.now();
  for (const [key, val] of preAuthTokens) {
    if (val.expiresAt < now) preAuthTokens.delete(key);
  }
}

export const authOptions: NextAuthOptions = {
  get secret() { return getAuthSecret(); },
  pages: {
    signIn: "/admin/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as unknown as { id: string }).id;
        token.role = (user as unknown as { role: UserRole }).role;
        token.tier = (user as unknown as { tier: string }).tier;
        if (!token.tier) token.tier = 'prithvi';
        // A3: Embed session JTI for active session tracking
        if (!token.jti) {
          token.jti = crypto.randomUUID();
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { id: string }).id = token.id as string;
        (session.user as unknown as { role: UserRole }).role = token.role as UserRole;
        (session.user as unknown as { tier: string }).tier = token.tier as string || 'prithvi';
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: "Archivist Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;

        // Server-side brute-force check
        const { locked, remainingSec } = isLoginLocked(email);
        if (locked) {
          console.warn(`[AUTH] Login locked for ${email}. ${remainingSec}s remaining.`);
          throw new Error(`LOCKED:${remainingSec}`);
        }

        const user = await db.user.findUnique({
          where: { email },
        });

        console.log(`[AUTH] Login attempt for ${email}: user=${!!user} hasHash=${!!user?.passwordHash} role=${user?.role}`);

        if (!user || !user.passwordHash) {
          recordFailedLogin(email);
          return null;
        }

        const allowedRoles: UserRole[] = ["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"];
        if (!allowedRoles.includes(user.role)) {
          recordFailedLogin(email);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          recordFailedLogin(email);
          return null;
        }

        // Successful credential verification — clear attempts
        clearLoginAttempts(email);

        // A1: If 2FA is enabled, gate login behind a pre-auth token
        if (user.twoFactorEnabled) {
          const preAuthToken = createPreAuthToken(user.id);
          // Use a custom error to signal 2FA requirement.
          // The error message carries the userId and token for the client.
          throw new Error(`2FA_REQUIRED:${user.id}:${preAuthToken}`);
        }

        // No 2FA — proceed with normal login
        // A3: Track active session (fire-and-forget)
        const sessionJti = crypto.randomUUID();
        db.activeSession.create({
          data: {
            userId: user.id,
            tokenHash: crypto.createHash('sha256').update(sessionJti).digest('hex').slice(0, 32),
          },
        }).catch(() => {}); // Non-blocking; DB may not have the table yet

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tier: user.tier,
        };
      },
    }),
  ],
};
