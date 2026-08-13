"use server";

import { db } from "@/lib/db";

export type DossierStatus = "NEW" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type OutcomeStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "DISCONTINUED";

export interface ConsultationDossier {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  request: string;
  status: DossierStatus;
  scheduledFor: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Outcome tracking fields
  patternDiagnosis: string | null;
  prescribedSequence: string | null;
  prescribedSiddhis: string | null;
  sessionNotes: string | null;
  outcome: OutcomeStatus | null;
  followUpDate: string | null;
  completedAt: string | null;
}

function mapConsultationToDossier(c: {
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
  patternDiagnosis: string | null;
  prescribedSequence: string | null;
  prescribedSiddhis: string | null;
  sessionNotes: string | null;
  outcome: string | null;
  followUpDate: Date | null;
  completedAt: Date | null;
}): ConsultationDossier {
  return {
    id: c.id,
    userId: c.userId,
    name: c.name,
    email: c.email,
    phone: c.phone,
    request: c.request,
    status: c.status as DossierStatus,
    scheduledFor: c.scheduledFor?.toISOString() ?? null,
    notes: c.notes,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    patternDiagnosis: c.patternDiagnosis,
    prescribedSequence: c.prescribedSequence,
    prescribedSiddhis: c.prescribedSiddhis,
    sessionNotes: c.sessionNotes,
    outcome: c.outcome as OutcomeStatus | null,
    followUpDate: c.followUpDate?.toISOString() ?? null,
    completedAt: c.completedAt?.toISOString() ?? null,
  };
}

/**
 * Retrieve the latest consultation dossier by phone number.
 * Phone lookup is the primary access method — the WhatsApp number
 * serves as the key to the subject's dossier.
 */
export async function getDossierByPhone(
  phone: string
): Promise<{ dossier: ConsultationDossier } | { error: string }> {
  try {
    const normalized = phone.replace(/[\s\-()]/g, "").trim();

    if (!normalized || normalized.length < 7) {
      return { error: "Please enter a valid WhatsApp number." };
    }

    const consultation = await db.consultation.findFirst({
      where: {
        OR: [
          { phone: normalized },
          { phone: { startsWith: normalized } },
          { phone: { endsWith: normalized } },
          { phone: { contains: normalized } },
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    if (!consultation) {
      return { error: "NOT_FOUND" };
    }

    return { dossier: mapConsultationToDossier(consultation) };
  } catch {
    return { error: "Failed to retrieve dossier. Please try again." };
  }
}

/**
 * Retrieve a single consultation dossier by its ID.
 */
export async function getDossierById(
  id: string
): Promise<{ dossier: ConsultationDossier } | { error: string }> {
  try {
    if (!id) {
      return { error: "Missing dossier ID." };
    }

    const consultation = await db.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      return { error: "NOT_FOUND" };
    }

    return { dossier: mapConsultationToDossier(consultation) };
  } catch {
    return { error: "Failed to retrieve dossier. Please try again." };
  }
}
