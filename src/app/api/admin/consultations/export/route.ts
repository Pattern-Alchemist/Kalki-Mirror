import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

/**
 * CONSULTATION CSV EXPORT — full-lead download for offline archivist work.
 *
 * Restrictions:
 *   - ADMIN / SUPERADMIN only (the row set contains PII: name, phone, email).
 *   - Every export is recorded in the audit log with actor + filters.
 *
 * Filters mirror the pipeline page: status, campaign, country. Unfiltered
 * exports cap at 5000 rows (a deliberate ceiling — larger pulls should be
 * a Turso-side query, not an HTTP response).
 */

const STATUSES = new Set(["NEW", "ACKNOWLEDGED", "SCHEDULED", "COMPLETED", "CANCELLED"]);

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
      return NextResponse.json({ error: "Export restricted to ADMIN/SUPERADMIN." }, { status: 403 });
    }

    const params = request.nextUrl.searchParams;
    const status = params.get("status") ?? "";
    const campaign = params.get("campaign") ?? "";
    const country = params.get("country") ?? "";

    const where: Record<string, unknown> = {};
    if (status && STATUSES.has(status)) where.status = status;
    if (campaign) where.utmCampaign = campaign;
    if (country) where.country = country.toUpperCase();

    const leads = await db.consultation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        id: true, createdAt: true, updatedAt: true, status: true,
        name: true, email: true, phone: true, request: true,
        notes: true, scheduledFor: true,
        utmSource: true, utmMedium: true, utmCampaign: true, utmTerm: true,
        utmContent: true, clickId: true, country: true, referrerDomain: true,
        landingPath: true, attributionJson: true,
      },
    });

    const header = [
      "id", "createdAt", "updatedAt", "status", "name", "email", "phone",
      "request", "notes", "scheduledFor",
      "utmSource", "utmMedium", "utmCampaign", "utmTerm", "utmContent",
      "clickId", "country", "referrerDomain", "landingPath",
    ];

    const lines = [header.join(",")];
    for (const l of leads) {
      lines.push([
        l.id,
        l.createdAt.toISOString(),
        l.updatedAt.toISOString(),
        l.status,
        l.name, l.email, l.phone, l.request, l.notes,
        l.scheduledFor ? l.scheduledFor.toISOString() : "",
        l.utmSource, l.utmMedium, l.utmCampaign, l.utmTerm, l.utmContent,
        l.clickId, l.country, l.referrerDomain, l.landingPath,
      ].map(csvCell).join(","));
    }

    // Audit — never block the export on audit failure.
    try {
      await logAudit({
        action: "consultations.export",
        entity: "Consultation",
        after: { count: leads.length, status: status || "ALL", campaign: campaign || "ALL", country: country || "ALL" },
      });
    } catch { /* audit sink unavailable */ }

    const csv = "\uFEFF" + lines.join("\r\n");
    const stamp = new Date().toISOString().slice(0, 10);
    const parts = ["consultations"];
    if (status) parts.push(status.toLowerCase());
    if (campaign) parts.push(campaign);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${parts.join("-")}-${stamp}.csv"`,
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
