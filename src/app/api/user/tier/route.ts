import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';

/**
 * GET /api/user/tier
 *
 * Returns the authenticated user's current tier from the DB.
 * This is the SOLE source of truth for tier — always fresh,
 * not from a potentially stale JWT.
 *
 * Used by TierProvider on mount and after key redemption.
 */
export async function GET(request: Request) {
  const { error: authError, token } = await requireAuth(request as Parameters<typeof requireAuth>[0]);
  if (authError) return authError;

  const userId = token!.id as string;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { tier: true, goldKeysRemaining: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  return NextResponse.json({
    tier: user.tier,
    goldKeysRemaining: user.goldKeysRemaining,
  });
}
