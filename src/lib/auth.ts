import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { db } from "./db";
import type { UserRole } from "@prisma/client";

const secret = process.env.NEXTAUTH_SECRET;
if (!secret) {
  throw new Error(
    "NEXTAUTH_SECRET is not set. Add it to your .env file or Vercel environment variables. Generate one with: openssl rand -base64 32"
  );
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

export const authOptions: NextAuthOptions = {
  secret,
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as unknown as { id: string }).id = token.id as string;
        (session.user as unknown as { role: UserRole }).role = token.role as UserRole;
        (session.user as unknown as { tier: string }).tier = (token.tier as string) || 'prithvi';
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
          return null;
        }

        const user = await db.user.findUnique({
          where: { email },
        });

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

        // Successful login — clear attempts
        clearLoginAttempts(email);

        // A3: Track active session (fire-and-forget)
        const sessionJti = crypto.randomUUID();
        db.activeSession.create({
          data: {
            userId: user.id,
            tokenHash: crypto.createHash('sha256').update(sessionJti).digest('hex').slice(0, 32),
          },
        }).catch(() => {}); // Non-blocking; DB may not have the table yet

        // A1: If 2FA is enabled, include the flag
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tier: user.tier,
          twoFactorRequired: user.twoFactorEnabled,
        };
      },
    }),
  ],
};
