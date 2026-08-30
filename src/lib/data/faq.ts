// =============================================================
// KALKI — FAQ (single source of truth)
// -------------------------------------------------------------
// One FAQ dataset feeding THREE surfaces:
//   1. The visible FAQ section on the home page (server-rendered)
//   2. The FAQPage JSON-LD schema (same page)
//   3. /llms-full.txt (Generative Engine Optimization corpus)
// Counts are imported from CANONICAL — they can never drift.
// =============================================================

import { CANONICAL } from '@/lib/canonical';
import { TEN_MAHAVIDYAS } from '@/lib/data/archetypes';

export interface FaqItem {
  q: string;
  a: string;
}

const MAHAVIDYA_NAMES = TEN_MAHAVIDYAS.map((m) => m.name).join(', ');

export const FAQ: FaqItem[] = [
  {
    q: 'What is KALKI?',
    a: `KALKI (www.astrokalki.com) is an online platform where ancient Tantra meets rigorous modern methodology. The Akashic Archive holds ${CANONICAL.folios} siddhi folios — practices drawn from the Upaniṣads, Tantras, Āgamas, and the Haṭha Yoga Pradīpikā — each graded for authenticity, caution level, and tier of readiness. The Pattern Atlas maps ${CANONICAL.patterns} recurring emotional and behavioral patterns to the specific sādhanas classical Tantra designed to dissolve them. KALKI was founded by Kaustubh, a Tantric Technologist and practicing lineage-holder, for seekers who want source texts over slogans and evidence over hype.`,
  },
  {
    q: 'Is KALKI suitable for beginners in Tantra?',
    a: `Yes. Every practice in the Akashic Archive is graded for caution level and tier of readiness, so you always know exactly what a practice demands before you begin. The ${CANONICAL.breathwork} guided prāṇāyāma practices and ${CANONICAL.sequences} structured sequences require no prior experience. The recommended entry point is the Mirror Method: identify your dominant pattern first, then work with the practices designed to dissolve it.`,
  },
  {
    q: 'What is the Mirror Method?',
    a: `The Mirror Method is KALKI's core framework for pattern dissolution. It maps ${CANONICAL.patterns} recurring emotional and behavioral patterns — the loops that quietly run relationships, ambition, and fear — to the specific sādhanas classical Tantra designed to dissolve them. The ${CANONICAL.pantheonForces} forces of the Mahāvidyā pantheon act as diagnostic archetypes, and the Lexicon defines ${CANONICAL.lexiconTerms} Sanskrit terms with scholarly precision. The full framework is documented on the Mirror Method page.`,
  },
  {
    q: 'What are the ten Mahāvidyās?',
    a: `The Mahāvidyās are the ten great wisdom goddesses of the Tantric pantheon: ${MAHAVIDYA_NAMES}. KALKI treats them as diagnostic archetypes — ten doors into the pattern system, each with its own family of graded practices in the Akashic Archive and its own archetype profile in the diagnostic tool.`,
  },
  {
    q: 'What is Guhya?',
    a: `Guhya — The Hidden Files — is KALKI's investigative wing for documented occult arts, investigated paranormal claims, and lived experiences. Each file is examined through three evidence registers — Anubhava (witness testimony, conflict-mapped), Parīkṣā (the physical record), and Āgama (the textual record) — and closed with a published verdict: Attested, Contested, Reported, or Debunked. Guhya is study, not instruction: it documents; it does not teach performance.`,
  },
  {
    q: 'How much does KALKI membership cost?',
    a: `Membership is tiered by readiness — Prithvi (Earth), Jal (Water), Agni (Fire), and Akash (Sky) — with each tier unlocking deeper strata of the Archive and its practices. Current pricing is listed on the membership page. Access can also be granted through Golden Key invitations issued by existing members.`,
  },
];

export const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};
