import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { tryGetAuthSecret } from '@/lib/auth-secret';
import {
  listExperiments,
  upsertExperiment,
  deleteExperiment,
  setExperimentStatus,
  parseVariants,
  type ExperimentVariant,
} from '@/lib/admin/experiments';

// =============================================================
// VOL. 2 #17 — Experiments API
// -------------------------------------------------------------
// GET    /api/admin/experiments       — list all experiments
// POST   /api/admin/experiments       — create or update an experiment
// PATCH  /api/admin/experiments       — set status (RUNNING/PAUSED/COMPLETED)
// DELETE /api/admin/experiments?id=X  — delete an experiment
// =============================================================

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'];

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const experiments = await listExperiments();
  return NextResponse.json({ experiments });
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, name, hypothesis, variants, metric, status } = body;
    if (!name || !hypothesis || !variants || !metric) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const experiment = await upsertExperiment({
      id,
      name,
      hypothesis,
      variants: variants as ExperimentVariant[],
      metric,
      status,
    });
    return NextResponse.json({ experiment }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }
    if (!['DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    await setExperimentStatus(id, status);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await deleteExperiment(id);
  return NextResponse.json({ success: true });
}
