export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { callLLM, isLLMConfigured, YANTRA_PERSONA } from '@/lib/ai/llm';
import { getClientIp } from '@/lib/api-auth';
import { archetypeQuizSchema } from '@/lib/validators/schemas';

// ── Rate limiter: 5 req/min per IP ──
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entries = rateLimitMap.get(ip) || [];
  const recent = entries.filter(t => now - t < RATE_LIMIT_WINDOW);
  rateLimitMap.set(ip, recent);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

// ── Rule-based fallback when LLM is not configured ──
// Maps each answer value to weighted archetype scores
const ANSWER_ARCHETYPE_WEIGHTS: Record<string, Record<string, number>> = {
  // Q1: Crisis instinct
  'cut-through':        { kali: 3, chinnamasta: 2, bagalamukhi: 1 },
  'nourish-protect':    { tara: 3, bhuvaneshvari: 2, kamala: 1 },
  'withdraw-observe':   { dhumavati: 3, matangi: 2, bhairavi: 1 },
  'transform-creative': { shodashi: 3, bagalamukhi: 2, matangi: 1 },
  // Q2: Relationships
  'attract-saving':     { tara: 3, bhairavi: 2, chinnamasta: 1 },
  'emotional-merging':  { shodashi: 2, kamala: 2, bhuvaneshvari: 1 },
  'independence':       { bagalamukhi: 3, matangi: 2, kali: 1 },
  'caretaker':          { chinnamasta: 3, bhuvaneshvari: 2, tara: 1 },
  // Q3: Greatest fear
  'powerless':          { kali: 3, bagalamukhi: 2, bhairavi: 1 },
  'abandoned':          { tara: 3, bhuvaneshvari: 2, kamala: 1 },
  'controlled':         { matangi: 3, bagalamukhi: 2, chinnamasta: 1 },
  'unknown':            { dhumavati: 3, bhairavi: 2, matangi: 1 },
  // Q4: Stillness mind
  'analytical':         { bhuvaneshvari: 3, bagalamukhi: 2, kali: 1 },
  'emotional-memories': { tara: 2, bhuvaneshvari: 2, shodashi: 1 },
  'still-easily':       { kamala: 2, dhumavati: 2, bhuvaneshvari: 1 },
  'creative-visions':   { shodashi: 3, matangi: 2, chinnamasta: 1 },
  // Q5: Pattern to break
  'self-sabotage':      { kali: 3, bhairavi: 2, chinnamasta: 1 },
  'unavailable-people': { tara: 3, chinnamasta: 2, kamala: 1 },
  'controlling':        { bhuvaneshvari: 3, bagalamukhi: 2, matangi: 1 },
  'self-abandonment':   { chinnamasta: 3, kamala: 2, tara: 1 },
};

const ARCHETYPE_META: Record<string, { name: string; sanskrit: string; bija: string; pattern: string }> = {
  kali:          { name: 'Kālī', sanskrit: 'Kālī', bija: 'krīṁ', pattern: 'The loop of ego-attachment that must be severed' },
  tara:          { name: 'Tārā', sanskrit: 'Tārā', bija: 'oṃ tāre tuttāre ture svāhā', pattern: 'The loop of drowning / needing to be ferried across' },
  chinnamasta:   { name: 'Chinnamastā', sanskrit: 'Chinnamastā', bija: 'hrīṁ', pattern: 'The loop of self-sacrifice / feeding others from your own life-force' },
  bhuvaneshvari: { name: 'Bhuvaneśvarī', sanskrit: 'Bhuvaneśvarī', bija: 'hrīṁ śrīṁ', pattern: 'The loop of control / cosmic-sovereignty wound' },
  shodashi:      { name: 'Ṣoḍaśī / Tripurasundarī', sanskrit: 'Ṣoḍaśī', bija: 'śrīṁ hrīṁ', pattern: 'The loop of beauty-as-avoidance' },
  bhairavi:      { name: 'Bhairavī', sanskrit: 'Bhairavī', bija: 'hsauḥ', pattern: 'The loop of refusing the teacher' },
  dhumavati:     { name: 'Dhūmāvatī', sanskrit: 'Dhūmāvatī', bija: 'dhūṁ dhūṁ dhūmāvatyai svāhā', pattern: 'The loop of inauspiciousness / widowhood-of-the-soul' },
  bagalamukhi:   { name: 'Bagalāmukhī', sanskrit: 'Bagalāmukhī', bija: 'hlīṁ', pattern: 'The loop of being silenced / needing to freeze a hostile force' },
  matangi:       { name: 'Mātaṅgī', sanskrit: 'Mātaṅgī', bija: 'aiṁ hrīṁ śrīṁ aiṁ', pattern: 'The loop of transgressive voice / the outcaste within' },
  kamala:        { name: 'Kamalā', sanskrit: 'Kamalā', bija: 'śrīṁ hrīṁ klīṁ aiṁ sauḥ', pattern: 'The loop of prosperity-without-integration' },
};

/**
 * Deterministic fallback: score each answer against archetype weights,
 * return the highest-scoring archetype.
 */
function fallbackAnalysis(answers: string[]): {
  archetypeId: string;
  archetypeName: string;
  sanskrit: string;
  description: string;
  bija: string;
  pattern: string;
  confidence: number;
  secondaryArchetype: string | null;
} {
  const scores: Record<string, number> = {};
  for (const a of answers) {
    const weights = ANSWER_ARCHETYPE_WEIGHTS[a];
    if (!weights) continue;
    for (const [arch, w] of Object.entries(weights)) {
      scores[arch] = (scores[arch] || 0) + w;
    }
  }

  // Sort by score descending
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const primary = sorted[0]?.[0] || 'kali';
  const secondary = sorted[1]?.[0] || null;
  const totalPossible = answers.length * 3;
  const confidence = Math.min(95, Math.max(55, Math.round((scores[primary] || 0) / totalPossible * 100 + 15)));
  const meta = ARCHETYPE_META[primary] || ARCHETYPE_META.kali;

  const descriptions: Record<string, string> = {
    kali: 'Your patterns reveal a deep attachment to identity and form. You grip what is already dissolving — relationships, roles, self-images. Kālī demands the severance of this grip, not through destruction, but through the recognition that what you hold is already gone. Your crisis instinct to cut through directly mirrors Kālī\'s own nature.',
    tara: 'Your patterns reveal a tendency toward learned helplessness dressed as surrender — the perpetual need for rescue, the attraction to those who need saving. Tārā\'s loop manifests as forgetting the inner ferryman who can carry you across. Your relational pattern of attracting those who need saving is the ocean of existence calling you to find your own capacity to cross.',
    chinnamasta: 'Your patterns reveal a structural confusion between nourishing and being consumed. You give until there is nothing left, and martyrdom has become your currency. Chinnamastā\'s iconography — feeding her own attendants from arterial spray — is the most direct statement in tantra: the energy you give away must be regenerated, or the source dies.',
    bhuvaneshvari: 'Your patterns reveal the architect\'s trap — beautiful maps of territories never walked, elaborate systems that substitute for direct experience. You seek to control reality through mental architecture, overthinking and over-planning as a defense against the terror of not knowing. True sovereignty is not control but the capacity to hold all possibilities without grasping any single one.',
    shodashi: 'Your patterns reveal the loop where beauty, harmony, and aesthetic perfection become defensive structures against the messiness of real feeling. You curate a life of surfaces while the raw, unpolished truth of suffering remains unexamined. The Śrī Yantra encodes the entire cosmos in nine interlocking triangles: beauty is not the opposite of depth but its most refined expression.',
    bhairavi: 'Your patterns reveal a structural rejection of lineage, authority, and the humility that authentic learning requires. You collect knowledge but never submit to the transformation that knowledge demands. Bhairavī\'s fury is not directed at you — it is the intensity of the teaching itself, the fire that burns away the illusion of self-sufficiency.',
    dhumavati: 'Your patterns reveal an identification with loss — spiritual dryness, creative block, the sense that the inner life has died. You have made a home in the ashes of what was. The widowhood of the soul is not a defect but a stage. You must learn to dwell in the smoke without being consumed by it.',
    bagalamukhi: 'Your patterns reveal the tension between a voice that has been suppressed and the force required to release it. You carry frozen rage that manifests as either compulsive silence or the desire to silence others. Bagalāmukhī\'s power is stambhana — the ability to still the hostile inner critic, to freeze the narrative of unworthiness before it takes form.',
    matangi: 'Your patterns reveal the split between the acceptable self and the transgressive self, between what is spoken and what is suppressed. Your authentic voice has been exiled — deemed too strange, too raw. Mātaṅgī declares that the sacred is found at the margins, that the voice you have been told to silence may be the one that carries the most truth.',
    kamala: 'Your patterns reveal the spiritual materialist\'s trap — more retreats, more initiations, more techniques, more purity — yet the same patterns repeat beneath the accumulating surface. You collect practices and experiences without allowing any of them to transform the underlying structure. The lotus grows from mud: true prosperity is not the absence of the base but its transmutation.',
  };

  return {
    archetypeId: primary,
    archetypeName: meta.name,
    sanskrit: meta.sanskrit,
    description: descriptions[primary] || descriptions.kali,
    bija: meta.bija,
    pattern: meta.pattern,
    confidence,
    secondaryArchetype: secondary,
  };
}

// Canonical archetype IDs (must match archetypes.ts)
const VALID_ARCHETYPE_IDS = [
  'bagalamukhi', 'chinnamasta', 'dhumavati', 'kali',
  'tara', 'shodashi', 'bhuvaneshvari', 'bhairavi',
  'matangi', 'kamala',
] as const;

/**
 * Normalize LLM-returned archetype IDs to canonical forms.
 * LLMs may return variant spellings.
 */
function normalizeArchetypeId(raw: string): string {
  const map: Record<string, string> = {
    'chhinnamasta': 'chinnamasta',
    'tripurasundari': 'shodashi',
    'dhoomavati': 'dhumavati',
    'tripura-sundari': 'shodashi',
    'tripura_bhairavi': 'bhairavi',
    'bhuvaneshwari': 'bhuvaneshvari',
  };
  const lower = raw.toLowerCase().trim();
  if (VALID_ARCHETYPE_IDS.includes(lower as typeof VALID_ARCHETYPE_IDS[number])) return lower;
  return map[lower] || lower;
}

/**
 * POST /api/ai/archetype-quiz
 *
 * Personality quiz — analyzes answers to spiritual/personality questions
 * and determines the dominant Mahavidya archetype from the 10 Mahavidyas.
 * Falls back to rule-based scoring when LLM is not configured.
 *
 * Rate limited: 5 req/min per IP.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. The geometry needs time to stabilize.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = archetypeQuizSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { answers } = parsed.data;

    // ── LLM Path (when configured) ──
    if (isLLMConfigured()) {
      // Use canonical IDs in prompt to reduce LLM errors
      const archetypeList = VALID_ARCHETYPE_IDS.join(', ');

      const systemPrompt = `${YANTRA_PERSONA}

Based on these answers to a spiritual/personality assessment, determine which of the 10 Mahavidya archetypes best matches this person. Consider their patterns, fears, strengths, and inclinations.

The 10 Mahavidyas are: ${archetypeList}.

IMPORTANT: Use EXACTLY these IDs: ${archetypeList}. Do NOT use variant spellings.

Return JSON: { "archetypeId": "<lowercase id from the list above>", "archetypeName": "<English name>", "sanskrit": "<Sanskrit name in IAST>", "description": "<2-3 sentence description of how this archetype resonates with their patterns>", "bija": "<seed syllable associated with this archetype>", "pattern": "<the core behavioral/life pattern this archetype governs>", "confidence": <number 0-100>, "secondaryArchetype": "<id of secondary archetype or null>" }`;

      const userPrompt = `Answers to spiritual/personality assessment (${answers.length} questions):

${answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Analyze these answers and determine the dominant Mahavidya archetype. Respond ONLY with valid JSON matching the schema above. Do not include any text outside the JSON object.`;

      try {
        const result = await callLLM(
          [{ role: 'user', content: userPrompt }],
          {
            systemPrompt,
            jsonMode: true,
            temperature: 0.5,
            maxTokens: 1024,
          }
        );

        let parsedResponse: {
          archetypeId: string;
          archetypeName: string;
          sanskrit: string;
          description: string;
          bija: string;
          pattern: string;
          confidence: number;
          secondaryArchetype: string | null;
        };

        try {
          parsedResponse = JSON.parse(result.text);
        } catch {
          return NextResponse.json(
            { error: 'AI response could not be parsed. The geometry returned garbled data.' },
            { status: 502 }
          );
        }

        // Normalize archetype IDs to canonical forms
        const archetypeId = normalizeArchetypeId(parsedResponse.archetypeId || 'kali');
        let secondaryArchetype: string | null = null;
        if (parsedResponse.secondaryArchetype) {
          secondaryArchetype = normalizeArchetypeId(parsedResponse.secondaryArchetype);
          // Only keep if it's a valid canonical ID
          if (!VALID_ARCHETYPE_IDS.includes(secondaryArchetype as typeof VALID_ARCHETYPE_IDS[number])) {
            secondaryArchetype = null;
          }
        }

        return NextResponse.json({
          archetypeId,
          archetypeName: parsedResponse.archetypeName || 'Unknown',
          sanskrit: parsedResponse.sanskrit || '',
          description: parsedResponse.description || '',
          bija: parsedResponse.bija || '',
          pattern: parsedResponse.pattern || '',
          confidence: typeof parsedResponse.confidence === 'number' ? parsedResponse.confidence : 0,
          secondaryArchetype,
        });
      } catch (llmError) {
        // LLM failed — fall back to rule-based analysis
        console.warn('[/api/ai/archetype-quiz] LLM failed, using fallback:', llmError);
        return NextResponse.json(fallbackAnalysis(answers));
      }
    }

    // ── Fallback Path (when LLM not configured) ──
    return NextResponse.json(fallbackAnalysis(answers));

  } catch (error) {
    console.error('[/api/ai/archetype-quiz]', error);
    return NextResponse.json(
      { error: 'Archetype analysis failed. The pattern-matrix requires recalibration.' },
      { status: 500 }
    );
  }
}
