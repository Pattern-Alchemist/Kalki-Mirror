"use server";

import { db } from "@/lib/db";
import { cookies, headers } from "next/headers";
import { z } from "zod";
import {
  ATTRIBUTION_COOKIE,
  parseAttributionCookie,
  referrerDomainOf,
  type AttributionSnapshot,
} from "@/lib/attribution";
import { eventConsultationCreated } from "@/lib/admin/notify-events";
import { PAID_SESSIONS, resolveUpiConfig } from "@/lib/utils/upi";

const consultationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(200, "Name too long."),
  whatsapp: z.string().min(7, "A valid WhatsApp number is required.").max(30, "Number too long."),
  message: z.string().min(10, "Please describe your pattern (at least 10 characters).").max(5000, "Message too long."),
});

/**
 * Reads the visitor's attribution cookie (set client-side by
 * AttributionCapture). Attribution is a nice-to-have: any failure here
 * degrades to `null` and the lead is still created.
 */
async function readAttribution(): Promise<AttributionSnapshot | null> {
  try {
    const jar = await cookies();
    return parseAttributionCookie(jar.get(ATTRIBUTION_COOKIE)?.value);
  } catch {
    return null;
  }
}

/**
 * Edge geo fallback (Phase C). The middleware-mirrored `kr_country` cookie
 * is normally carried inside the attribution snapshot; if the snapshot is
 * missing (blocked cookies, pre-deploy visitor) the submit request itself
 * still carries Vercel's `x-vercel-ip-country` header — so EVERY lead gets
 * a country, even fully untagged ones.
 */
async function readEdgeCountry(): Promise<string | null> {
  try {
    const h = await headers();
    const c = h.get("x-vercel-ip-country");
    return c && /^[A-Za-z]{2}$/.test(c) ? c.toUpperCase() : null;
  } catch {
    return null;
  }
}

export async function submitConsultation(formData: {
  name: string;
  whatsapp: string;
  message: string;
  enrichedMessage?: string;
}) {
  const messageBody = formData.enrichedMessage?.trim() || formData.message || '';
  const parsed = consultationSchema.safeParse({
    name: (formData.name || "").trim(),
    whatsapp: (formData.whatsapp || "").trim(),
    message: messageBody,
  });

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { name, whatsapp, message } = parsed.data;

  try {
    const attribution = await readAttribution();
    const last = attribution?.last;
    const country = last?.country ?? (await readEdgeCountry());

    const created = await db.consultation.create({
      data: {
        name,
        phone: whatsapp,
        email: "",
        request: message,
        status: "NEW",
        // ── Attribution layer (written once; never edited afterwards) ──
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

    // Ring the bell (Admin OS v2 §7.1): the archivist learns of a new lead
    // in seconds instead of at the next console visit. Fire-and-forget by
    // contract — a silent bell must never fail a submitted lead.
    await eventConsultationCreated({
      id: created.id,
      name: created.name,
      request: created.request,
      country: created.country,
      utmSource: created.utmSource,
      utmMedium: created.utmMedium,
      utmCampaign: created.utmCampaign,
    }).catch(() => {});

    const upi = resolveUpiConfig();
    return {
      success: true,
      // Tier-1 ①: the wizard needs the lead id to attach a payment claim
      // ("I've paid — confirm on WhatsApp" → CLAIMED on the reconciliation
      // board). Safe to expose — the seeker received it from their own
      // submission, same trust level as the submit action itself.
      leadId: created.id,
      // Leak L1 — UPI manual rail (founder decision: "just Google Pay or UPI
      // through WhatsApp"). Payload present only when UPI_VPA is configured;
      // otherwise the wizard's success panel stays WhatsApp-only, exactly as
      // before. Runtime env read → setting the var in Vercel needs no rebuild.
      payment: upi ? { ...upi, sessions: PAID_SESSIONS } : null,
    };
  } catch {
    return { success: false, error: "Failed to submit. Please try again." };
  }
}

/**
 * Tier-1 ① — record a payment claim from the wizard success panel.
 *
 * When the seeker taps "I've paid — confirm on WhatsApp", the lead flips
 * UNPAID → CLAIMED on the reconciliation board with the chosen session.
 * Guards:
 *   · never downgrades PAID / WAIVED (archivist reconciliation wins)
 *   · unknown lead id → soft-OK (the WhatsApp confirm message still carries
 *     everything Kaustubh needs; this write is a convenience, not a gate)
 *   · never throws into the client — the claim must not break the handoff
 */
export async function recordPaymentClaim(
  leadId: string,
  sessionSlug: string
): Promise<{ ok: boolean }> {
  try {
    if (!leadId || !sessionSlug) return { ok: false };
    const session = PAID_SESSIONS.find((s) => s.slug === sessionSlug);
    if (!session) return { ok: false };

    const lead = await db.consultation.findUnique({
      where: { id: leadId },
      select: { paymentState: true },
    });
    if (!lead) return { ok: false };
    if (lead.paymentState !== "UNPAID") return { ok: true }; // already claimed/paid/waived

    await db.consultation.update({
      where: { id: leadId },
      data: { paymentState: "CLAIMED", paymentSession: session.slug },
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
