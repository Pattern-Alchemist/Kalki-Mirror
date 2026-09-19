import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { tryGetAuthSecret } from '@/lib/auth-secret';
import { db } from '@/lib/db';
import { autoTagConsultation, tagsToJson, jsonToTags } from '@/lib/admin/consultation-tags';
import { logAudit } from '@/lib/admin/audit';

// =============================================================
// VOL. 2 #11 — POST /api/admin/consultations/autotag
// -------------------------------------------------------------
// Triggers AI auto-tagging for a single consultation. Reads the
// request text, calls the LLM chain, persists the tags to the
// aiTags column. Returns the assigned tags so the UI can update
// without a full reload.
// =============================================================

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN', 'EDITOR', 'REVIEWER'];

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { consultationId } = body;
    if (!consultationId) {
      return NextResponse.json({ error: 'Missing consultationId' }, { status: 400 });
    }

    const consultation = await db.consultation.findUnique({
      where: { id: consultationId },
      select: { id: true, name: true, email: true, request: true, aiTags: true },
    });
    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    const result = await autoTagConsultation({
      request: consultation.request,
      name: consultation.name,
      email: consultation.email,
    });

    if (!result.ok || result.tags.length === 0) {
      return NextResponse.json({
        ok: false,
        tags: [],
        error: result.error ?? 'No tags assigned',
      }, { status: 200 }); // 200 — the call succeeded, just no tags
    }

    // Persist
    const json = tagsToJson(result.tags);
    await db.consultation.update({
      where: { id: consultationId },
      data: { aiTags: json },
    });

    await logAudit({
      action: 'consultation.autotag',
      entity: 'Consultation',
      entityId: consultationId,
      actorId: token.id as string,
      before: { aiTags: jsonToTags(consultation.aiTags) },
      after: { aiTags: result.tags },
    });

    return NextResponse.json({
      ok: true,
      tags: result.tags,
    });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : 'Unknown error',
    }, { status: 500 });
  }
}
