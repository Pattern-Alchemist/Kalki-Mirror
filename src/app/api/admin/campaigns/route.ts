import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { tryGetAuthSecret } from '@/lib/auth-secret';
import { db } from '@/lib/db';

// =============================================================
// VOL. 2 #12 — Campaign Analytics API
// -------------------------------------------------------------
// GET /api/admin/campaigns
//   Returns per-campaign metrics: minted, redeemed, pending, revenue.
//   Joins InviteCode.campaign → Consultation.redeemedCode (Vol. 6 #11
//   bridge) → Consultation.paymentState for revenue.
// =============================================================

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN', 'EDITOR', 'REVIEWER'];

interface CampaignRow {
  campaign: string;
  minted: number;
  active: number;
  redeemed: number;
  pending: number;
  revenue: number; // count of PAID consultations that redeemed this campaign's keys
  conversionRate: number; // redeemed / minted
}

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Group keys by campaign — count minted + active
    const keysByCampaign = await db.inviteCode.groupBy({
      by: ['campaign'],
      _count: { _all: true },
      where: { campaign: { not: null } },
    });

    // Active (non-revoked) keys per campaign
    const activeByCampaign = await db.inviteCode.groupBy({
      by: ['campaign'],
      _count: { _all: true },
      where: { campaign: { not: null }, active: true },
    });
    const activeMap = new Map(activeByCampaign.map(r => [r.campaign, r._count._all]));

    // Get all campaign keys + their codes (to join with consultations)
    const allKeys = await db.inviteCode.findMany({
      where: { campaign: { not: null } },
      select: { code: true, campaign: true, maxUses: true, usesUsed: true },
    });
    const codeToCampaign = new Map(allKeys.map(k => [k.code, k.campaign as string]));
    const totalUsesByCampaign = new Map<string, number>();
    for (const k of allKeys) {
      const c = k.campaign as string;
      totalUsesByCampaign.set(c, (totalUsesByCampaign.get(c) ?? 0) + k.usesUsed);
    }

    // All consultations that redeemed any code (Vol. 6 #11 bridge)
    const consultations = await db.consultation.findMany({
      where: { redeemedCode: { not: null } },
      select: { redeemedCode: true, paymentState: true },
    });

    const redeemedByCampaign = new Map<string, number>();
    const revenueByCampaign = new Map<string, number>();
    for (const c of consultations) {
      if (!c.redeemedCode) continue;
      const campaign = codeToCampaign.get(c.redeemedCode);
      if (!campaign) continue;
      redeemedByCampaign.set(campaign, (redeemedByCampaign.get(campaign) ?? 0) + 1);
      if (c.paymentState === 'PAID') {
        revenueByCampaign.set(campaign, (revenueByCampaign.get(campaign) ?? 0) + 1);
      }
    }

    const rows: CampaignRow[] = keysByCampaign.map(r => {
      const campaign = r.campaign as string;
      const minted = r._count._all;
      const active = activeMap.get(campaign) ?? 0;
      const redeemed = redeemedByCampaign.get(campaign) ?? 0;
      const revenue = revenueByCampaign.get(campaign) ?? 0;
      return {
        campaign,
        minted,
        active,
        redeemed,
        pending: minted - redeemed,
        revenue,
        conversionRate: minted > 0 ? Math.round((redeemed / minted) * 100) : 0,
      };
    }).sort((a, b) => b.minted - a.minted);

    // Totals across all campaigns
    const totals = {
      campaigns: rows.length,
      minted: rows.reduce((s, r) => s + r.minted, 0),
      redeemed: rows.reduce((s, r) => s + r.redeemed, 0),
      revenue: rows.reduce((s, r) => s + r.revenue, 0),
    };

    return NextResponse.json({ campaigns: rows, totals });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Unknown error',
    }, { status: 500 });
  }
}
