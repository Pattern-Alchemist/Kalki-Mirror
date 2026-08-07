"use server";

import { db } from "@/lib/db";
import { logAudit } from "@/lib/admin/audit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  const role = (session.user as unknown as { role: string }).role;
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
};

const STATUSES = ["NEW", "ACKNOWLEDGED", "SCHEDULED", "COMPLETED", "CANCELLED"] as const;

export async function getConsultations(status?: string, page: number = 1) {
  await requireAdmin();

  const where: Record<string, unknown> = {};
  if (status && status !== "ALL") {
    where.status = status;
  }

  const take = 20;
  const skip = (page - 1) * take;

  const [consultations, total] = await Promise.all([
    db.consultation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    db.consultation.count({ where }),
  ]);

  return {
    consultations: consultations as ConsultationRow[],
    total,
    pages: Math.ceil(total / take),
    statuses: STATUSES,
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

  return { success: true };
}
