// =============================================================
// KALKI — CANONICAL NUMBERS (single source of truth)
// -------------------------------------------------------------
// Engine II · Entity (Dossier No. 03, §3.2):
//   "The canonical counts become a single source of truth in
//    the codebase: one constants file, imported everywhere,
//    never typed by hand."
//
// Every count is DERIVED from the data modules at build time —
// it can never drift from reality again. Import CANONICAL
// instead of typing a number. Internal inconsistency is a
// defect in the product (V2.0 spec, iron principle).
// =============================================================

import { allSiddhis } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import { allBreathPatterns } from '@/lib/data/breath-patterns';
import { allSequences } from '@/lib/data/sequences';
import { glossaryEntries } from '@/lib/data/glossary';
import { TEN_MAHAVIDYAS, SUPPLEMENTARY_ARCHETYPES } from '@/lib/data/archetypes';

// -------------------------------------------------------------
// SITE_LASTMOD — the date of the last meaningful public-content
// change (Search Console sitemap quality). Served verbatim as the
// <lastmod> of every sitemap URL. Google ignores per-build
// timestamps (uniform "generated just now" dates train it to
// distrust the signal); a stable, human-bumped date keeps lastmod
// meaningful. Bump this constant whenever corpus or marketing
// pages materially change — nothing else.
// -------------------------------------------------------------
// NOTE: date-only strings parse as UTC midnight — keep this at or
// before the current UTC date, never "today" in IST terms before
// 05:30 IST, or lastmod lands in the future (protocol violation;
// the geo-monitor's sitemap_lastmod check FAILs on future dates).
export const SITE_LASTMOD = '2026-09-03'; // US acquisition layer: /usa hub + 5 commercial pages, WhatsApp attribution, consultations FAQ schema

export const CANONICAL = {
  /** Folios in the Akashic Archive (siddhi entries). */
  folios: allSiddhis.length,
  /** Emotional patterns in the Pattern Atlas. */
  patterns: allPatterns.length,
  /** Sanskrit terms in the Lexicon. */
  lexiconTerms: glossaryEntries.length,
  /** Breathwork practices. */
  breathwork: allBreathPatterns.length,
  /** Practice sequences. */
  sequences: allSequences.length,
  /** The Ten Mahāvidyās. */
  mahavidyas: TEN_MAHAVIDYAS.length,
  /** Pantheon forces: 10 Mahāvidyās + 6 supplementary archetypes. */
  pantheonForces: TEN_MAHAVIDYAS.length + SUPPLEMENTARY_ARCHETYPES.length,
  /** Register taxonomy grades (AGAMA / ANUBHAVA / PARIKSA / PRATIBIMBA). */
  registers: 4,
} as const;

export type Canonical = typeof CANONICAL;
