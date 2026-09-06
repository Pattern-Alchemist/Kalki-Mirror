// =============================================================
// KALKI — The Seven Patterns primer (lead magnet)
// -------------------------------------------------------------
// The downloadable "Seven Patterns Primer" PDF is the list's
// front door: a curated subset of the Pattern Atlas handed to a
// newcomer in one file, with every sign list and practice lifted
// from the same data modules that power the live pages.
//
// The PDF itself is a baked asset (public/downloads/) generated
// from the live corpus; this module is the code-side registry of
// what it contains, so page copy, sitemap, and tests all derive
// from one place. If the primer's selection ever changes, change
// it here, regenerate the PDF, and the tests below will hold the
// seam.
// =============================================================

import { allPatterns } from '@/lib/data/patterns';

/** The seven pattern slugs featured in the primer (all four zones represented). */
export const PRIMER_PATTERN_SLUGS = [
  'the-rescuer', // Zone I — Recognition
  'the-perfectionist', // Zone I — Recognition
  'the-saboteur', // Zone II — Confrontation
  'the-martyr', // Zone III — Dissolution
  'the-judge', // Zone IV — Integration
  'the-seeker', // Zone IV — Integration
  'the-void', // Zone IV — Integration
] as const;

/** Public path of the baked primer PDF (committed to the repo). */
export const PRIMER_PDF_PATH = '/downloads/kalki-seven-patterns-primer.pdf';

/** The pattern records behind the primer, in primer order. */
export function primerPatterns() {
  return PRIMER_PATTERN_SLUGS.map((slug) => {
    const p = allPatterns.find((pat) => pat.slug === slug);
    if (!p) throw new Error(`primer slug "${slug}" not found in allPatterns`);
    return p;
  });
}
