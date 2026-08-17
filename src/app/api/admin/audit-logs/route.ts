import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateRequest } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = await authenticateRequest(request);
    if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const take = 30, skip = (page - 1) * take;

    const [logs, total] = await Promise.all([
      db.adminAuditLog.findMany({ orderBy: { createdAt: "desc" }, take, skip }),
      db.adminAuditLog.count(),
    ]);

    const actorIds = [...new Set(logs.map(l => l.actorId))];
    const actors = actorIds.length > 0 ? await db.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, name: true, email: true } }) : [];
    const actorMap = new Map(actors.map(a => [a.id, a]));

    const enriched = logs.map(log => ({ ...log, actor: actorMap.get(log.actorId) || null }));
    return NextResponse.json({ logs: enriched, total, pages: Math.ceil(total / take) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
