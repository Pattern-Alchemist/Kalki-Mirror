import { NextRequest, NextResponse, after } from "next/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendWelcome } from "@/lib/emails/course-send";
import {
  ATTRIBUTION_COOKIE,
  parseAttributionCookie,
  referrerDomainOf,
  type AttributionSnapshot,
} from "@/lib/attribution";

export const dynamic = "force-dynamic";

/**
 * DOORS EMAIL COURSE — subscribe endpoint.
 *
 * First-party capture for the 10 Doors nurture list. Mirrors the
 * consultation submit semantics:
 *   - attribution written ONCE (existing rows never get their snapshot
 *     rewritten; a returning email simply re-activates)
 *   - edge country fallback: kr_country cookie → x-vercel-ip-country header
 *   - fail-silent: attribution problems never block a signup
 *   - honeypot field `website` (bots fill it, humans never see it)
 *   - in-memory IP rate limit: 6/min (serverless-instance-local, same
 *     tradeoff the admin login limiter makes)
 *
 * WELCOME EMAIL (doors-email-course.md §1/§3): fires once, for NEW
 * subscribers only, via after() — the response is never blocked and
 * an email outage can never fail a signup (sendWelcome soft-fails).
 */

const schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  website: z.string().max(0).optional().or(z.literal("")), // honeypot: must stay empty
  doorDay: z.coerce.number().int().min(1).max(10).optional().nullable(),
});

const RATE_LIMIT = 6;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= RATE_LIMIT) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear(); // bounded — same eviction posture as middleware
  return false;
}

async function readAttribution(): Promise<AttributionSnapshot | null> {
  try {
    const jar = await cookies();
    return parseAttributionCookie(jar.get(ATTRIBUTION_COOKIE)?.value);
  } catch {
    return null;
  }
}

async function readEdgeCountry(): Promise<string | null> {
  try {
    const h = await headers();
    const c = h.get("x-vercel-ip-country");
    return c && /^[A-Za-z]{2}$/.test(c) ? c.toUpperCase() : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (rateLimited(ip)) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts. Try again in a minute." },
        { status: 429 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      // Deliberately vague on honeypot failures — bots get the same message.
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address." },
        { status: 400 },
      );
    }
    const { email, doorDay } = parsed.data;

    const attribution = await readAttribution();
    const last = attribution?.last;
    const country = last?.country ?? (await readEdgeCountry());

    const existing = await db.emailSubscriber.findUnique({
      where: { email },
      select: { id: true, status: true },
    });

    if (existing) {
      // Attribution is written once — a returning email only re-activates.
      await db.emailSubscriber.update({
        where: { email },
        data: { status: "active" },
      });
    } else {
      await db.emailSubscriber.create({
        data: {
          email,
          status: "active",
          doorDay: doorDay ?? null,
          utmSource: last?.source ?? null,
          utmMedium: last?.medium ?? null,
          utmCampaign: last?.campaign ?? null,
          utmTerm: last?.term ?? null,
          utmContent: last?.content ?? null,
          clickId: last?.clickId ?? null,
          country: country ?? null,
          referrerDomain: referrerDomainOf(last?.referrer) ?? null,
          landingPath: attribution?.first.landingPath ?? null,
          attributionJson: attribution ? JSON.stringify(attribution) : null,
        },
      });
      // Welcome email: once, for first-time subscribers, post-response.
      after(async () => {
        try {
          await sendWelcome(email);
        } catch (e) {
          console.error("[email-course] welcome send failed (post-response)", e);
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Could not subscribe right now. Try again shortly." },
      { status: 500 },
    );
  }
}
