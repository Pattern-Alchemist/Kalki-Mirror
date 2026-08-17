import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateRequest } from "@/lib/api-auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = await authenticateRequest(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const where: Prisma.InviteCodeWhereInput = {};
    if (query) where.OR = [{ code: { contains: query } }, { createdBy: { contains: query } }];

    const take = 20, skip = (page - 1) * take;
    const [keys, total] = await Promise.all([
      db.inviteCode.findMany({ where, include: { creator: { select: { name: true, email: true } }, _count: { select: { usages: true } } }, orderBy: { createdAt: "desc" }, take, skip }),
      db.inviteCode.count({ where }),
    ]);

    return NextResponse.json({ keys, total, pages: Math.ceil(total / take) });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
