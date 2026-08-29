/**
 * Canonical anchor derivation for Lexicon terms.
 *
 * Shared between the Glossary page (which emits `id` anchors on term cards)
 * and the TermText auto-linker (which links occurrences of terms inside
 * folio and pattern prose). Both MUST derive the same anchor for a given
 * term, so the logic lives in exactly one place.
 *
 * Rules: NFD normalize → strip combining marks (diacritics) → lowercase →
 * replace any non-alphanumeric run with a single hyphen → trim edge hyphens.
 */
export function termAnchor(term: string): string {
  return term
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
