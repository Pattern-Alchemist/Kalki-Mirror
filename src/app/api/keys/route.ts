import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAuth } from '@/lib/api-auth';
import { generateKeySchema } from '@/lib/validators/schemas';

/**
 * POST /api/keys/generate
 * 
 * Generates a new Golden Key. Requires authentication.
 * The userId is derived from the session, NOT the request body.
 */
export async function POST(request: NextRequest) {
  try {
    const { error: authError, token } = await requireAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const parsed = generateKeySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { tierGranted } = parsed.data;

    const userId = token!.id as string;

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
 * Returns the authenticated user's vault only.
 */
export async function GET(request: NextRequest) {
  try {
    const { error: authError, token } = await requireAuth(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const vaultUserId = searchParams.get('vault');

    // Users can only view their own vault (unless admin)
    const userId = token!.id as string;
    const userRole = token!.role as string;
    if (vaultUserId && vaultUserId !== userId && !['ADMIN', 'SUPERADMIN'].includes(userRole)) {
      return NextResponse.json({ error: 'Access denied. You can only view your own vault.' }, { status: 403 });
    }

    const targetId = vaultUserId || userId;

    const user = await db.user.findUnique({
      where: { id: targetId },
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
