import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticateRequest } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = await authenticateRequest(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") where.status = status;

    const take = 20, skip = (page - 1) * take;
    const [consultations, total] = await Promise.all([
      db.consultation.findMany({ where, orderBy: { createdAt: "desc" }, take, skip }),
      db.consultation.count({ where }),
    ]);

    return NextResponse.json({ consultations, total, pages: Math.ceil(total / take), statuses: ["NEW", "ACKNOWLEDGED", "SCHEDULED", "COMPLETED", "CANCELLED"] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
