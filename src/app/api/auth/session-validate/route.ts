import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { tryGetAuthSecret } from '@/lib/auth-secret';
import { isSessionValid, trackSession } from '@/lib/admin/sessions';

/**
 * GET /api/auth/session-validate
 * Validates that the current JWT session is still active (not evicted).
 * Used by middleware to enforce concurrent session limits.
 *
 * Headers:
 *   X-Kalki-JTI: the JTI from the JWT token
 *   X-Kalki-User-Id: the userId from the JWT token
 *   X-Kalki-User-Agent: the client's User-Agent
 *   X-Kalki-IP: the client's IP
 *
 * Returns 200 if valid, 401 if session was evicted or expired.
 */
export async function GET(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: tryGetAuthSecret(),
    });

    if (!token?.id || !token.jti) {
      return NextResponse.json({ valid: false, reason: 'no_token' }, { status: 401 });
    }

    const userId = token.id as string;
    const jti = token.jti as string;

    // Extract client info from request headers (passed by middleware)
    const userAgent = request.headers.get('x-kalki-user-agent') || undefined;
    const ip = request.headers.get('x-kalki-ip') || undefined;

    // Validate session is still active (not evicted by concurrent limit)
    const valid = await isSessionValid(userId, jti);

    if (!valid) {
      // Session was evicted — re-track if this seems like a legitimate request
      // (The trackSession function will enforce the concurrent limit)
      await trackSession(userId, jti, ip, userAgent);

      // Re-validate after tracking
      const stillValid = await isSessionValid(userId, jti);
      if (!stillValid) {
        return NextResponse.json(
          { valid: false, reason: 'session_evicted' },
          {
            status: 401,
            headers: { 'X-Session-Invalid': 'evicted' },
          }
        );
      }
    }

    // Update lastSeen and tracking info
    await trackSession(userId, jti, ip, userAgent);

    return NextResponse.json({ valid: true });
  } catch {
    // On DB errors, allow the request through (fail-open for availability)
    return NextResponse.json({ valid: true });
  }
}
