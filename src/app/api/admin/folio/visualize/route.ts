import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { tryGetAuthSecret } from '@/lib/auth-secret';
import { staticDb } from '@/lib/static-db';

// =============================================================
// VOL. 2 #14 — Folio corpus visualizer data
// -------------------------------------------------------------
// GET /api/admin/folio/visualize
//   Returns the 327-chunk corpus grouped by slug (folio) and section,
//   with chunk counts per group. The UI renders a treemap-style grid.
//   No embeddings required — pure metadata aggregation.
// =============================================================

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN', 'EDITOR', 'REVIEWER'];

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Pull all chunks with their slug + section + caution
    const chunks = await staticDb.folioChunk.findMany({
      select: {
        id: true,
        slug: true,
        section: true,
        caution: true,
        archetype: true,
      },
      orderBy: { slug: 'asc' },
    });

    // Group by slug (folio)
    const bySlug = new Map<string, { slug: string; chunkCount: number; sections: Set<string>; cautions: Set<string>; archetype: string | null }>();
    for (const c of chunks) {
      const existing = bySlug.get(c.slug) ?? {
        slug: c.slug,
        chunkCount: 0,
        sections: new Set<string>(),
        cautions: new Set<string>(),
        archetype: c.archetype,
      };
      existing.chunkCount++;
      existing.sections.add(c.section);
      existing.cautions.add(c.caution);
      if (existing.archetype === null && c.archetype) {
        existing.archetype = c.archetype;
      }
      bySlug.set(c.slug, existing);
    }

    // Group by caution (treemap top-level)
    const byCaution = new Map<string, number>();
    for (const c of chunks) {
      byCaution.set(c.caution, (byCaution.get(c.caution) ?? 0) + 1);
    }

    // Group by section
    const bySection = new Map<string, number>();
    for (const c of chunks) {
      bySection.set(c.section, (bySection.get(c.section) ?? 0) + 1);
    }

    // Group by archetype (if any)
    const byArchetype = new Map<string, number>();
    for (const c of chunks) {
      if (c.archetype) {
        byArchetype.set(c.archetype, (byArchetype.get(c.archetype) ?? 0) + 1);
      }
    }

    return NextResponse.json({
      total: chunks.length,
      slugs: Array.from(bySlug.values()).map(s => ({
        slug: s.slug,
        chunkCount: s.chunkCount,
        sections: Array.from(s.sections).sort(),
        cautions: Array.from(s.cautions).sort(),
        maxCaution: s.cautions.has('SEALED') ? 'SEALED' :
                    s.cautions.has('HIGH') ? 'HIGH' :
                    s.cautions.has('MODERATE') ? 'MODERATE' : 'OPEN',
        archetype: s.archetype,
      })),
      byCaution: Array.from(byCaution.entries()).sort((a, b) => b[1] - a[1]),
      bySection: Array.from(bySection.entries()).sort((a, b) => b[1] - a[1]),
      byArchetype: Array.from(byArchetype.entries()).sort((a, b) => b[1] - a[1]),
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Unknown error',
    }, { status: 500 });
  }
}
