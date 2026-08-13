import { NextRequest, NextResponse } from 'next/server';
import { validate2FALogin } from '@/lib/admin/two-factor';
import { consumePreAuthToken } from '@/lib/auth';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { encode } from 'next-auth/jwt';

/**
 * POST /api/auth/2fa-verify
 * Step 2 of login: verify TOTP code when 2FA is enabled.
 * On success, creates a real NextAuth JWT session.
 *
 * Body: { userId, code, preAuthToken }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, code, preAuthToken } = await request.json();

    if (!userId || !code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Validate the pre-auth token to prevent unauthenticated 2FA probing
    const verifiedUserId = consumePreAuthToken(preAuthToken);
    if (!verifiedUserId || verifiedUserId !== userId) {
      return NextResponse.json(
        { error: 'Invalid or expired 2FA session. Please log in again.' },
        { status: 401 }
      );
    }

    const result = await validate2FALogin(userId, code);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || 'Invalid 2FA code' },
        { status: 401 }
      );
    }

    // 2FA verified — create the actual NextAuth session
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    // Track the active session (same as normal login)
    const sessionJti = crypto.randomUUID();
    await db.activeSession.create({
      data: {
        userId: user.id,
        tokenHash: crypto.createHash('sha256').update(sessionJti).digest('hex').slice(0, 32),
      },
    }).catch(() => {});

    // Create NextAuth JWT
    const jwtSecret = process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { error: 'Server misconfigured' },
        { status: 500 }
      );
    }

    const token = await encode({
      token: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tier: user.tier || 'prithvi',
        jti: sessionJti, // A3: embed session JTI for concurrent session tracking
      },
      secret: jwtSecret,
      maxAge: 12 * 60 * 60,
    });

    const response = NextResponse.json({ valid: true, required: result.required });
    response.cookies.set('next-auth.session-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
