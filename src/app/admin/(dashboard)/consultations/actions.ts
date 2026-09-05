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
