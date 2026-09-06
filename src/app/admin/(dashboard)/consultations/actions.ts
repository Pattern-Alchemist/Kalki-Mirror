"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/admin/audit";
import { dispatchWebhooks } from "@/lib/admin/webhook-dispatch";
import { broadcastNotification } from "@/lib/admin/notifications";
import { safeGetToken } from "@/lib/get-token-safe";

async function requireAdmin() {
  const session = await safeGetToken();
  if (!session?.id) throw new Error("Unauthorized");
  const role = (session.role as string);
  if (!["ADMIN", "SUPERADMIN", "EDITOR", "REVIEWER"].includes(role)) {
    throw new Error("Forbidden");
  }
}

export type ConsultationRow = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  request: string;
  status: string;
  scheduledFor: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Attribution layer
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  clickId: string | null;
  country: string | null;
  referrerDomain: string | null;
  landingPath: string | null;
  attributionJson: string | null;
  // Tier-1 ① — UPI reconciliation ledger
  paymentState: string;
  paymentSession: string | null;
  utrRef: string | null;
  paidAt: Date | null;
  // Vol. 3 #1 — outcome tracking (read by member-facing /dossier)
  patternDiagnosis: string | null;
  prescribedSequence: string | null;
  prescribedSiddhis: string | null;
  sessionNotes: string | null;
  outcome: string | null;
  followUpDate: Date | null;
  completedAt: Date | null;
};

const STATUSES = ["NEW", "ACKNOWLEDGED", "SCHEDULED", "COMPLETED", "CANCELLED"] as const;

export async function getConsultations(status?: string, page: number = 1, take: number = 20) {
  await requireAdmin();

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") {
    where.status = status;
  }

  const cappedTake = Math.min(Math.max(take, 1), 200);
  const skip = (page - 1) * cappedTake;

  const [consultations, total, countGroups] = await Promise.all([
    db.consultation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: cappedTake,
      skip,
    }),
    db.consultation.count({ where }),
    db.consultation.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);

  const counts = Object.fromEntries(
    countGroups.map((g) => [g.status, g._count._all]),
  );

  return {
    consultations: consultations as ConsultationRow[],
    total,
    pages: Math.ceil(total / cappedTake),
    statuses: STATUSES,
    counts,
  };
}

export async function updateConsultationStatus(
  consultationId: string,
  newStatus: string,
  notes?: string
) {
  await requireAdmin();

  const consultation = await db.consultation.findUniqueOrThrow({
    where: { id: consultationId },
  });
  const oldStatus = consultation.status;

  const data: Record<string, unknown> = { status: newStatus };
  if (notes !== undefined) data.notes = notes;

  await db.consultation.update({
    where: { id: consultationId },
    data,
  });

  await logAudit({
    action: "consultation.status.update",
    entity: "Consultation",
    entityId: consultationId,
    before: { status: oldStatus },
    after: { status: newStatus, notes },
  });

  await dispatchWebhooks('consultation.status', { consultationId, oldStatus, newStatus });
  if (newStatus === 'SCHEDULED' || newStatus === 'COMPLETED') {
    await broadcastNotification({
      title: 'Consultation Updated',
      body: `Status: ${oldStatus} → ${newStatus}`,
      type: 'info',
      href: '/admin/consultations',
    });
  }

  revalidatePath('/admin/overview');
  revalidatePath('/admin/consultations');
  return { success: true };
}

/**
 * Tier-1 ① — reconcile a payment claim: mark the lead PAID with the UPI
 * reference/UTR Kaustubh quoted back. Archivist action of record — audited,
 * webhooks fired, bell rung.
 */
export async function setPaymentPaid(
  consultationId: string,
  utrRef?: string
) {
  await requireAdmin();

  const consultation = await db.consultation.findUniqueOrThrow({
    where: { id: consultationId },
  });
  const oldState = consultation.paymentState;

  await db.consultation.update({
    where: { id: consultationId },
    data: {
      paymentState: "PAID",
      paidAt: new Date(),
      ...(utrRef !== undefined && utrRef.trim() !== "" ? { utrRef: utrRef.trim().slice(0, 60) } : {}),
    },
  });

  await logAudit({
    action: "consultation.payment.paid",
    entity: "Consultation",
    entityId: consultationId,
    before: { paymentState: oldState, utrRef: consultation.utrRef },
    after: { paymentState: "PAID", utrRef: utrRef ?? consultation.utrRef, session: consultation.paymentSession },
  });

  await dispatchWebhooks("consultation.payment", {
    consultationId,
    name: consultation.name,
    oldState,
    state: "PAID",
    session: consultation.paymentSession,
    utrRef: utrRef ?? consultation.utrRef,
  });
  await broadcastNotification({
    title: "Payment reconciled",
    body: `${consultation.name} — ${consultation.paymentSession ?? "session"} marked PAID`,
    type: "success",
    href: "/admin/consultations",
  });

  revalidatePath("/admin/overview");
  revalidatePath("/admin/consultations");
  return { success: true };
}

/**
 * Tier-1 ① — waive payment (free discovery path, comps, archival courtesy).
 * Reversible by re-marking PAID; never blocks the pipeline.
 */
export async function setPaymentWaived(consultationId: string) {
  await requireAdmin();

  const consultation = await db.consultation.findUniqueOrThrow({
    where: { id: consultationId },
  });
  const oldState = consultation.paymentState;

  await db.consultation.update({
    where: { id: consultationId },
    data: { paymentState: "WAIVED", paidAt: null },
  });

  await logAudit({
    action: "consultation.payment.waived",
    entity: "Consultation",
    entityId: consultationId,
    before: { paymentState: oldState },
    after: { paymentState: "WAIVED", session: consultation.paymentSession },
  });

  revalidatePath("/admin/overview");
  revalidatePath("/admin/consultations");
  return { success: true };
}

export async function deleteConsultation(consultationId: string) {
  await requireAdmin();

  // Destructive — restricted further than the general admin gate:
  // only ADMIN / SUPERADMIN may remove a lead outright.
  const session = await safeGetToken();
  const role = (session?.role as string) ?? "";
  if (!["ADMIN", "SUPERADMIN"].includes(role)) {
    throw new Error("Forbidden");
  }

  const consultation = await db.consultation.findUniqueOrThrow({
    where: { id: consultationId },
  });

  await db.consultation.delete({ where: { id: consultationId } });

  await logAudit({
    action: "consultation.delete",
    entity: "Consultation",
    entityId: consultationId,
    before: {
      name: consultation.name,
      phone: consultation.phone,
      status: consultation.status,
      utmSource: consultation.utmSource,
      utmCampaign: consultation.utmCampaign,
    },
  });

  await dispatchWebhooks("consultation.delete", {
    consultationId,
    name: consultation.name,
  });

  revalidatePath("/admin/overview");
  revalidatePath("/admin/consultations");
  return { success: true };
}

export async function scheduleConsultation(
  consultationId: string,
  scheduledFor: string,
  notes?: string
) {
  await requireAdmin();

  const consultation = await db.consultation.findUniqueOrThrow({
    where: { id: consultationId },
  });

  await db.consultation.update({
    where: { id: consultationId },
    data: {
      status: "SCHEDULED",
      scheduledFor: new Date(scheduledFor),
      ...(notes !== undefined ? { notes } : {}),
    },
  });

  await logAudit({
    action: "consultation.schedule",
    entity: "Consultation",
    entityId: consultationId,
    before: { status: consultation.status },
    after: { status: "SCHEDULED", scheduledFor, notes },
  });

  await dispatchWebhooks('consultation.new', { consultationId, name: consultation.name, scheduledFor });
  await broadcastNotification({
    title: 'Consultation Scheduled',
    body: `${consultation.name} scheduled for ${new Date(scheduledFor).toLocaleDateString()}`,
    type: 'success',
    href: '/admin/consultations',
  });

  revalidatePath('/admin/overview');
  revalidatePath('/admin/consultations');
  return { success: true };
}

// Vol. 3 #1 — outcome lifecycle. PENDING before the session, IN_PROGRESS
// while the seeker works the prescription, RESOLVED when the loop closes,
// DISCONTINUED when it doesn't. Anything else is rejected — these strings
// are part of the /dossier contract (OutcomeStatus in dossier/actions.ts).
const OUTCOMES = ["PENDING", "IN_PROGRESS", "RESOLVED", "DISCONTINUED"] as const;

/** Parse a comma-separated slug field into the JSON array string /dossier expects; null when emptied. */
function slugListToJson(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined; // field not touched this save
  const slugs = value.split(",").map((s) => s.trim()).filter(Boolean);
  return slugs.length ? JSON.stringify(slugs) : null;
}

/**
 * Vol. 3 #1 — Consultation outcome writer. The missing half of the dossier
 * loop: member-facing /dossier reads patternDiagnosis / prescribedSequence /
 * prescribedSiddhis / sessionNotes / outcome / followUpDate / completedAt,
 * but NO admin surface wrote them — the dossier's promise was unfulfillable.
 * Archivist action of record: audited, webhook fired, bell rung.
 *
 * Field semantics (undefined = leave untouched, ""/null = clear):
 *   · patternSlugs / siddhiSlugs — comma-separated slugs, stored as JSON arrays
 *   · sequenceSlug               — a single sequence slug or empty to clear
 *   · outcome                    — PENDING | IN_PROGRESS | RESOLVED | DISCONTINUED
 *   · sessionNotes               — post-session notes (distinct from internal `notes`)
 *   · followUpDate               — ISO datetime feeding the Vol. 3 #3 follow-up queue
 * RESOLVED / DISCONTINUED also stamp completedAt (once — never clobbered).
 */
export async function saveOutcome(
  consultationId: string,
  input: {
    outcome?: string;
    patternSlugs?: string;
    sequenceSlug?: string;
    siddhiSlugs?: string;
    sessionNotes?: string;
    followUpDate?: string | null;
  }
) {
  await requireAdmin();

  const consultation = await db.consultation.findUniqueOrThrow({
    where: { id: consultationId },
  });

  if (input.outcome !== undefined && !(OUTCOMES as readonly string[]).includes(input.outcome)) {
    throw new Error(`Invalid outcome: ${input.outcome}`);
  }

  const patternJson = slugListToJson(input.patternSlugs);
  const siddhiJson = slugListToJson(input.siddhiSlugs);

  const data: Record<string, unknown> = {};
  if (input.outcome !== undefined) data.outcome = input.outcome || null;
  if (patternJson !== undefined) data.patternDiagnosis = patternJson;
  if (input.sequenceSlug !== undefined) data.prescribedSequence = input.sequenceSlug.trim() || null;
  if (siddhiJson !== undefined) data.prescribedSiddhis = siddhiJson;
  if (input.sessionNotes !== undefined) data.sessionNotes = input.sessionNotes.trim() || null;
  if (input.followUpDate !== undefined) {
    data.followUpDate = input.followUpDate ? new Date(input.followUpDate) : null;
  }

  // A closed loop is stamped once: RESOLVED / DISCONTINUED are terminal
  // outcomes, and completedAt anchors the t+48h testimonial window.
  if (
    (input.outcome === "RESOLVED" || input.outcome === "DISCONTINUED") &&
    !consultation.completedAt
  ) {
    data.completedAt = new Date();
  }

  if (Object.keys(data).length === 0) {
    return { success: false, reason: "nothing to update" };
  }

  await db.consultation.update({ where: { id: consultationId }, data });

  await logAudit({
    action: "consultation.outcome.update",
    entity: "Consultation",
    entityId: consultationId,
    before: {
      outcome: consultation.outcome,
      patternDiagnosis: consultation.patternDiagnosis,
      prescribedSequence: consultation.prescribedSequence,
      prescribedSiddhis: consultation.prescribedSiddhis,
      sessionNotes: consultation.sessionNotes,
      followUpDate: consultation.followUpDate?.toISOString() ?? null,
      completedAt: consultation.completedAt?.toISOString() ?? null,
    },
    after: data,
  });

  await dispatchWebhooks("consultation.outcome", {
    consultationId,
    name: consultation.name,
    outcome: input.outcome ?? consultation.outcome,
    prescribedSequence: data.prescribedSequence ?? consultation.prescribedSequence,
  });

  if (input.outcome === "RESOLVED") {
    await broadcastNotification({
      title: "Consultation RESOLVED",
      body: `${consultation.name} — karmic loop closed; dossier now carries the prescription`,
      type: "success",
      href: "/admin/consultations",
    });
  }

  revalidatePath("/admin/overview");
  revalidatePath("/admin/consultations");
  return { success: true };
}

/**
 * Vol. 3 #3 — follow-up queue. Due = a followUpDate that has arrived, on a
 * consultation that is neither CANCELLED nor terminally outcome'd — the
 * archivist promised to check back and the date says now.
 */
export async function getFollowUpsDue(take: number = 20) {
  await requireAdmin();

  return db.consultation.findMany({
    where: {
      followUpDate: { lte: new Date() },
      status: { not: "CANCELLED" },
      OR: [{ outcome: null }, { outcome: "PENDING" }, { outcome: "IN_PROGRESS" }],
    },
    orderBy: { followUpDate: "asc" },
    take: Math.min(Math.max(take, 1), 50),
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      status: true,
      outcome: true,
      followUpDate: true,
    },
  });
}
