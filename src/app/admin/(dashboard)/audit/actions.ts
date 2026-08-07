"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type AuditLogRow = {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string | null;
  before: string | null;
  after: string | null;
  createdAt: Date;
  actor?: { name: string | null; email: string } | null;
};

export async function getAuditLogs(page: number = 1) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const take = 30;
  const skip = (page - 1) * take;

  const [logs, total] = await Promise.all([
    db.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.adminAuditLog.count(),
  ]);

  // Batch-resolve actor names
  const actorIds = [...new Set(logs.map((l) => l.actorId))];
  const actors = actorIds.length > 0
    ? await db.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const actorMap = new Map(actors.map((a) => [a.id, a]));

  const enrichedLogs: AuditLogRow[] = logs.map((log) => ({
    ...log,
    actor: actorMap.get(log.actorId) || null,
  }));

  return { logs: enrichedLogs, total, pages: Math.ceil(total / take) };
}
