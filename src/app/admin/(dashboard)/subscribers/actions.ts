"use server";

import { db } from "@/lib/db";
import { safeGetToken } from "@/lib/get-token-safe";
import { logAudit } from "@/lib/admin/audit";
import { sendDoorDay } from "@/lib/emails/course-send";
import { subscribeRateLimit } from "@/lib/rate-limit";

async function requireAdmin() {
  const session = await safeGetToken();
  if (!session?.id) throw new Error("Unauthorized");
  const role = session.role as string;
  if (!["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"].includes(role)) {
    throw new Error("Forbidden");
  }
}

export type SubscriberRow = {
  id: string;
  email: string;
  status: string;
  doorDay: number | null;
  createdAt: Date;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  country: string | null;
  referrerDomain: string | null;
  landingPath: string | null;
};

export async function getSubscribers(): Promise<SubscriberRow[]> {
  await requireAdmin();
  return db.emailSubscriber.findMany({
    orderBy: { createdAt: "desc" },
    take: 2000,
    select: {
      id: true,
      email: true,
      status: true,
      doorDay: true,
      createdAt: true,
      utmSource: true,
      utmMedium: true,
      utmCampaign: true,
      utmContent: true,
      country: true,
      referrerDomain: true,
      landingPath: true,
    },
  });
}

/* ════════════════════════════════════════════════════════════════════
   TIER 2 #10 — Email engagement analytics
   Per-subscriber engagement rollup (sends × webhook events) plus the
   "Doors 1–5 non-openers" segment with an admin-curated re-send.
   ════════════════════════════════════════════════════════════════════ */

export type EngagementRow = {
  email: string;
  status: string;
  createdAt: Date;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  lastSentAt: string | null;
  lastEventAt: string | null;
};

export type EngagementTotals = {
  sends: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  openRate: number | null; // percent of delivered that were opened
  clickRate: number | null; // percent of delivered that were clicked
};

export type EngagementSnapshot = {
  rows: EngagementRow[];
  totals: EngagementTotals;
  /** door (1-5) → emails that got that Door but never opened it */
  nonOpeners: Record<string, string[]>;
};

type RawEngagementRow = {
  email: string;
  status: string;
  createdAt: Date | string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  lastSentAt: Date | string | null;
  lastEventAt: Date | string | null;
};

export async function getEngagement(): Promise<EngagementSnapshot> {
  await requireAdmin();

  const rows = (await db.$queryRaw<RawEngagementRow[]>`
    SELECT s."email" AS email, s."status" AS status, s."createdAt" AS "createdAt",
      COALESCE(sn."sent", 0) AS sent,
      COALESCE(ev."delivered", 0) AS delivered,
      COALESCE(ev."opened", 0) AS opened,
      COALESCE(ev."clicked", 0) AS clicked,
      COALESCE(ev."bounced", 0) AS bounced,
      sn."lastSentAt" AS "lastSentAt",
      ev."lastEventAt" AS "lastEventAt"
    FROM "EmailSubscriber" s
    LEFT JOIN (
      SELECT "email", COUNT(*) AS sent, MAX("sentAt") AS "lastSentAt"
      FROM "EmailSend" GROUP BY "email"
    ) sn ON sn."email" = s."email"
    LEFT JOIN (
      SELECT "email",
        SUM(CASE WHEN "type" = 'email.delivered' THEN 1 ELSE 0 END) AS delivered,
        SUM(CASE WHEN "type" = 'email.opened' THEN 1 ELSE 0 END) AS opened,
        SUM(CASE WHEN "type" = 'email.clicked' THEN 1 ELSE 0 END) AS clicked,
        SUM(CASE WHEN "type" = 'email.bounced' THEN 1 ELSE 0 END) AS bounced,
        MAX("occurredAt") AS "lastEventAt"
      FROM "EmailEvent" GROUP BY "email"
    ) ev ON ev."email" = s."email"
    ORDER BY s."createdAt" DESC
    LIMIT 500
  `).map((r) => ({
    email: r.email,
    status: r.status,
    createdAt: new Date(r.createdAt),
    sent: Number(r.sent),
    delivered: Number(r.delivered),
    opened: Number(r.opened),
    clicked: Number(r.clicked),
    bounced: Number(r.bounced),
    lastSentAt: r.lastSentAt ? new Date(r.lastSentAt).toISOString() : null,
    lastEventAt: r.lastEventAt ? new Date(r.lastEventAt).toISOString() : null,
  }));

  const totals = rows.reduce<EngagementTotals>(
    (acc, r) => ({
      sends: acc.sends + r.sent,
      delivered: acc.delivered + r.delivered,
      opened: acc.opened + r.opened,
      clicked: acc.clicked + r.clicked,
      bounced: acc.bounced + r.bounced,
      openRate: null,
      clickRate: null,
    }),
    { sends: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, openRate: null, clickRate: null },
  );
  totals.openRate = totals.delivered > 0 ? Math.round((totals.opened / totals.delivered) * 1000) / 10 : null;
  totals.clickRate = totals.delivered > 0 ? Math.round((totals.clicked / totals.delivered) * 1000) / 10 : null;

  // Doors 1–5 non-openers: door sends whose own email id never saw an
  // open/click event (correlated on emailId — an open of any other email
  // does NOT mask a dead Door).
  const rawNonOpeners = await db.$queryRaw<{ door: number; email: string }[]>`
    SELECT sn."doorDay" AS door, sn."email" AS email
    FROM "EmailSend" sn
    JOIN "EmailSubscriber" s ON s."email" = sn."email" AND s."status" = 'active'
    LEFT JOIN "EmailEvent" ev ON ev."emailId" = sn."emailId"
      AND ev."type" IN ('email.opened', 'email.clicked')
    WHERE sn."kind" = 'door' AND sn."doorDay" >= 1 AND sn."doorDay" <= 5
      AND ev."id" IS NULL
    ORDER BY sn."doorDay", sn."email"
  `;
  const nonOpeners: Record<string, string[]> = {};
  for (const r of rawNonOpeners) {
    const key = String(Number(r.door));
    (nonOpeners[key] ??= []).push(r.email);
  }

  return { rows, totals, nonOpeners };
}

/**
 * Re-send one Door (1–5) to subscribers who received it but never opened.
 * Each send flows through sendDoorDay → EmailSend log, so the fresh send
 * becomes a new engagement anchor. Hard cap 50 per invocation.
 */
export async function resendDoorToNonOpeners(
  door: number,
): Promise<{ sent: number; failed: number; total: number; skipped?: string }> {
  await requireAdmin();

  const session = await safeGetToken();
  const limiter = subscribeRateLimit(`resend-door:${session?.id ?? "unknown"}`);
  const { limited } = await limiter;
  if (limited) throw new Error("Rate limited — try again in a few minutes");

  const d = Math.floor(Number(door));
  if (!Number.isInteger(d) || d < 1 || d > 5) {
    throw new Error("Door must be an integer 1–5");
  }

  const raw = await db.$queryRaw<{ email: string }[]>`
    SELECT DISTINCT sn."email" AS email
    FROM "EmailSend" sn
    JOIN "EmailSubscriber" s ON s."email" = sn."email" AND s."status" = 'active'
    LEFT JOIN "EmailEvent" ev ON ev."emailId" = sn."emailId"
      AND ev."type" IN ('email.opened', 'email.clicked')
    WHERE sn."kind" = 'door' AND sn."doorDay" = ${d}
      AND ev."id" IS NULL
    ORDER BY sn."email"
    LIMIT 50
  `;

  let sent = 0;
  let failed = 0;
  for (const row of raw) {
    try {
      const res = await sendDoorDay(row.email, d);
      if (res.ok) sent += 1;
      else failed += 1;
    } catch {
      failed += 1;
    }
  }

  await logAudit({
    action: "email.door-resend",
    entity: "EmailSend",
    after: { door: d, targeted: raw.length, sent, failed },
  }).catch(() => {});

  return { sent, failed, total: raw.length };
}
