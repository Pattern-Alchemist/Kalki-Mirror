import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { tryGetAuthSecret } from '@/lib/auth-secret';
import {
  listEmailTemplates,
  upsertEmailTemplate,
  deleteEmailTemplate,
  substitutePlaceholders,
  KNOWN_TEMPLATE_KEYS,
} from '@/lib/admin/email-templates';

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN', 'EDITOR'];

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const templates = await listEmailTemplates();
    const merged = KNOWN_TEMPLATE_KEYS.map((k) => {
      const override = templates.find((t) => t.key === k.key);
      return {
        key: k.key,
        label: k.label,
        description: k.description,
        overridden: !!override,
        subject: override?.subject ?? null,
        body: override?.body ?? null,
        notes: override?.notes ?? null,
        updatedAt: override?.updatedAt ?? null,
      };
    });
    return NextResponse.json({ templates: merged, knownKeys: KNOWN_TEMPLATE_KEYS });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to load templates' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { key, subject, body: templateBody, notes } = body;
    if (!key || !subject || !templateBody) {
      return NextResponse.json({ error: 'Missing key, subject, or body' }, { status: 400 });
    }
    const row = await upsertEmailTemplate({ key, subject, body: templateBody, notes });
    return NextResponse.json({ template: row }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to save template' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    await deleteEmailTemplate(key);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to delete' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { subject, body: templateBody } = body;
    const sampleVars = {
      name: 'Ananya',
      link: 'https://www.astrokalki.com/consultations',
      date: new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' }),
      email: 'ananya@example.com',
      context: 'A reading on the Witness archetype',
    };
    const previewSubject = substitutePlaceholders(subject || '', sampleVars);
    const previewBody = substitutePlaceholders(templateBody || '', sampleVars);
    return NextResponse.json({ subject: previewSubject, body: previewBody });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Preview failed' }, { status: 500 });
  }
}
