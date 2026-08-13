"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withRateLimit } from "@/lib/admin/rate-limit";
import { getServerSession as gs } from "next-auth";

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
  const session = await gs(authOptions);
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

// A5: Export audit logs as CSV or JSON
export async function exportAuditLogs(format: 'csv' | 'json' = 'csv') {
  const session = await gs(authOptions);
  if (!session?.user) throw new Error("Unauthorized");

  const userId = (session.user as unknown as { id: string }).id;
  // A8: Rate limit exports
  withRateLimit(`export:${userId}`, 5);

  // Fetch all logs (up to 10k for safety)
  const logs = await db.adminAuditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10_000,
  });

  const actorIds = [...new Set(logs.map(l => l.actorId))];
  const actors = actorIds.length > 0
    ? await db.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const actorMap = new Map(actors.map(a => [a.id, a]));

  if (format === 'json') {
    return {
      format: 'json',
      filename: `audit-log-${new Date().toISOString().slice(0, 10)}.json`,
      data: JSON.stringify(logs.map(l => ({
        timestamp: l.createdAt,
        actor: actorMap.get(l.actorId)?.name || 'Unknown',
        actorEmail: actorMap.get(l.actorId)?.email || '',
        action: l.action,
        entity: l.entity,
        entityId: l.entityId,
        before: l.before,
        after: l.after,
      })),
    };
  }

  // CSV
  const header = 'Timestamp,Actor,Email,Action,Entity,Entity ID,Before,After\n';
  const rows = logs.map(l => {
    const actor = actorMap.get(l.actorId);
    return [
      l.createdAt.toISOString(),
      (actor?.name || 'Unknown').replace(/,/g, ';'),
      (actor?.email || '').replace(/,/g, ';'),
      l.action,
      l.entity,
      l.entityId || '',
      (l.before || '').replace(/"/g, '""'),
      (l.after || '').replace(/"/g, '""'),
    ].join(',');
  }).join('\n');

  return {
    format: 'csv',
    filename: `audit-log-${new Date().toISOString().slice(0, 10)}.csv`,
    data: header + rows,
  };
}
