import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/keys/generate
 * 
 * Generates a new Golden Key. Requires the user to have
 * remaining keys (default 3 for Initiate+ tiers).
 * 
 * Body: { userId: string, tierGranted?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, tierGranted = 'jal' } = body as {
      userId: string;
      tierGranted?: string;
    };

    if (!userId) {
      return NextResponse.json({ error: 'UserId required.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found in the AKASHA.' }, { status: 404 });
    }

    // Only jal+ can generate keys
    const tierOrder = ['prithvi', 'jal', 'agni', 'akash'];
    if (tierOrder.indexOf(user.tier) < 1) {
      return NextResponse.json(
        { error: 'Only Initiate+ tier can transmit keys. The Antechamber does not have this authority.' },
        { status: 403 }
      );
    }

    if (user.goldKeysRemaining <= 0) {
      return NextResponse.json(
        { error: 'No remaining Golden Keys. The geometry of access is finite.' },
        { status: 403 }
      );
    }

    // Generate a cryptic key: KALKI-XXXX-XXXX
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const code = `KALKI-${seg()}-${seg()}`;

    const invite = await db.inviteCode.create({
      data: {
        code,
        createdBy: userId,
        tierGranted,
        maxUses: 1,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Decrement user's remaining keys
    await db.user.update({
      where: { id: userId },
      data: { goldKeysRemaining: { decrement: 1 } },
    });

    return NextResponse.json({
      key: invite.code,
      tierGranted: invite.tierGranted,
      expiresAt: invite.expiresAt,
      remainingKeys: user.goldKeysRemaining - 1,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Key generation failed.' }, { status: 500 });
  }
}

/**
 * GET /api/keys?vault=userId
 * 
 * Returns the user's vault: their remaining keys
 * and the keys they've generated (with usage status).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vaultUserId = searchParams.get('vault');

    if (!vaultUserId) {
      return NextResponse.json({ error: 'Provide ?vault=userId to access the vault.' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: vaultUserId },
      select: {
        goldKeysRemaining: true,
        tier: true,
        keysGenerated: {
          select: {
            code: true,
            tierGranted: true,
            maxUses: true,
            usesUsed: true,
            active: true,
            createdAt: true,
            expiresAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({
      tier: user.tier,
      remainingKeys: user.goldKeysRemaining,
      vault: user.keysGenerated,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Vault access failed.' }, { status: 500 });
  }
  }
