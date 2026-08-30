import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import type { UserRole } from "@/generated/prisma/client";
import { NEXTAUTH_SECRET_FALLBACK, getAuthSecret } from "./auth-secret";

// Single source of truth for the secret (+ fallback) lives in auth-secret.ts,
// shared with the middleware and every route that mints or validates sessions.
export { getAuthSecret, NEXTAUTH_SECRET_FALLBACK };
export { sessionCookieName, sessionCookieSecure } from "./auth-secret";

// ── Direct Turso connection for auth (bypasses Prisma singleton issues) ──
// Env-first so a future credential rotation is a Vercel env-var change, not a
// code deploy. The inline value is the same fallback db.ts carries (G-10 debt).
const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://kalki-mirror-pattern-alchemist.aws-ap-south-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY5MDk3MDksImlkIjoiMDFhMDBjMWQtMWUwMS03YzFiLTlhYmItODUyZDgwOGRmMWVlIiwia2lkIjoiRHRnLUxVWDlCZ0VHbXVReEk5WVUzWnFqMjRPTUlGQllHZHpqYTBkT0VuUSIsInJpZCI6IjE5MjA2MDJkLTJmNTYtNDA2Yi05MDI2LWUyNTc4ZjUyMDgyMyJ9.0AavPuqz6W7qQtaHgYHscL21-1YgxlRt0DwRLBi-mHjDGemOrNX9gVkP9Ie2Zl7OXLicEDLBV29ZvHdNb9aNAQ';

export async function getUserFromTurso(email: string): Promise<{ id: string; email: string; name: string | null; passwordHash: string; role: string; tier: string; twoFactorEnabled: boolean } | null> {
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
        if (!user || !user.passwordHash) return null;

        const allowedRoles: UserRole[] = ADMIN_ALLOWED_ROLES;
        if (!allowedRoles.includes(user.role as UserRole)) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

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
