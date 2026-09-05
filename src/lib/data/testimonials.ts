/**
 * Tier-3 ② — public testimonial fetch (roadmap #12).
 *
 * Server-only module: reads APPROVED + consented rows for the public
 * wall. Returns plain serializable rows — this crosses the server/
 * client boundary into ConsultationsPageClient. Empty result = caller
 * renders nothing (the wall never ships as an empty shell).
 */

import { db } from "@/lib/db";

export interface PublicTestimonial {
  id: string;
  quote: string;
  name: string;
  context: string;
  location: string;
}

export async function getPublicTestimonials(limit = 6): Promise<PublicTestimonial[]> {
  try {
    const rows = await db.testimonial.findMany({
      where: { status: "APPROVED", consent: true },
      orderBy: [{ featured: "desc" }, { approvedAt: "desc" }],
      take: limit,
      select: {
        id: true,
        quote: true,
        name: true,
        context: true,
        location: true,
      },
    });
    return rows;
  } catch {
    // The wall is decoration, not infrastructure — a DB hiccup must
    // never take /consultations down. Empty → section renders nothing.
    return [];
  }
}
