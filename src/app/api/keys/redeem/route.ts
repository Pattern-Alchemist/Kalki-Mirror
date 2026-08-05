import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/keys/redeem
 * 
 * Redeems a Golden Key to unlock a tier.
 * Validates the code, checks expiration, records usage.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId } = body as { code: string; userId: string };

    if (!code || !userId) {
      return NextResponse.json({ error: 'Code and userId required.' }, { status: 400 });
    }

    const invite = await prisma.inviteCode.findUnique({
      where: { code },
    });

    if (!invite || !invite.active) {
      return NextResponse.json(
        { error: 'This key does not exist or has been deactivated.' },
        { status: 404 }
      );
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      await prisma.inviteCode.update({ where: { code }, data: { active: false } });
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

    const existingUsage = await prisma.inviteUsage.findFirst({
      where: { codeId: invite.id, usedBy: userId },
    });
    if (existingUsage) {
      return NextResponse.json(
        { error: 'You have already used this key.' },
        { status: 409 }
      );
    }

    const tierOrder = ['prithvi', 'jal', 'agni', 'akash'];

    await prisma.inviteUsage.create({
      data: { codeId: invite.id, usedBy: userId },
    });
    await prisma.inviteCode.update({
      where: { id: invite.id },
      data: { usesUsed: { increment: 1 } },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const currentIdx = tierOrder.indexOf(user.tier);
      const grantedIdx = tierOrder.indexOf(invite.tierGranted);
      if (grantedIdx > currentIdx) {
        const newKeys = grantedIdx >= 1 ? 3 : 0;
        await prisma.user.update({
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