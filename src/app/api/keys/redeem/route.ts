import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth, getClientIp } from '@/lib/api-auth';
import { redeemKeySchema } from '@/lib/validators/schemas';
import { afterAudit } from '@/lib/after-audit';
import { eventKeyRedeemed } from '@/lib/admin/notify-events';
import { redeemRateLimit, tooManyRequestsResponse } from '@/lib/rate-limit';

/**
 * POST /api/keys/redeem
 *
 * Redeems a Golden Key to unlock a tier.
 * Requires authentication. userId is derived from session.
 *
 * Vol. 6 #10 — abuse gate at the head: 5 attempts / 10 min / IP.
 * fail-CLOSED: redeem is a credential oracle — when the limiter
 * is blind (down/error), the route returns 503 rather than
 * redeem blind. A real seeker rarely mistypes more than twice;
 * an attacker tries 50.
 */
export async function POST(request: NextRequest) {
  try {
    // Vol. 6 #10 — rate limit BEFORE auth (an unauthenticated burst
    // is still a burst). fail-closed: limiter-down = 503.
    const ip = getClientIp(request);
    const rl = await redeemRateLimit(ip);
    if (rl.limited) {
      return tooManyRequestsResponse(rl.reset);
    }

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

    afterAudit({
      action: 'KEY_REDEEMED',
      entity: 'inviteCode',
      entityId: invite.code,
      actorId: userId,
      after: { tierGranted: invite.tierGranted, campaign: invite.campaign },
    });

    // Vol. 6 #11 — stamp redeemedCode on the user's most recent consultation
    // (if one exists). This bridges the key→consultation ledger: a campaign
    // can now be measured by how many of its keys led to a real intake.
    // Best-effort (soft-fail): a missing consultation is not an error.
    if (user?.email) {
      try {
        const recentConsultation = await db.consultation.findFirst({
          where: { email: user.email },
          orderBy: { createdAt: 'desc' },
          take: 1,
        });
        if (recentConsultation && !recentConsultation.redeemedCode) {
          await db.consultation.update({
            where: { id: recentConsultation.id },
            data: { redeemedCode: invite.code },
          });
        }
      } catch {
        // stamp failure never blocks redemption
      }
    }

    // Ring the bell (Admin OS v2 §7.1): "golden key redeemed" is a
    // high-signal growth event — the covenant map just changed. A silent
    // bell must never fail a redemption.
    await eventKeyRedeemed({
      code: invite.code,
      tierGranted: invite.tierGranted,
      userName: user?.name ?? null,
      userEmail: user?.email ?? null,
    }).catch(() => {});

    return NextResponse.json({
      status: 'key_redeemed',
      tierGranted: invite.tierGranted,
      message: `The ${invite.tierGranted} covenant is now active. You have been granted 3 Golden Keys to transmit.`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Key redemption failed.' }, { status: 500 });
  }
}
