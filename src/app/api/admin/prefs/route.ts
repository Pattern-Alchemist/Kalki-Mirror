import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { tryGetAuthSecret } from '@/lib/auth-secret';
import { getAdminPrefs, updateAdminPrefs, type AdminPrefs } from '@/lib/admin/prefs';

// =============================================================
// VOL. 2 #20 — Admin Preferences API
// -------------------------------------------------------------
// GET  /api/admin/prefs       — get current user's prefs
// POST /api/admin/prefs       — update prefs (merges with existing)
// =============================================================

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN', 'EDITOR', 'REVIEWER'];

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const prefs = await getAdminPrefs(token.id as string);
  return NextResponse.json({ prefs });
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const prefs = await updateAdminPrefs(token.id as string, body as Partial<AdminPrefs>);
    return NextResponse.json({ prefs });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed' }, { status: 500 });
  }
}
