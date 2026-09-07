"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logAudit } from "@/lib/admin/audit";
import { parseBirthProfile } from "@/lib/validators/profile";
import { validateTestimonial, type TestimonialInput } from "@/lib/validators/testimonial";
import { signActionToken, DELETE_ACTION } from "@/lib/privacy";

/* =============================================================
   MEMBER PROFILE ACTIONS (Vol. 3 #11 + #12)
   Scoped server actions for /profile — every write is keyed to
   the SESSION user, never to a client-supplied id, and every
   mutation is audit-logged. The birth profile has no admin
   surface: the seeker is the only authority on their data.
   ============================================================= */

const BIRTH_SELECT = {
  birthDate: true,
  birthPlace: true,
  latitude: true,
  longitude: true,
  timezone: true,
  natalMoonLng: true,
} as const;

function sessionUserId(session: { user?: unknown } | null): string | null {
  const id = session?.user
    ? (session.user as unknown as { id?: string }).id
    : undefined;
  return typeof id === "string" && id.length > 0 ? id : null;
}

export async function updateBirthProfile(input: unknown): Promise<{
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  saved?: { birthDate: string | null; birthPlace: string | null; latitude: number | null; longitude: number | null; timezone: string | null; natalMoonLng: number | null };
}> {
  const session = await getServerSession(authOptions);
  const userId = sessionUserId(session);
  if (!userId) return { success: false, error: "Authentication required." };

  const parsed =
    input && typeof input === "object"
      ? parseBirthProfile(input as Record<string, unknown>)
      : { ok: false as const, errors: { form: "Invalid submission." } };
  if (!parsed.ok) {
    return { success: false, error: "Please correct the highlighted fields.", fieldErrors: parsed.errors };
  }

  try {
    const before = await db.user.findUnique({
      where: { id: userId },
      select: BIRTH_SELECT,
    });
    if (!before) return { success: false, error: "Account not found." };

    const after = await db.user.update({
      where: { id: userId },
      data: parsed.data,
      select: BIRTH_SELECT,
    });

    await logAudit({
      action: "profile.birth.update",
      entity: "User",
      entityId: userId,
      before,
      after,
    });

    return {
      success: true,
      saved: {
        birthDate: after.birthDate ? after.birthDate.toISOString() : null,
        birthPlace: after.birthPlace,
        latitude: after.latitude,
        longitude: after.longitude,
        timezone: after.timezone,
        natalMoonLng: after.natalMoonLng,
      },
    };
  } catch (err) {
    console.error("[KALKI] updateBirthProfile error:", err);
    return { success: false, error: "Could not save your birth profile. Please try again." };
  }
}

/**
 * Issue a short-lived signed token that arms the account-deletion
 * endpoint. The token is bound to this user, this action, and a
 * 15-minute window — the delete API refuses anything else.
 */
export async function issueDeletionToken(): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  const session = await getServerSession(authOptions);
  const userId = sessionUserId(session);
  if (!userId) return { success: false, error: "Authentication required." };

  try {
    const user = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!user) return { success: false, error: "Account not found." };

    await logAudit({
      action: "profile.delete.token_issued",
      entity: "User",
      entityId: userId,
    });

    return { success: true, token: signActionToken(userId, DELETE_ACTION) };
  } catch (err) {
    console.error("[KALKI] issueDeletionToken error:", err);
    return { success: false, error: "Could not start the deletion flow. Please try again." };
  }
}

/* ═════════════════════════════════════════════════════════════════════
   VOL. 4 #5 — SEEKER TESTIMONIAL INTAKE
   The moment of highest testimony — a milestone reached, a resolution
   logged — used to generate zero capture: Testimonial rows were
   archivist-entered only. This action lets the seeker write their own
   PENDING row (session-gated, consent explicit, audit-logged); the
   existing admin approve flow finishes the journey to public display.
   One self-intake per seeker — dedup keyed on the submittedBy marker.
   ═════════════════════════════════════════════════════════════════════ */

export async function submitTestimonial(input: unknown): Promise<{
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  alreadySubmitted?: boolean;
}> {
  const session = await getServerSession(authOptions);
  const userId = sessionUserId(session);
  if (!userId) return { success: false, error: "Please sign in first." };

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!user?.email) return { success: false, error: "No account email found." };

  // One self-intake per seeker. The archivist's approve flow takes it from
  // here; re-submission (if ever wanted) happens through the archivist,
  // not by re-filing this form.
  const marker = `self:${user.email.toLowerCase()}`;
  const existing = await db.testimonial.findFirst({
    where: { submittedBy: marker },
    select: { id: true },
  });
  if (existing) {
    return {
      success: false,
      alreadySubmitted: true,
      error: "Your testimony is already with the archivist — thank you.",
    };
  }

  const res = validateTestimonial((input ?? {}) as TestimonialInput);
  if (!res.ok) {
    return { success: false, error: "Please review the highlighted fields.", fieldErrors: res.errors };
  }

  try {
    const row = await db.testimonial.create({
      data: {
        quote: res.data.quote,
        name: res.data.displayName,
        context: res.data.context,
        location: res.data.location,
        source: "self",
        status: "PENDING",
        consent: true,
        submittedBy: marker,
      },
    });
    await logAudit({
      action: "testimonial.intake",
      entity: "Testimonial",
      entityId: row.id,
      after: { status: "PENDING", source: "self", consent: true },
    });
    return { success: true };
  } catch (err) {
    console.error("[profile] testimonial intake failed", err);
    return { success: false, error: "Could not save your testimony — please try again." };
  }
}
