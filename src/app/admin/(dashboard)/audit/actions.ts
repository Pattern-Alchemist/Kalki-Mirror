"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getAuditLogs(page: number = 1) {
  const take = 30;
  const skip = (page - 1) * take;

  const [logs, total] = await Promise.all([
    db.adminAuditLog.findMany({
      include: {
        actor: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.adminAuditLog.count(),
  ]);

  return { logs, total, pages: Math.ceil(total / take) };
}