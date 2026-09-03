import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { UserRole } from "@/generated/prisma/client";
import { NEXTAUTH_SECRET_FALLBACK, getAuthSecret } from "./auth-secret";
import { eventFailedLoginBurst } from "./admin/notify-events";

// Single source of truth for the secret (+ fallback) lives in auth-secret.ts,
// shared with the middleware and every route that mints or validates sessions.
export { getAuthSecret, NEXTAUTH_SECRET_FALLBACK };
export { sessionCookieName, sessionCookieSecure } from "./auth-secret";

// ── Direct Turso connection for auth (bypasses Prisma singleton issues) ──
// Env-only (G-10 cleared): credentials live in Vercel env vars and local
// .env.local, so rotating them is an env-var change, not a code deploy.
// Never hardcode a fallback here — this file lives in a public repository.
const TURSO_URL = process.env.TURSO_DATABASE_URL || '';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || '';

// ── Failed-login burst detector (Admin OS v2 §7.1) ──────────────────────
// Sliding 10-minute window across all admin sign-in attempts handled here.
// In-memory per serverless instance — imperfect by design: zero schema and
// fast enough to surface credential-stuffing while it is happening. The
// alert fires at most once per window; the bell handles the rest.
const FAILED_WINDOW_MS = 10 * 60 * 1000;
const FAILED_BURST_THRESHOLD = 5;
const failedLoginStamps: number[] = [];
let lastFailedEmail = '';
let burstAlertedAt = 0;

async function recordFailedLogin(email: string): Promise<void> {
  const now = Date.now();
  while (failedLoginStamps.length > 0 && now - failedLoginStamps[0] > FAILED_WINDOW_MS) {
    failedLoginStamps.shift();
  }
  failedLoginStamps.push(now);
  lastFailedEmail = email;

  if (failedLoginStamps.length >= FAILED_BURST_THRESHOLD && now - burstAlertedAt > FAILED_WINDOW_MS) {
    burstAlertedAt = now;
    try {
      await eventFailedLoginBurst({
        attempts: failedLoginStamps.length,
        windowMinutes: FAILED_WINDOW_MS / 60_000,
        lastEmail: lastFailedEmail,
      });
    } catch {
      // Never let alerting break the auth flow.
    }
  }
}

export async function getUserFromTurso(email: string): Promise<{ id: string; email: string; name: string | null; passwordHash: string; role: string; tier: string; twoFactorEnabled: boolean } | null> {
  if (!TURSO_URL || !TURSO_TOKEN) {
    // Fail loud: an unconfigured auth DB must never look like "wrong password".
    throw new Error('AUTH_DB_UNCONFIGURED: set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN (see .env.local.example)');
  }
  const { createClient } = await import('@libsql/client');
  const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
  const res = await client.execute({
    sql: 'SELECT id, email, name, passwordHash, role, tier, twoFactorEnabled FROM "User" WHERE email = ?',
    args: [email],
  });
  const row = res.rows[0];
  if (!row) return null;
  return {
    id: row.id as string,
    email: row.email as string,
    name: (row.name as string) || null,
    passwordHash: row.passwordHash as string,
    role: row.role as string,
    tier: row.tier as string,
    twoFactorEnabled: (row.twoFactorEnabled as number) === 1,
  };
}

// ── Pre-auth 2FA token store ──
const preAuthTokens = new Map<string, { userId: string; expiresAt: number }>();
const PRE_AUTH_TTL_MS = 5 * 60 * 1000;

export function createPreAuthToken(userId: string): string {
  const token = crypto.randomBytes(24).toString('hex');
  preAuthTokens.set(token, { userId, expiresAt: Date.now() + PRE_AUTH_TTL_MS });
  return token;
}

export function consumePreAuthToken(token: string): string | null {
  const entry = preAuthTokens.get(token);
  if (!entry) return null;
  preAuthTokens.delete(token);
  if (entry.expiresAt < Date.now()) return null;
  return entry.userId;
}

export function cleanupPreAuthTokens() {
  const now = Date.now();
  for (const [key, val] of preAuthTokens) {
    if (val.expiresAt < now) preAuthTokens.delete(key);
  }
}

export const ADMIN_ALLOWED_ROLES: UserRole[] = ["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"];

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

        const email = (credentials.email as string).toLowerCase();
        const password = credentials.password as string;

        // Direct Turso query — bypasses Prisma entirely
        const user = await getUserFromTurso(email);
        if (!user || !user.passwordHash) {
          await recordFailedLogin(email);
          return null;
        }

        const allowedRoles: UserRole[] = ADMIN_ALLOWED_ROLES;
        if (!allowedRoles.includes(user.role as UserRole)) {
          await recordFailedLogin(email);
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          await recordFailedLogin(email);
          return null;
        }

        // Valid credentials — the burst window has served its purpose.
        failedLoginStamps.length = 0;

        // 2FA check
        if (user.twoFactorEnabled) {
          const preAuthToken = createPreAuthToken(user.id);
          throw new Error(`2FA_REQUIRED:${user.id}:${preAuthToken}`);
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          tier: user.tier,
        };
      },
    }),
  ],
};
