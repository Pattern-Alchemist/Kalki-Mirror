import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

/**
 * SUBSCRIBERS CSV EXPORT — The 10 Doors nurture list.
 *
 * Same contract as the consultations export:
 *   - ADMIN / SUPERADMIN only (PII: email addresses)
 *   - audit-logged with actor
 *   - 5000-row ceiling
 */

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
  try {
    const token = await authenticateRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    const role = (token.role as string) || "";
    if (!["ADMIN", "SUPERADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "Export restricted to ADMIN/SUPERADMIN." },
        { status: 403 },
      );
    }

    const status = request.nextUrl.searchParams.get("status") ?? "";
    const where: Record<string, unknown> = {};
    if (status === "active" || status === "unsubscribed") where.status = status;

    const subs = await db.emailSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        id: true,
        email: true,
        status: true,
        doorDay: true,
        createdAt: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
        utmTerm: true,
        utmContent: true,
        clickId: true,
        country: true,
        referrerDomain: true,
        landingPath: true,
      },
    });

    const header = [
      "id", "email", "status", "doorDay", "createdAt",
      "utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent",
      "clickId", "country", "referrerDomain", "landingPath",
    ];
    const lines = [header.join(",")];
    for (const s of subs) {
      lines.push(
        [
          s.id, s.email, s.status, s.doorDay, s.createdAt.toISOString(),
          s.utmSource, s.utmMedium, s.utmCampaign, s.utmTerm, s.utmContent,
          s.clickId, s.country, s.referrerDomain, s.landingPath,
        ]
          .map(csvCell)
          .join(","),
      );
    }

    try {
      await logAudit({
        action: "subscribers.export",
        entity: "EmailSubscriber",
        actorId: token.id as string,
      });
    } catch {
      // audit is best-effort — never block the download
    }

    const csv = "\uFEFF" + lines.join("\r\n"); // BOM so Excel opens UTF-8 cleanly
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="doors-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
