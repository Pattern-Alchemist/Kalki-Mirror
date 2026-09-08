// =============================================================
// KALKI — Folio JSON ingest (Vol. 5 #7)
// -------------------------------------------------------------
// The bake ritual's missing WRITE path. A new folio arrives as a
// JSON file (content/folios/*.json); this module owns the pure
// contract: validation against the FolioChunk shape, and the
// ingest plan against what the baked corpus already holds.
// scripts/ingest-folio-json.ts is the thin CLI that executes a plan;
// scripts/bake-corpus.sh orchestrates validate → ingest → bake →
// fingerprint → CORPUS_SIZE → vitest gates → done banner.
//
// PURE by design: every rule below is unit-tested; the CLI and
// the shell add I/O and nothing else.
// =============================================================

/** FolioChunk.section enum — see prisma/schema.prisma. */
export const FOLIO_SECTIONS = [
  'summary',
  'benefits',
  'warnings',
  'mantra',
  'lineage',
  'bibliography',
] as const;
export type FolioSection = (typeof FOLIO_SECTIONS)[number];

/** FolioChunk.caution enum — the corpus tiering (OPEN/CLOSED doctrine). */
export const CAUTION_LEVELS = ['OPEN', 'MODERATE', 'HIGH', 'SEALED'] as const;
export type CautionLevel = (typeof CAUTION_LEVELS)[number];

export interface FolioSectionJson {
  section: FolioSection;
  text: string;
}

export interface FolioJson {
  slug: string;
  archetype?: string;
  caution: CautionLevel;
  sections: FolioSectionJson[];
}

export type ValidatedFolio = { ok: true; folio: FolioJson } | { ok: false; errors: string[] };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** A chunk must carry real prose — the retriever chunks on these rows. */
export const MIN_CHUNK_CHARS = 40;
export const MAX_CHUNK_CHARS = 4000;

export function validateFolioJson(raw: unknown): ValidatedFolio {
  const errors: string[] = [];
  if (typeof raw !== 'object' || raw === null) {
    return { ok: false, errors: ['folio must be a JSON object'] };
  }
  const f = raw as Record<string, unknown>;

  if (typeof f.slug !== 'string' || !SLUG_RE.test(f.slug) || f.slug.length > 80) {
    errors.push(`slug: expected lowercase-kebab ≤80 chars, got ${JSON.stringify(f.slug)}`);
  }
  if (f.archetype !== undefined && (typeof f.archetype !== 'string' || f.archetype.length > 80)) {
    errors.push('archetype: optional string ≤80 chars');
  }
  if (typeof f.caution !== 'string' || !(CAUTION_LEVELS as readonly string[]).includes(f.caution)) {
    errors.push(`caution: one of ${CAUTION_LEVELS.join(' | ')}, got ${JSON.stringify(f.caution)}`);
  }
  if (!Array.isArray(f.sections) || f.sections.length === 0) {
    errors.push('sections: non-empty array required (a folio without prose is a ghost)');
  } else {
    const seen = new Set<string>();
    f.sections.forEach((s, i) => {
      const label = `sections[${i}]`;
      if (typeof s !== 'object' || s === null) {
        errors.push(`${label}: object { section, text } required`);
        return;
      }
      const sec = (s as Record<string, unknown>).section;
      const text = (s as Record<string, unknown>).text;
      if (typeof sec !== 'string' || !(FOLIO_SECTIONS as readonly string[]).includes(sec)) {
        errors.push(`${label}.section: one of ${FOLIO_SECTIONS.join(' | ')}, got ${JSON.stringify(sec)}`);
      } else if (seen.has(sec)) {
        errors.push(`${label}.section: "${sec}" appears twice — one row per section`);
      } else {
        seen.add(sec);
      }
      if (typeof text !== 'string' || text.trim().length < MIN_CHUNK_CHARS) {
        errors.push(`${label}.text: at least ${MIN_CHUNK_CHARS} chars of prose required`);
      } else if (text.length > MAX_CHUNK_CHARS) {
        errors.push(`${label}.text: over ${MAX_CHUNK_CHARS} chars — split the section`);
      }
    });
  }

  if (errors.length > 0) return { ok: false, errors };
  return {
    ok: true,
    folio: {
      slug: f.slug as string,
      archetype: f.archetype as string | undefined,
      caution: f.caution as CautionLevel,
      sections: f.sections as FolioSectionJson[],
    },
  };
}

/** One planned FolioChunk row. */
export interface PlannedChunk {
  slug: string;
  archetype: string | null;
  section: FolioSection;
  caution: CautionLevel;
  text: string;
}

export interface IngestPlan {
  inserts: PlannedChunk[];
  /** Folio slugs already baked and left untouched (skip mode). */
  skipped: string[];
  /** Folio slugs being re-baked (replace mode): old rows are deleted first. */
  replaced: string[];
  /** (slug, section) pairs the plan will write — the dry-run printout. */
  writes: { slug: string; section: string }[];
}

export type IngestMode = 'skip' | 'replace';

/**
 * Plan the ingest of validated folios against the existing corpus.
 * Idempotent by default: a slug already present is SKIPPED whole —
 * a re-run never duplicates. `replace` re-bakes a slug explicitly.
 */
export function planIngest(
  existingChunks: { slug: string; section: string }[],
  folios: FolioJson[],
  mode: IngestMode = 'skip',
): IngestPlan {
  const existingBySlug = new Map<string, Set<string>>();
  for (const c of existingChunks) {
    if (!existingBySlug.has(c.slug)) existingBySlug.set(c.slug, new Set());
    existingBySlug.get(c.slug)!.add(c.section);
  }

  const plan: IngestPlan = { inserts: [], skipped: [], replaced: [], writes: [] };
  for (const folio of folios) {
    const existing = existingBySlug.get(folio.slug);
    if (existing && existing.size > 0) {
      if (mode === 'skip') {
        plan.skipped.push(folio.slug);
        continue;
      }
      plan.replaced.push(folio.slug);
    }
    for (const s of folio.sections) {
      plan.inserts.push({
        slug: folio.slug,
        archetype: folio.archetype ?? null,
        section: s.section,
        caution: folio.caution,
        text: s.text,
      });
      plan.writes.push({ slug: folio.slug, section: s.section });
    }
  }
  return plan;
}
