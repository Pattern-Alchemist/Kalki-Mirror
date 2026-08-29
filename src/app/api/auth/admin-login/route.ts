import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { encode } from 'next-auth/jwt';
import { getUserFromTurso, createPreAuthToken, getAuthSecret, ADMIN_ALLOWED_ROLES } from '@/lib/auth';
import { sessionCookieName, sessionCookieSecure } from '@/lib/auth-secret';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import type { UserRole } from '@prisma/client';

export const runtime = 'nodejs';

/**
 * POST /api/auth/admin-login
 *
 * Custom JSON login endpoint for the Archivist Console.
 *
 * The login page (/admin/login) POSTs here instead of using NextAuth's
 * signIn() because fetch() cannot read Set-Cookie headers (browser
 * security restriction) and the 2FA-required flow needs a structured
 * JSON response ({ requires2FA, userId, preAuthToken }) that the
 * NextAuth credentials provider cannot express cleanly.
 *
 * Contract with src/app/admin/login/page.tsx:
 *   200 { success: true }                    — session cookie set, redirect
 *   200 { requires2FA, userId, preAuthToken } — proceed to 2FA step
 *   400 { error }                             — malformed request
 *   401 { error: 'Invalid credentials' }      — wrong email/password/role
 *   429 { error }                             — rate limited
 *
 * Session creation mirrors /api/auth/2fa-verify exactly: NextAuth JWT
 * (12h) in the NextAuth session cookie + ActiveSession row with the
 * JTI hash for concurrent-session tracking (A3).
 *
 * The cookie NAME must match what next-auth's getToken() looks for:
 * `__Secure-next-auth.session-token` on HTTPS/Vercel, the bare name on
 * plain HTTP. Setting the bare name on production used to strand every
 * console session in an infinite login redirect.
 */

const SESSION_MAX_AGE = 12 * 60 * 60; // 12 hours — matches NextAuth config

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip') ?? 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    // ── Server-side rate limit (defense in depth; the client also locks
    //    locally after 5 failed attempts). 15 attempts / 5 minutes / IP.
    const ip = clientIp(request);
    const { limited } = await rateLimit({
      key: `admin-login:${ip}`,
      max: 15,
      window: 300,
      prefix: 'rl',
    });
    if (limited) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait before trying again.' },
        { status: 429 }
      );
    }

    // ── Parse + validate payload
    let email: string | undefined;
    let password: string | undefined;
    try {
      const body = await request.json();
      email = body?.email;
      password = body?.password;
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }
    email = email.toLowerCase();

    // ── Credential verification (same rules as the NextAuth authorize())
    const user = await getUserFromTurso(email);
    const passwordOk =
      user && user.passwordHash
        ? await bcrypt.compare(password, user.passwordHash)
        : false;

    // Single generic failure message — never leak whether the account
    // exists, the role was rejected, or the password was wrong.
    if (!user || !user.passwordHash || !passwordOk) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    if (!ADMIN_ALLOWED_ROLES.includes(user.role as UserRole)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // ── 2FA branch: credentials valid, but a TOTP code is required.
    //    Issue a single-use pre-auth token (5 min TTL) — the 2FA step
    //    (/api/auth/2fa-verify) consumes it before creating a session.
    if (user.twoFactorEnabled) {
      return NextResponse.json({
        requires2FA: true,
        userId: user.id,
        preAuthToken: createPreAuthToken(user.id),
      });
    }

    // ── Success: create the NextAuth JWT session (mirrors 2fa-verify)
    const sessionJti = crypto.randomUUID();
    await db.activeSession
      .create({
        data: {
          userId: user.id,
          tokenHash: crypto.createHash('sha256').update(sessionJti).digest('hex').slice(0, 32),
        },
      })
      .catch(() => {});

    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tier: user.tier || 'prithvi',
        jti: sessionJti, // A3: embed session JTI for concurrent session tracking
      },
      secret: getAuthSecret(),
      maxAge: SESSION_MAX_AGE,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(sessionCookieName(request.url), token, {
      httpOnly: true,
      secure: sessionCookieSecure(request.url),
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });
    return response;
  } catch (error) {
    console.error(
      '[admin-login]',
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
