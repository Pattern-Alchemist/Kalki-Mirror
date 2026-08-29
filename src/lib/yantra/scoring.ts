/**
 * YANTRA — Deterministic Scoring Core (TGA §5, v1)
 *
 * The YANTRA engine has two layers: this deterministic core (auditable,
 * testable, zero-LLM) and a future narrative layer (LLM prose-only, fed the
 * same scores). The core prescribes practice folios for a set of observed
 * patterns with every score decomposable into named components.
 *
 * Design rules (from the TGA sub-spec):
 *   - Every score is a sum of named, documented components — no magic.
 *   - Tier and caution gates are hard filters applied AFTER scoring, so the
 *     ranking remains explainable when a gated folio is excluded.
 *   - Confidence bands come from the score distribution, not vibes.
 *   - Pure functions only: same input, same output, forever.
 */

import { allSiddhis, getSiddhiBySlug } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import { PATTERN_ARCHETYPE_MAP } from '@/lib/data/archetypes';
import type { Tier, CautionLevel } from '@/lib/data/types';

// ─── Input / output contracts ───────────────────────────────────────────────

export interface YantraInput {
  /** Observed pattern slugs (1–3 recommended; more dilutes precision). */
  patternIds: string[];
  /** Seeker tier — gates folio eligibility. Default: prithvi. */
  tier?: Tier;
  /** How much caution the seeker accepts. Default: low. */
  cautionTolerance?: 'low' | 'medium' | 'high';
}

export interface ScoreComponent {
  name: string;
  points: number;
  note: string;
}

export interface Prescription {
  folioSlug: string;
  folioName: string;
  sanskrit: string;
  totalScore: number;
  components: ScoreComponent[];
  confidenceBand: 'HIGH' | 'MEDIUM' | 'LOW';
  gatedBy?: 'tier' | 'caution';
  matchedPatterns: string[];
}

export interface YantraOutput {
  input: { patternIds: string[]; tier: Tier; cautionTolerance: string };
  dominantArchetypeId: string | null;
  prescriptions: Prescription[];
  generatedAt: string;
  engine: 'yantra-deterministic-v1';
}

// ─── Weights (documented, tunable — changes require a version bump) ─────────

export const WEIGHTS = {
  PATTERN_PRESCRIBED: 30, // folio explicitly prescribed by the pattern
  ARCHETYPE_ALIGNED: 18, // folio's governing force matches pattern's force
  EVIDENCE_QUALITY: 20, // authenticity score 0–100 → up to 20 pts
  CATEGORY_DIVERSITY: 8, // reward covering multiple practice categories
  CAUTION_PENALTY: -12, // high-caution folio under medium/low tolerance
  DURATION_FIT: 6, // shorter introductory practices get a small edge
} as const;

const TIER_ORDER: Tier[] = ['prithvi', 'jal', 'agni', 'akash'];
const CAUTION_ORDER: CautionLevel[] = ['OPEN', 'MODERATE', 'HIGH', 'SEALED'];
const CAUTION_TOLERANCE_MAX: Record<string, CautionLevel> = {
  low: 'MODERATE',
  medium: 'HIGH',
  high: 'SEALED',
};

function tierRank(t: Tier): number {
  return TIER_ORDER.indexOf(t);
}

function cautionRank(c?: CautionLevel): number {
  if (!c) return 0;
  return CAUTION_ORDER.indexOf(c);
}

// ─── Core ───────────────────────────────────────────────────────────────────

export function computePrescriptions(input: YantraInput): YantraOutput {
  const tier: Tier = input.tier ?? 'prithvi';
  const cautionTolerance = input.cautionTolerance ?? 'low';
  const patternIds = [...new Set(input.patternIds)].filter((id) =>
    allPatterns.some((p) => p.slug === id)
  );

  const dominantArchetypeId =
    patternIds.length > 0 ? PATTERN_ARCHETYPE_MAP[patternIds[0]] ?? null : null;

  const results: Prescription[] = [];

  for (const folio of allSiddhis) {
    const matchedPatterns = patternIds.filter((pid) => {
      const pattern = allPatterns.find((p) => p.slug === pid);
      return pattern?.relatedSiddhis.includes(folio.slug) ?? false;
    });

    const archetypeAligned = patternIds.some((pid) => {
      const force = PATTERN_ARCHETYPE_MAP[pid];
      return force != null && folio.archetypeId === force;
    });

    // Folios must connect to the query somehow to be scored at all.
    if (matchedPatterns.length === 0 && !archetypeAligned) continue;

    const components: ScoreComponent[] = [];

    if (matchedPatterns.length > 0) {
      components.push({
        name: 'pattern_prescribed',
        points: WEIGHTS.PATTERN_PRESCRIBED * matchedPatterns.length,
        note: `Prescribed by ${matchedPatterns.length} observed pattern(s): ${matchedPatterns.join(', ')}`,
      });
    }

    if (archetypeAligned) {
      components.push({
        name: 'archetype_aligned',
        points: WEIGHTS.ARCHETYPE_ALIGNED,
        note: `Folio's governing force matches a pattern's mapped Mahavidyā`,
      });
    }

    components.push({
      name: 'evidence_quality',
      points: Math.round((folio.authenticityScore / 100) * WEIGHTS.EVIDENCE_QUALITY),
      note: `Authenticity score ${folio.authenticityScore}/100`,
    });

    if (folio.cautionLevel === 'HIGH' || folio.cautionLevel === 'SEALED') {
      components.push({
        name: 'caution_penalty',
        points: WEIGHTS.CAUTION_PENALTY,
        note: `${folio.cautionLevel} caution folio under ${cautionTolerance} tolerance`,
      });
    }

    if (folio.durationHours <= 12) {
      components.push({
        name: 'duration_fit',
        points: WEIGHTS.DURATION_FIT,
        note: `Introductory commitment (${folio.durationHours}h) — accessible entry`,
      });
    }

    const totalScore = components.reduce((sum, c) => sum + c.points, 0);

    const gatedBy =
      tierRank(folio.minTier) > tierRank(tier)
        ? ('tier' as const)
        : cautionRank(folio.cautionLevel) > cautionRank(CAUTION_TOLERANCE_MAX[cautionTolerance])
          ? ('caution' as const)
          : undefined;

    results.push({
      folioSlug: folio.slug,
      folioName: folio.name,
      sanskrit: folio.sanskrit,
      totalScore,
      components,
      confidenceBand: totalScore >= 48 ? 'HIGH' : totalScore >= 30 ? 'MEDIUM' : 'LOW',
      gatedBy,
      matchedPatterns,
    });
  }

  // Sort by score, apply diversity bonus (documented, deterministic).
  results.sort((a, b) => b.totalScore - a.totalScore || a.folioSlug.localeCompare(b.folioSlug));
  const seenCategories = new Set<string>();
  for (const r of results) {
    const folio = getSiddhiBySlug(r.folioSlug);
    const category = folio?.category ?? 'unknown';
    if (!seenCategories.has(category)) {
      seenCategories.add(category);
      r.components.push({
        name: 'category_diversity',
        points: WEIGHTS.CATEGORY_DIVERSITY,
        note: `First prescription in the ${category} category`,
      });
      r.totalScore += WEIGHTS.CATEGORY_DIVERSITY;
      r.confidenceBand =
        r.totalScore >= 48 ? 'HIGH' : r.totalScore >= 30 ? 'MEDIUM' : 'LOW';
    }
  }
  results.sort((a, b) => b.totalScore - a.totalScore || a.folioSlug.localeCompare(b.folioSlug));

  return {
    input: { patternIds, tier, cautionTolerance },
    dominantArchetypeId,
    prescriptions: results.slice(0, 8),
    generatedAt: new Date().toISOString(),
    engine: 'yantra-deterministic-v1',
  };
}
