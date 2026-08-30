import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateRequest } from "@/lib/api-auth";
import { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = await authenticateRequest(request);
    if (!token?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const tier = searchParams.get("tier") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const where: Prisma.UserWhereInput = {};
    if (query) where.OR = [{ email: { contains: query } }, { name: { contains: query } }, { id: { contains: query } }];
    if (tier && tier !== "ALL") where.tier = tier;

    const take = 20, skip = (page - 1) * take;
    const [members, total] = await Promise.all([
      db.user.findMany({ where, select: { id: true, email: true, name: true, tier: true, role: true, goldKeysRemaining: true, createdAt: true, _count: { select: { streaks: true, resolutions: true, keysGenerated: true, keysUsed: true } } }, orderBy: { createdAt: "desc" }, take, skip }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({ members, total, pages: Math.ceil(total / take) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
