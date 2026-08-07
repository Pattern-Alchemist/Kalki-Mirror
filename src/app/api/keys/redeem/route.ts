import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { redeemKeySchema } from '@/lib/validators/schemas';

/**
 * POST /api/keys/redeem
 * 
 * Redeems a Golden Key to unlock a tier.
 * Requires authentication. userId is derived from session.
 */
export async function POST(request: NextRequest) {
  try {
    const { error: authError, token } = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const parsed = redeemKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { code } = parsed.data;

    // userId from session, NOT from body
    const userId = token!.id as string;

    const invite = await db.inviteCode.findUnique({
      where: { code },
    });

    if (!invite || !invite.active) {
      return NextResponse.json(
        { error: 'This key does not exist or has been deactivated.' },
        { status: 404 }
      );
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      await db.inviteCode.update({ where: { code }, data: { active: false } });
      return NextResponse.json(
        { error: 'This key has expired. The geometry has shifted.' },
        { status: 410 }
      );
    }

    if (invite.usesUsed >= invite.maxUses) {
      return NextResponse.json(
        { error: 'This key has already been used. Each key is singular.' },
        { status: 409 }
      );
    }

    const existingUsage = await db.inviteUsage.findFirst({
      where: { codeId: invite.id, usedBy: userId },
    });
    if (existingUsage) {
      return NextResponse.json(
        { error: 'You have already used this key.' },
        { status: 409 }
      );
    }

    const tierOrder = ['prithvi', 'jal', 'agni', 'akash'];

    await db.inviteUsage.create({
      data: { codeId: invite.id, usedBy: userId },
    });
    await db.inviteCode.update({
      where: { id: invite.id },
      data: { usesUsed: { increment: 1 } },
    });

    const user = await db.user.findUnique({ where: { id: userId } });
    if (user) {
      const currentIdx = tierOrder.indexOf(user.tier);
      const grantedIdx = tierOrder.indexOf(invite.tierGranted);
      if (grantedIdx > currentIdx) {
        const newKeys = grantedIdx >= 1 ? 3 : 0;
        await db.user.update({
          where: { id: userId },
          data: {
            tier: invite.tierGranted,
            invitedByCode: invite.code,
            goldKeysRemaining: newKeys,
          },
        });
      }
    }

    return NextResponse.json({
      status: 'key_redeemed',
      tierGranted: invite.tierGranted,
      message: `The ${invite.tierGranted} covenant is now active. You have been granted 3 Golden Keys to transmit.`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Key redemption failed.' }, { status: 500 });
  }
}
