import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import {
  getAnalyticsSnapshot,
  getAllSubscribersCsv,
  normalizeRange,
} from "@/lib/analytics-db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics — founder analytics dashboard feed.
 * First-party event store read path (TGA §12). ADMIN+ only because
 * the payload includes subscriber email addresses.
 *
 * Query params:
 *   range   — 7 | 30 | 90 day window (default 30, anything else clamps to 30)
 *   format  — `csv` returns the full subscriber list as a CSV download
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

    const { searchParams } = new URL(request.url);

    if (searchParams.get("format") === "csv") {
      const csv = await getAllSubscribersCsv();
      if (csv === null) {
        return NextResponse.json(
          { error: "Subscriber store unreachable." },
          { status: 503 },
        );
      }
      const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      return new NextResponse(csv, {
        headers: {
          "Cache-Control": "no-store",
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="kalki-subscribers-${stamp}.csv"`,
        },
      });
    }

    const range = normalizeRange(searchParams.get("range"));
    const snapshot = await getAnalyticsSnapshot(range);
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
