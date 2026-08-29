import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { getAnalyticsSnapshot } from "@/lib/analytics-db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics — founder analytics dashboard feed.
 * First-party event store read path (TGA §12). ADMIN+ only because
 * the payload includes subscriber email addresses.
 */
export async function GET(request: NextRequest) {
  try {
    const token = await authenticateRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (!["ADMIN", "SUPERADMIN"].includes((token.role as string) || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const snapshot = await getAnalyticsSnapshot();
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
