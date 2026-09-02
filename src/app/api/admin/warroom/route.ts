import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/api-auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * WAR ROOM API — campaign intelligence for the attribution layer.
 *
 * One aggregate endpoint that answers the only three questions that matter
 * during a launch wave (navratri-oct26, guhya-halloween-oct26):
 *   1. Is the funnel producing leads?            → series / kpis / funnel
 *   2. Which doors, sources and campaigns work?  → doors / sources / campaigns
 *   3. Is Tier-1 waking up (Halloween gate)?     → geo / geoTiers (≥15% rule)
 *
 * All computation happens in JS over a single bounded findMany — lead volume
 * is small (hundreds per wave), so this stays fast and keeps zero raw SQL.
 */

const RANGES: Record<string, number> = { "7": 7, "30": 30, "90": 90 };

type Lead = {
  status: string;
  createdAt: Date;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  country: string | null;
  referrerDomain: string | null;
  clickId: string | null;
  landingPath: string | null;
  attributionJson: string | null;
};

const TIER1 = new Set(["US", "GB", "CA", "AU"]);
const GCC = new Set(["AE", "SA", "QA", "KW", "BH", "OM"]);

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function sourceKind(l: Lead): "paid" | "organic" | "referral" | "direct" {
  if (l.clickId) return "paid";
  if (l.utmSource && l.utmSource !== "direct") return "organic";
  if (l.referrerDomain) return "referral";
  return "direct";
}

function bump(map: Map<string, number>, key: string, by = 1) {
  map.set(key, (map.get(key) ?? 0) + by);
}

export async function GET(request: NextRequest) {
  try {
    const token = await authenticateRequest(request);
    if (!token) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (!["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"].includes((token.role as string) || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const params = request.nextUrl.searchParams;
    const rangeParam = params.get("range") ?? "30";
    const days = RANGES[rangeParam] ?? 30; // 'all' | unknown → 30 for the series grid
    const campaignFilter = params.get("campaign") ?? "all";

    // ── Window ────────────────────────────────────────────────────────────
    const now = new Date();
    const rangeStart = new Date(now.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    rangeStart.setUTCHours(0, 0, 0, 0);
    const prevStart = new Date(rangeStart.getTime() - days * 24 * 60 * 60 * 1000);

    const whereCampaign =
      campaignFilter !== "all" ? { utmCampaign: campaignFilter } : {};

    // Current window (series + everything below)
    const leads: Lead[] = await db.consultation.findMany({
      where: { createdAt: { gte: rangeStart }, ...whereCampaign },
      orderBy: { createdAt: "desc" },
      take: 2000,
      select: {
        status: true, createdAt: true, utmSource: true, utmMedium: true,
        utmCampaign: true, utmContent: true, country: true, referrerDomain: true,
        clickId: true, landingPath: true, attributionJson: true,
      },
    });

    // Previous window (delta only)
    const prevLeads = await db.consultation.count({
      where: { createdAt: { gte: prevStart, lt: rangeStart }, ...whereCampaign },
    });

    // ── KPIs ──────────────────────────────────────────────────────────────
    const total = leads.length;
    const booked = leads.filter((l) => l.status === "SCHEDULED" || l.status === "COMPLETED").length;
    const completed = leads.filter((l) => l.status === "COMPLETED").length;
    const contacted = leads.filter((l) => l.status !== "NEW").length;
    const last7 = leads.filter((l) => l.createdAt >= new Date(now.getTime() - 7 * 864e5)).length;
    const deltaPct = prevLeads === 0 ? null : Math.round(((total - prevLeads) / prevLeads) * 100);

    let sessionSum = 0;
    let sessionN = 0;
    for (const l of leads) {
      if (!l.attributionJson) continue;
      try {
        const snap = JSON.parse(l.attributionJson);
        if (typeof snap?.sessions === "number") { sessionSum += snap.sessions; sessionN += 1; }
      } catch { /* malformed snapshot — skip */ }
    }

    const kpis = {
      total,
      prevTotal: prevLeads,
      deltaPct,
      last7,
      booked,
      bookingRate: total > 0 ? Math.round((booked / total) * 100) : 0,
      contactRate: total > 0 ? Math.round((contacted / total) * 100) : 0,
      completed,
      avgSessions: sessionN > 0 ? Math.round((sessionSum / sessionN) * 10) / 10 : 0,
    };

    // ── Daily series (zero-filled) ────────────────────────────────────────
    const byDay = new Map<string, number>();
    for (const l of leads) bump(byDay, dayKey(l.createdAt));
    const series: { day: string; leads: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(rangeStart.getTime() + i * 864e5);
      const key = dayKey(d);
      series.push({ day: key, leads: byDay.get(key) ?? 0 });
    }

    // ── Status counts ─────────────────────────────────────────────────────
    const statusCounts: Record<string, number> = {
      NEW: 0, ACKNOWLEDGED: 0, SCHEDULED: 0, COMPLETED: 0, CANCELLED: 0,
    };
    for (const l of leads) if (l.status in statusCounts) statusCounts[l.status] += 1;

    // ── Geo rollup + Tier-1 gate (the Halloween metric) ───────────────────
    const geoMap = new Map<string, number>();
    for (const l of leads) bump(geoMap, l.country ?? "??");
    const geo = [...geoMap.entries()]
      .map(([country, n]) => ({ country, n }))
      .sort((a, b) => b.n - a.n);
    const gIN = geoMap.get("IN") ?? 0;
    const gT1 = [...geoMap.entries()].filter(([c]) => TIER1.has(c)).reduce((s, [, n]) => s + n, 0);
    const gGCC = [...geoMap.entries()].filter(([c]) => GCC.has(c)).reduce((s, [, n]) => s + n, 0);
    const gOther = total - gIN - gT1 - gGCC;
    const geoTiers = {
      in: gIN, tier1: gT1, gcc: gGCC, other: Math.max(0, gOther),
      tier1Pct: total > 0 ? Math.round((gT1 / total) * 100) : 0,
      // Gate reads only on a meaningful sample (≥20 leads) — mirrors the
      // playbook rule: Tier-1 ≥15% at ≥20 leads → two-geo build decision.
      gate: total >= 20 ? Math.round((gT1 / total) * 100) >= 15 : null,
    };

    // ── Campaign rollup (when unfiltered) ─────────────────────────────────
    const campaigns: { campaign: string; leads: number; booked: number; lastAt: string }[] = [];
    if (campaignFilter === "all") {
      const cmap = new Map<string, { leads: number; booked: number; lastAt: Date }>();
      for (const l of leads) {
        const key = l.utmCampaign ?? "(none)";
        const e = cmap.get(key) ?? { leads: 0, booked: 0, lastAt: l.createdAt };
        e.leads += 1;
        if (l.status === "SCHEDULED" || l.status === "COMPLETED") e.booked += 1;
        if (l.createdAt > e.lastAt) e.lastAt = l.createdAt;
        cmap.set(key, e);
      }
      campaigns.push(...[...cmap.entries()]
        .map(([campaign, v]) => ({ campaign, leads: v.leads, booked: v.booked, lastAt: v.lastAt.toISOString() }))
        .sort((a, b) => b.leads - a.leads));
    }

    // ── Sources (source+medium pairs) & kinds & doors & landing paths ─────
    const srcMap = new Map<string, number>();
    for (const l of leads) bump(srcMap, `${l.utmSource ?? "—"} / ${l.utmMedium ?? "—"}`);
    const sources = [...srcMap.entries()]
      .map(([k, n]) => ({ pair: k, n })).sort((a, b) => b.n - a.n).slice(0, 8);

    const kinds = { paid: 0, organic: 0, referral: 0, direct: 0 };
    for (const l of leads) kinds[sourceKind(l)] += 1;

    const doorMap = new Map<string, number>();
    for (const l of leads) if (l.utmContent) bump(doorMap, l.utmContent);
    const doors = [...doorMap.entries()]
      .map(([content, n]) => ({ content, n })).sort((a, b) => b.n - a.n).slice(0, 12);

    const landMap = new Map<string, number>();
    for (const l of leads) if (l.landingPath) bump(landMap, l.landingPath.split("?")[0] || "/");
    const landing = [...landMap.entries()]
      .map(([path, n]) => ({ path, n })).sort((a, b) => b.n - a.n).slice(0, 8);

    // ── Recent leads feed ─────────────────────────────────────────────────
    const recentRaw = await db.consultation.findMany({
      where: whereCampaign,
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true, name: true, status: true, createdAt: true,
        utmSource: true, utmCampaign: true, country: true,
      },
    });
    const recent = recentRaw.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    }));

    // ── Distinct campaign list (for the selector) ─────────────────────────
    const campRows = await db.consultation.findMany({
      where: { utmCampaign: { not: null } },
      distinct: ["utmCampaign"],
      select: { utmCampaign: true },
      take: 50,
    });
    const campaignList = campRows.map((r) => r.utmCampaign as string).filter(Boolean);

    // ── Email course (The 10 Doors) — capture layer health ────────────────
    // Independent of the campaign selector: the course is a persistent asset,
    // so its numbers are all-time + last-7d velocity, not range-filtered.
    let emailCourse: {
      total: number; active: number; last7: number;
      topSources: { key: string; count: number }[];
      topCampaigns: { key: string; count: number }[];
    } | null = null;
    try {
      const subs = await db.emailSubscriber.findMany({
        select: {
          email: true, status: true, createdAt: true,
          utmSource: true, utmCampaign: true,
        },
      });
      const weekAgo = now.getTime() - 7 * 86_400_000;
      const sourceCounts = new Map<string, number>();
      const campCounts = new Map<string, number>();
      for (const s of subs) {
        sourceCounts.set(s.utmSource ?? "direct", (sourceCounts.get(s.utmSource ?? "direct") ?? 0) + 1);
        if (s.utmCampaign) campCounts.set(s.utmCampaign, (campCounts.get(s.utmCampaign) ?? 0) + 1);
      }
      emailCourse = {
        total: subs.length,
        active: subs.filter((s) => s.status === "active").length,
        last7: subs.filter((s) => s.createdAt.getTime() >= weekAgo).length,
        topSources: [...sourceCounts.entries()]
          .map(([key, count]) => ({ key, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
        topCampaigns: [...campCounts.entries()]
          .map(([key, count]) => ({ key, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3),
      };
    } catch {
      emailCourse = null; // table missing / db hiccup — War Room must never break over a satellite panel
    }

    return NextResponse.json({
      generatedAt: now.toISOString(),
      range: rangeParam,
      campaign: campaignFilter,
      kpis,
      series,
      statusCounts,
      geo,
      geoTiers,
      campaigns,
      sources,
      kinds,
      doors,
      landing,
      recent,
      campaignList,
      emailCourse,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
