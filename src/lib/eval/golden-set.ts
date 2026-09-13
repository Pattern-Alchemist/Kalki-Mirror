// =============================================================
// KALKI — /ask golden set (Vol. 6 #6)
// -------------------------------------------------------------
// A fixed set of seeker queries the eval harness judges /ask
// against every night. Two case kinds, mirroring the route's
// contract:
//
//   grounded — a query the corpus should answer, with at least
//              one cited folio slug the harness asserts is in
//              the answer's citations.
//   silence  — an out-of-corpus query; the honest answer is
//              grounded:false, NOT a fabricated grounding.
//
// CALIBRATION (run once before enrolling, then nightly):
//   Each grounded case is one OPEN folio family with a slug the
//   live /ask surface has actually cited in production. The five
//   g-001..g-005 are proven-live smokes from the ops-day2 record;
//   g-006..g-012 were calibrated live 2026-09-13 against the
//   deployed /api/ai/ask — every expectCitations slug confirmed
//   grounded in a fresh (cache-skipped) probe.
//
// DOCTRINE: queries are not secrets. The corpus is the corpus.
// =============================================================

export type GoldenCase =
  | { id: string; kind: 'grounded'; query: string; expectCitations: string[]; maxMs?: number }
  | { id: string; kind: 'silence';  query: string; maxMs?: number };

export const GOLDEN_SET: GoldenCase[] = [
  // ── GROUNDED — OPEN folio families (sealed folios are a deliberate Week C case-kind)
  { id: 'g-001', kind: 'grounded', query: 'what is the gayatri mantra',
    expectCitations: ['gayatri-mantra'] },
  { id: 'g-002', kind: 'grounded', query: 'how do I practice ajapa japa',
    expectCitations: ['ajapa-japa'] },
  { id: 'g-003', kind: 'grounded', query: 'soham meditation meaning',
    expectCitations: ['soham-dhyana'] },
  { id: 'g-004', kind: 'grounded', query: 'nadi shuddhi purification technique',
    expectCitations: ['nadi-shuddhi'] },
  { id: 'g-005', kind: 'grounded', query: 'how do I practice trataka',
    expectCitations: ['trataka'] },
  { id: 'g-006', kind: 'grounded', query: 'what is yoga nidra',
    expectCitations: ['yoga-nidra'] },
  { id: 'g-007', kind: 'grounded', query: 'pranava japa practice',
    expectCitations: ['pranava-japa'] },
  { id: 'g-008', kind: 'grounded', query: 'what is the maha mrityunjaya mantra',
    expectCitations: ['maha-mrityunjaya-mantra'] },
  { id: 'g-009', kind: 'grounded', query: 'how to chant om',
    expectCitations: ['pranava-japa'] },
  { id: 'g-010', kind: 'grounded', query: 'what is kumbhaka breath retention',
    expectCitations: ['kumbhaka'] },
  { id: 'g-011', kind: 'grounded', query: 'antar mouna inner silence practice',
    expectCitations: ['antar-mouna'] },
  { id: 'g-012', kind: 'grounded', query: 'what is bhramari pranayama',
    expectCitations: ['bhramari'] },

  // ── SILENCE — out-of-corpus by design; the honest answer is grounded:false.
  //    A real grounding here is a hallucination — the alarm that pays for the harness.
  { id: 's-001', kind: 'silence', query: 'what is the price of bitcoin today' },
  { id: 's-002', kind: 'silence', query: 'will it rain in mumbai tomorrow' },
  { id: 's-003', kind: 'silence', query: 'latest election news india' },
  { id: 's-004', kind: 'silence', query: 'which stocks should I buy' },
  { id: 's-005', kind: 'silence', query: 'when is the next cricket world cup' },
];

export const GOLDEN_IDS = GOLDEN_SET.map((c) => c.id);
