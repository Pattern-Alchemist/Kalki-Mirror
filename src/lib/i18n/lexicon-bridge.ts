// =============================================================
// KALKI — LEXICON hi BRIDGE (Vol. 4 #13)
// -------------------------------------------------------------
// The glossary/pattern/lesson corpora were EN-only: a hi seeker hit
// a language wall the moment they left the chrome. This bridge is
// the first move — optional hi fields on GlossaryEntry (top-20
// terms, sadhu register) with a PURE picker the renderer calls:
//
//   locale 'hi' + entry.hi?.definition → the Hindi definition
//   anything else                      → the EN definition
//
// EN fallback is the invariant: the corpus never regresses for the
// en seeker, and a missing translation degrades to EN silently —
// never to an empty definition.
// Pure functions only (no React, no DB) — tested like every lib.
// =============================================================

export type SeekerLocale = 'en' | 'hi';

/** Minimal shape of a glossary entry under the bridge. */
export interface BridgeableEntry {
  definition: string;
  hi?: { definition: string };
}

export interface PickedDefinition {
  /** The definition text to render. */
  text: string;
  /** True when the hi translation is being served. */
  isHi: boolean;
  /** True when the entry carries a hi translation the seeker is NOT reading (locale=en). */
  hiAvailable: boolean;
}

/**
 * The one definition-picking rule for the whole site. locale comes
 * from next-intl (NEXT_LOCALE cookie, non-routing); the bridge never
 * guesses — 'en' is the default of last resort.
 */
export function pickDefinition(entry: BridgeableEntry, locale: string | undefined): PickedDefinition {
  const hi = entry.hi?.definition?.trim();
  const en = entry.definition;
  return {
    text: locale === 'hi' && hi ? hi : en,
    isHi: locale === 'hi' && !!hi,
    hiAvailable: !!hi,
  };
}

/**
 * Vol. 5 #8 — shape adapter for the pattern folios: Pattern carries
 * `description` (not `definition`), its hi block rides `hi.definition`
 * unchanged. The adapter normalizes the shape and delegates to the ONE
 * canonical picker — there is no second picking rule anywhere on the site.
 */
export function pickPatternDescription(
  pattern: { description: string; hi?: { definition: string } },
  locale: string | undefined,
): PickedDefinition {
  return pickDefinition({ definition: pattern.description, hi: pattern.hi }, locale);
}
