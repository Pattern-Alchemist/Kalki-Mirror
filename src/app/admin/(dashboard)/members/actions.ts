"use server";

import { db } from "@/lib/db";
import { logAudit } from "@/lib/admin/audit";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const role = (session.user as unknown as { role: string }).role;
  if (!["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"].includes(role)) {
    throw new Error("Forbidden");
  }
}

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
  await requireAdmin();
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
  await requireAdmin();
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

  return { success: true };
}

export async function updateMemberRole(userId: string, newRole: string, reason: string) {
  await requireAdmin();
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

  return { success: true };
}