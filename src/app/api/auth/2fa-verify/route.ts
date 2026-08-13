import { NextRequest, NextResponse } from 'next/server';
import { validate2FALogin } from '@/lib/admin/two-factor';

/**
 * POST /api/auth/2fa-verify
 * Step 2 of login: verify TOTP code when 2FA is enabled.
 * Receives userId + code from the login page.
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json();

    if (!userId || !code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const result = await validate2FALogin(userId, code);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || 'Invalid 2FA code' },
        { status: 401 }
      );
    }

    return NextResponse.json({ valid: true, required: result.required });
  } catch {
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
