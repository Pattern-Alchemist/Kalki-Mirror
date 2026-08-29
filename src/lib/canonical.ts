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
