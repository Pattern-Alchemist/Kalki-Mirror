"use server";

/**
 * Tier-3 ② — Testimonials / social proof curation (roadmap #12).
 *
 * Admin-curated by design: Kaustubh collects consented seeker words
 * over WhatsApp after a session, then enters them here. Nothing is
 * self-serve — the public surface (/consultations) renders only
 * APPROVED rows, and only FEATURED ones when space is scarce.
 * Every mutation is audit-logged; publishing a testimonial also
 * pings IndexNow so the refreshed /consultations re-enters indexing
 * pipelines the same day (Tier-3 ① publish-hook).
 */

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/admin/audit";
import { safeGetToken } from "@/lib/get-token-safe";

async function requireAdmin() {
  const session = await safeGetToken();
  if (!session?.id) throw new Error("Unauthorized");
  const role = session.role as string;
  if (!["ADMIN", "SUPERADMIN"].includes(role)) {
    throw new Error("Forbidden");
  }
  return session;
}

export type TestimonialRow = {
  id: string;
  quote: string;
  name: string;
  context: string;
  location: string;
  source: string;
  status: string;
  featured: boolean;
  consent: boolean;
  submittedBy: string;
  approvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getTestimonials() {
  await requireAdmin();

  const [rows, counts] = await Promise.all([
    db.testimonial.findMany({
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      take: 200,
    }),
    db.testimonial.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  return {
    testimonials: rows as unknown as TestimonialRow[],
    counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])),
  };
}

/** Enter a seeker's words (collected over WhatsApp, with consent). */
export async function createTestimonial(input: {
  quote: string;
  name?: string;
  context?: string;
  location?: string;
  source?: string;
  consent: boolean;
}) {
  const session = await requireAdmin();

  const quote = input.quote.trim();
  if (quote.length < 20) {
    return { success: false as const, error: "Quote too short — keep the seeker's substance (20+ chars)." };
  }
  if (!input.consent) {
    return { success: false as const, error: "Consent is required before entering a public testimonial." };
  }

  const row = await db.testimonial.create({
    data: {
      quote: quote.slice(0, 2000),
      name: (input.name ?? "").trim().slice(0, 80),
      context: (input.context ?? "").trim().slice(0, 120),
      location: (input.location ?? "").trim().slice(0, 80),
      source: (input.source ?? "consultation").trim().slice(0, 40),
      consent: true,
      submittedBy: (session.name ?? session.email ?? "").slice(0, 120),
    },
  });

  await logAudit({
    action: "testimonial.create",
    entity: "Testimonial",
    entityId: row.id,
    after: { name: row.name, context: row.context, source: row.source },
  });

  revalidatePath("/admin/testimonials");
  return { success: true as const, id: row.id };
}

/** Publish: APPROVED + approvedAt stamped. Featured rows render on /consultations. */
export async function approveTestimonial(id: string, featured?: boolean) {
  await requireAdmin();

  const row = await db.testimonial.findUniqueOrThrow({ where: { id } });

  const updated = await db.testimonial.update({
    where: { id },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      ...(featured !== undefined ? { featured } : {}),
    },
  });

  await logAudit({
    action: "testimonial.approve",
    entity: "Testimonial",
    entityId: id,
    before: { status: row.status, featured: row.featured },
    after: { status: "APPROVED", featured: updated.featured },
  });

  // Tier-3 ① publish-hook: /consultations changed — ask the indexing
  // pipelines to re-crawl it. Fire-and-forget; a failed ping is a no-op.
  void pingConsultations();

  revalidatePath("/admin/testimonials");
  revalidatePath("/consultations");
  return { success: true as const };
}

/** Pull from the public surface without deleting the record. */
export async function hideTestimonial(id: string) {
  await requireAdmin();

  const row = await db.testimonial.findUniqueOrThrow({ where: { id } });
  await db.testimonial.update({
    where: { id },
    data: { status: "HIDDEN", featured: false },
  });

  await logAudit({
    action: "testimonial.hide",
    entity: "Testimonial",
    entityId: id,
    before: { status: row.status, featured: row.featured },
    after: { status: "HIDDEN" },
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/consultations");
  return { success: true as const };
}

/** Toggle the /consultations spotlight. Only meaningful when APPROVED. */
export async function toggleFeatured(id: string) {
  await requireAdmin();

  const row = await db.testimonial.findUniqueOrThrow({ where: { id } });
  if (row.status !== "APPROVED") {
    return { success: false as const, error: "Approve the testimonial before featuring it." };
  }

  const updated = await db.testimonial.update({
    where: { id },
    data: { featured: !row.featured },
  });

  await logAudit({
    action: "testimonial.feature",
    entity: "Testimonial",
    entityId: id,
    before: { featured: row.featured },
    after: { featured: updated.featured },
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/consultations");
  return { success: true as const };
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();

  const row = await db.testimonial.findUniqueOrThrow({ where: { id } });
  await db.testimonial.delete({ where: { id } });

  await logAudit({
    action: "testimonial.delete",
    entity: "Testimonial",
    entityId: id,
    before: { status: row.status, name: row.name },
  });

  revalidatePath("/admin/testimonials");
  revalidatePath("/consultations");
  return { success: true as const };
}

async function pingConsultations(): Promise<void> {
  try {
    const { pingIndexNow } = await import("@/lib/seo/indexnow");
    await pingIndexNow(["https://www.astrokalki.com/consultations"]);
  } catch {
    // never fail an admin action over an indexing ping
  }
}
