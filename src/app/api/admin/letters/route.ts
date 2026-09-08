// =============================================================
// KALKI — Letters archive curation API (Vol. 5 #6)
// -------------------------------------------------------------
// The send path auto-captures every confirmed broadcast as a
// public Letter row — but until now there was NO way to curate
// the archive: no seeding of founder-review drafts, no unpublish,
// no copy fix. This surface is the missing side of the pipeline:
//
//   GET  — curation list (metadata only; bodies never leave the
//          admin boundary through this endpoint)
//   POST — upsert by slug. Seeds drafts (isPublic:false) and
//          publishes flips (isPublic:true). A draft→public flip
//          re-dates sentAt to the publish moment so the archive
//          reads in publish order, not seed order.
//
// The launch-letters pipeline (content/launch-letters/ +
// scripts/seed-launch-letters.mjs) drives this endpoint; the
// founder's publish step is the same POST with isPublic:true.
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/api-auth';
import { db } from '@/lib/db';
import { logAudit } from '@/lib/admin/audit';

export const dynamic = 'force-dynamic';

/** URL-safe slug contract — same shape letterSlug() produces. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_BATCH = 20;

interface LetterInput {
  slug: string;
  subject: string;
  body: string;
  isPublic?: boolean;
}

type ParseResult = { ok: true; letters: LetterInput[] } | { ok: false; error: string };

function parseInputs(raw: unknown): ParseResult {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { ok: false, error: 'Body must be {"letters": [...]} with at least one letter.' };
  }
  if (raw.length > MAX_BATCH) {
    return { ok: false, error: `At most ${MAX_BATCH} letters per call.` };
  }
  const letters: LetterInput[] = [];
  for (const item of raw) {
    const l = item as Partial<LetterInput>;
    if (typeof l.slug !== 'string' || !SLUG_RE.test(l.slug) || l.slug.length > 80) {
      return { ok: false, error: `Invalid slug: ${JSON.stringify(l.slug)} (lowercase-kebab, ≤80 chars).` };
    }
    if (typeof l.subject !== 'string' || l.subject.trim().length === 0 || l.subject.length > 200) {
      return { ok: false, error: `Invalid subject for ${l.slug} (1–200 chars).` };
    }
    if (typeof l.body !== 'string' || l.body.trim().length === 0 || l.body.length > 20000) {
      return { ok: false, error: `Invalid body for ${l.slug} (1–20000 chars).` };
    }
    letters.push({
      slug: l.slug,
      subject: l.subject.trim(),
      body: l.body,
      isPublic: l.isPublic === true,
    });
  }
  return { ok: true, letters };
}

async function requireRole(request: NextRequest): Promise<NextResponse | null> {
  const token = await authenticateRequest(request);
  if (!token) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  if (!['ADMIN', 'SUPERADMIN'].includes((token.role as string) || '')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

/** Curation list — metadata only, no bodies. */
export async function GET(request: NextRequest) {
  const denied = await requireRole(request);
  if (denied) return denied;
  try {
    const letters = await db.letter.findMany({
      select: {
        id: true,
        slug: true,
        subject: true,
        isPublic: true,
        sentAt: true,
        recipientCount: true,
      },
      orderBy: { sentAt: 'desc' },
      take: 200,
    });
    return NextResponse.json({ letters });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** Upsert by slug — the seed + publish path. */
export async function POST(request: NextRequest) {
  const denied = await requireRole(request);
  if (denied) return denied;
  try {
    const parsedBody = (await request.json().catch(() => undefined)) as { letters?: unknown } | undefined;
    const parsed = parseInputs(parsedBody?.letters);
    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 422 });
    }

    // Prior state first — the draft→public flip re-dates sentAt so the
    // archive reads in publish order. Copy edits keep the original date.
    const existing = await db.letter.findMany({
      where: { slug: { in: parsed.letters.map((l) => l.slug) } },
      select: { slug: true, isPublic: true },
    });
    const wasPublic = new Map(existing.map((r) => [r.slug, r.isPublic]));

    const results: { slug: string; isPublic: boolean; created: boolean }[] = [];
    for (const l of parsed.letters) {
      const prev = wasPublic.get(l.slug);
      const flippingPublic = l.isPublic === true && prev !== true;
      const row = await db.letter.upsert({
        where: { slug: l.slug },
        create: {
          slug: l.slug,
          subject: l.subject,
          body: l.body,
          isPublic: l.isPublic === true,
        },
        update: {
          subject: l.subject,
          body: l.body,
          isPublic: l.isPublic === true,
          ...(flippingPublic ? { sentAt: new Date() } : {}),
        },
      });
      results.push({ slug: row.slug, isPublic: row.isPublic, created: prev === undefined });

      await logAudit({
        action: 'letters.upsert',
        entity: 'Letter',
        entityId: l.slug,
        after: { isPublic: row.isPublic, created: prev === undefined, publishFlip: flippingPublic },
      }).catch(() => {});
    }

    return NextResponse.json({ letters: results });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
