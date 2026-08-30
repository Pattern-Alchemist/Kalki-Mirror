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

    await db.consultation.create({
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

    return { success: true };
  } catch {
    return { success: false, error: "Failed to submit. Please try again." };
  }
}
