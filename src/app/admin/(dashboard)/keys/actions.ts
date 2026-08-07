"use server";

import { db } from "@/lib/db";
import { logAudit } from "@/lib/admin/audit";
import { requireRole } from "@/lib/admin/require-role";
import { Prisma } from "@prisma/client";

function generateKeyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const seg = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `KALKI-${seg()}-${seg()}`;
}

export async function getKeys(query: string, page: number = 1) {
  await requireRole('any_staff');
  const where: Prisma.InviteCodeWhereInput = {};
  if (query) {
    where.OR = [
      { code: { contains: query } },
      { createdBy: { contains: query } },
    ];
  }

  const take = 20;
  const skip = (page - 1) * take;

  const [keys, total] = await Promise.all([
    db.inviteCode.findMany({
      where,
      include: {
        creator: { select: { name: true, email: true } },
        _count: { select: { usages: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.inviteCode.count({ where }),
  ]);

  return { keys, total, pages: Math.ceil(total / take) };
}

export async function generateKeys(count: number, tierGranted: string, maxUses: number, expiresAt?: Date) {
  const actorId = await requireRole('admin_plus');

  const codes = await Promise.all(
    Array.from({ length: count }, () =>
      db.inviteCode.create({
        data: {
          code: generateKeyCode(),
          createdBy: actorId,
          tierGranted,
          maxUses,
          expiresAt: expiresAt || null,
        },
      })
    )
  );

  await logAudit({
    action: "key.generate",
    entity: "InviteCode",
    entityId: codes[0]?.id,
    after: { count, tierGranted, maxUses, expiresAt },
  });

  return codes;
}

export async function revokeKey(codeId: string) {
  await requireRole('admin_plus');
  const key = await db.inviteCode.findUniqueOrThrow({ where: { id: codeId } });
  await db.inviteCode.update({
    where: { id: codeId },
    data: { active: false },
  });

  await logAudit({
    action: "key.revoke",
    entity: "InviteCode",
    entityId: codeId,
    before: { active: true, code: key.code },
    after: { active: false },
  });

  return { success: true };
}
