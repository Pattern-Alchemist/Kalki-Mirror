"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/admin/audit";
import { dispatchWebhooks } from "@/lib/admin/webhook-dispatch";
import { broadcastNotification } from "@/lib/admin/notifications";
import { requireRole } from "@/lib/admin/require-role";
import { withRateLimit } from "@/lib/admin/rate-limit";
import { safeGetToken } from "@/lib/get-token-safe";
import { Prisma } from "@prisma/client";

export type MemberRow = {
  id: string;
  email: string;
  name: string | null;
  tier: string;
  role: string;
  goldKeysRemaining: number;
  createdAt: Date;
  _count: { streaks: number; resolutions: number; keysGenerated: number; keysUsed: number };
};

export async function getMembers(query: string, tier: string, page: number = 1) {
  await requireRole('any_staff');
  const where: Prisma.UserWhereInput = {};

  if (query) {
    where.OR = [
      { email: { contains: query } },
      { name: { contains: query } },
      { id: { contains: query } },
    ];
  }

  if (tier && tier !== "ALL") {
    where.tier = tier;
  }

  const take = 20;
  const skip = (page - 1) * take;

  const [members, total] = await Promise.all([
    db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        tier: true,
        role: true,
        goldKeysRemaining: true,
        createdAt: true,
        _count: {
          select: {
            streaks: true,
            resolutions: true,
            keysGenerated: true,
            keysUsed: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.user.count({ where }),
  ]);

  return { members: members as MemberRow[], total, pages: Math.ceil(total / take) };
}

export async function updateMemberTier(userId: string, newTier: string, reason: string) {
  await requireRole('admin_plus');
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const oldTier = user.tier;

  await db.user.update({
    where: { id: userId },
    data: { tier: newTier },
  });

  await logAudit({
    action: "user.tier.upgrade",
    entity: "User",
    entityId: userId,
    before: { tier: oldTier },
    after: { tier: newTier, reason },
  });

  await dispatchWebhooks('user.tier.change', { userId, oldTier, newTier, reason });
  await broadcastNotification({
    title: 'Tier Changed',
    body: `${user.email}: ${oldTier} → ${newTier}`,
    type: 'info',
    href: '/admin/members',
  });

  revalidatePath('/admin/overview');
  revalidatePath('/admin/members');
  return { success: true };
}

export async function updateMemberRole(userId: string, newRole: string, reason: string) {
  await requireRole('superadmin_only');
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const oldRole = user.role;

  await db.user.update({
    where: { id: userId },
    data: { role: newRole as never },
  });

  await logAudit({
    action: "user.role.change",
    entity: "User",
    entityId: userId,
    before: { role: oldRole },
    after: { role: newRole, reason },
  });

  await dispatchWebhooks('user.role.change', { userId, oldRole, newRole, reason });
  await broadcastNotification({
    title: 'Role Changed',
    body: `${user.email}: ${oldRole} → ${newRole}`,
    type: 'warning',
    href: '/admin/members',
  });

  revalidatePath('/admin/overview');
  revalidatePath('/admin/members');
  return { success: true };
}

// A7: Bulk tier update
export async function bulkUpdateTier(userIds: string[], newTier: string, reason: string) {
  await requireRole('admin_plus');
  const session = await safeGetToken();
  const actorId = session?.id || 'unknown';

  // A8: Rate limit
  withRateLimit(`bulk:${actorId}`, 10);

  const result = await db.user.updateMany({
    where: { id: { in: userIds } },
    data: { tier: newTier },
  });

  await logAudit({
    action: "user.tier.bulk",
    entity: "User",
    actorId,
    before: { count: userIds.length },
    after: { tier: newTier, affected: result.count, reason },
  });

  await dispatchWebhooks('user.tier.bulk', { count: userIds.length, newTier, affected: result.count });
  await broadcastNotification({
    title: 'Bulk Tier Update',
    body: `${result.count} members updated to ${newTier}`,
    type: 'info',
    href: '/admin/members',
  });

  revalidatePath('/admin/overview');
  revalidatePath('/admin/members');
  return { success: true, affected: result.count };
}

// A11: Activity timeline for a member
export async function getMemberTimeline(userId: string) {
  await requireRole('any_staff');

  const [auditEvents, streaks, resolutions, keyUsages] = await Promise.all([
    db.adminAuditLog.findMany({
      where: { entityId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    db.sadhanaStreak.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: { practice: true, practiceName: true, currentStreak: true, longestStreak: true, updatedAt: true },
    }),
    db.patternResolution.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, patternSlug: true, status: true, createdAt: true },
    }),
    db.inviteUsage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { id: true, inviteCode: true, createdAt: true },
    }),
  ]);

  return { auditEvents, streaks, resolutions, keyUsages };
}
