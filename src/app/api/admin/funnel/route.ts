import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { db } from "@/lib/db";
import { getFunnelEvents } from "@/lib/analytics-db";
import { normalizeRange } from "@/lib/analytics-shared";
import {
  buildCampaignRollup,
  buildDoorsRollup,
  buildFunnelStages,
} from "@/lib/admin/funnel";

export const dynamic = "force-dynamic";

/**
 * CONSULTATION FUNNEL API — "The one funnel that matters" (Admin OS v2, 7.2)
 *
 * Five stages, every one mapped to a data source the site already owns:
 *   visitors → wizard started → submitted → triaged → booked
 *
 * Top-of-funnel stages come from the AnalyticsEvent store (raw libSQL);
 * CRM stages come from the Consultation table via Prisma over the same
 * window. Never throws — a dead event store degrades the top two stages
 * to null instead of failing the request.
 */

export async function GET(request: NextRequest) {
  try {
    const token = await authenticateRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (!["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"].includes((token.role as string) || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rangeParam = request.nextUrl.searchParams.get("range") ?? "30";
    const range = normalizeRange(rangeParam);

    // Window aligned to UTC day starts — same convention as the war-room API.
    const now = new Date();
    const rangeStart = new Date(now.getTime() - (range - 1) * 86_400_000);
    rangeStart.setUTCHours(0, 0, 0, 0);

    const [events, windowLeads] = await Promise.all([
      getFunnelEvents(range),
      db.consultation.findMany({
        where: { createdAt: { gte: rangeStart } },
        // Vol. 2 #4 — attribution columns feed the campaign/day rollups.
        select: {
          status: true,
          utmSource: true,
          utmMedium: true,
          utmCampaign: true,
          utmContent: true,
        },
        take: 5000, // bounded — lead volume is hundreds per wave
      }),
    ]);

    const submitted = windowLeads.length;
    // Triaged = the archivist actively touched the lead (moved off NEW,
    // including CANCELLED rejections — a rejection is still triage work).
    const triaged = windowLeads.filter((l) => l.status !== "NEW").length;
    // Booked = revenue-committed stages only (CANCELLED never counts).
    const booked = windowLeads.filter(
      (l) => l.status === "SCHEDULED" || l.status === "COMPLETED",
    ).length;

    const stages = buildFunnelStages({
      visitors: events.sessions,
      wizardStarted: events.consultationStarted,
      submitted,
      triaged,
      booked,
    });

    return NextResponse.json({
      generatedAt: now.toISOString(),
      range,
      eventsAvailable: events.available,
      // Cross-check signal: wizard_submitted events vs Consultation rows.
      // They should agree closely; a gap means the tracker or the wizard
      // action is dropping events.
      wizardSubmittedEvents: events.wizardSubmitted,
      stages,
      // Vol. 2 #4 — where window leads came from: top utm campaigns and
      // the Doors day board (email course → wizard proof).
      attribution: {
        campaigns: buildCampaignRollup(windowLeads),
        doors: buildDoorsRollup(windowLeads),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
