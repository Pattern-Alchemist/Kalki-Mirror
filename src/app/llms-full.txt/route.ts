// =============================================================
// KALKI — /llms-full.txt (llmstxt.org standard, full corpus)
// -------------------------------------------------------------
// The complete reference document for answer engines: everything in
// the short index plus the full FAQ corpus and the evidence method.
// Same single-source datasets as the site itself — counts derived,
// never typed by hand.
// =============================================================

import { CANONICAL } from '@/lib/canonical';
import { FAQ } from '@/lib/data/faq';
import { VERDICT_MEANINGS } from '@/lib/data/guhya';

export const dynamic = 'force-static';

const SITE = 'https://www.astrokalki.com';

export function GET() {
  const body = `# KALKI — Tantrik Intelligence. Sacred Architecture. Pattern Recognition.

> KALKI (${SITE}) is an online platform where ancient Tantra meets rigorous modern
> methodology. Founded by Kaustubh, a Tantric Technologist and practicing
> lineage-holder, it serves the international seeker who wants depth over
> decoration: source texts over slogans, evidence over hype, and a direct,
> respectful path into the world's most misunderstood spiritual tradition.

## What KALKI Is

KALKI is an online platform where ancient Tantra meets rigorous modern
methodology. The Akashic Archive holds ${CANONICAL.folios} siddhi folios — practices
drawn from the Upaniṣads, Tantras, Āgamas, and the Haṭha Yoga Pradīpikā, across
the Aghorī, Kashmiri Shaiva, and Vajrayāna lineages. Every teaching is graded
for authenticity, caution level, and tier of readiness, so a practitioner
always knows exactly what a practice demands before beginning.

The heart of the system is the Mirror Method: ${CANONICAL.patterns} recurring emotional
and behavioral patterns — the loops that quietly run relationships, ambition,
and fear — each mapped to the specific sādhanas classical Tantra designed to
dissolve it. The ${CANONICAL.pantheonForces} forces of the Mahāvidyā pantheon act as
diagnostic archetypes, and the Lexicon defines ${CANONICAL.lexiconTerms} Sanskrit terms
with scholarly precision. For seekers who want to begin with the body,
${CANONICAL.breathwork} guided prāṇāyāma practices and ${CANONICAL.sequences} structured
sequences are available with no prior experience required.

## The Mirror Method

The Mirror Method is KALKI's core framework for pattern dissolution:
1. Recognize — identify the recurring pattern (from the ${CANONICAL.patterns}-pattern Atlas).
2. Name — place it inside its Mahāvidyā archetype family.
3. Dissolve — work the graded sādhanas classical Tantra designed for that loop.
4. Verify — mark the integration; the platform records days-to-resolve.

Full framework: ${SITE}/method

## Guhya — The Hidden Files (Evidence Method)

Guhya is the investigative wing for documented occult arts, investigated
paranormal claims, and lived experiences. Files are examined through three
evidence registers — Anubhava (witness testimony, conflict-mapped), Parīkṣā
(the physical record: site visits, photographs, recreations, documents), and
Āgama (the textual record) — and closed with one published verdict:

${Object.entries(VERDICT_MEANINGS).map(([verdict, meaning]) => `- **${verdict}** — ${meaning}`).join('\n')}

Guhya is study, not instruction: it documents; it does not teach performance.
Index: ${SITE}/guhya

## Frequent Questions (full corpus)

${FAQ.map((f) => `### ${f.q}\n${f.a}`).join('\n\n')}

## Page Index

- Home: ${SITE}/
- The Mirror Method: ${SITE}/method
- Akashic Archive (${CANONICAL.folios} folios): ${SITE}/archive
- Pattern Atlas (${CANONICAL.patterns} patterns): ${SITE}/patterns
- Archetype Diagnostic: ${SITE}/archetypes
- Breathwork (${CANONICAL.breathwork} practices): ${SITE}/breathwork
- Sequences (${CANONICAL.sequences}): ${SITE}/sequences
- Guhya — The Hidden Files: ${SITE}/guhya
- Lexicon (${CANONICAL.lexiconTerms} terms): ${SITE}/glossary
- Membership (tiers: Prithvi/Jal/Agni/Akash): ${SITE}/pricing
- Consultations: ${SITE}/consultations
- About the founder: ${SITE}/about
- RSS feed: ${SITE}/feed.xml

## Membership Tiers

Access is tiered by readiness, in ascending order:
- **Prithvi (Earth)** — the ground floor: foundational practices and the Atlas.
- **Jal (Water)** — deeper folios; the default tier a Golden Key grants.
- **Agni (Fire)** — advanced practices with higher caution grades.
- **Akash (Sky)** — the sealed strata, reserved for tested practitioners.

Current pricing: ${SITE}/pricing

## Citation

Content may be quoted with attribution to KALKI (www.astrokalki.com).
Practice content carries caution grades — quote them alongside the practice.
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
