import { NextRequest, NextResponse } from "next/server";
import { staticDb } from "@/lib/static-db";
import { authenticateRequest } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const token = await authenticateRequest(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "";
    const caution = searchParams.get("caution") || "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const q = searchParams.get("q") || "";

    const where: Record<string, unknown> = {};
    if (section) where.section = section;
    if (caution) where.caution = caution;
    if (q) where.text = { contains: q };

    const take = 20, skip = (page - 1) * take;
    const [chunks, total, sections, cautions] = await Promise.all([
      staticDb.folioChunk.findMany({ where, orderBy: { slug: "asc" }, take, skip }),
      staticDb.folioChunk.count({ where }),
      staticDb.folioChunk.findMany({ distinct: ["section"], select: { section: true } }),
      staticDb.folioChunk.findMany({ distinct: ["caution"], select: { caution: true } }),
    ]);

    return NextResponse.json({ chunks, total, pages: Math.ceil(total / take), sections: sections.map(s => s.section).sort(), cautions: cautions.map(c => c.caution).sort() });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
