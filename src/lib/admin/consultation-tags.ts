// =============================================================
// VOL. 2 #11 — AI auto-tagging for consultations
// -------------------------------------------------------------
// Reads a consultation's `request` text + optional `name`/`email`
// and assigns 1-3 tags from a fixed taxonomy via the LLM chain.
//
// Taxonomy (fixed so the war-room rollups are meaningful):
//   · love       — relationships, marriage, partnership, breakups
//   · career     — work, business, money, professional direction
//   · health     — physical/mental health, illness, vitality
//   · finance    — debt, investments, property (distinct from career)
//   · spiritual  — sadhana, awakening, lineage, deity connection
//   · family     — parents, children, siblings, lineage karma
//   · purpose    — dharma, life direction, "why am I here"
//   · shadow     — patterns, fears, blocks, recurring suffering
//
// Tagging is non-blocking (consultations save before the AI call
// returns) and override-able (the founder can edit/remove tags).
// =============================================================

import { callLLM, isLLMConfigured, type LLMMessage } from '@/lib/ai/llm';

export const CONSULTATION_TAG_TAXONOMY = [
  'love',
  'career',
  'health',
  'finance',
  'spiritual',
  'family',
  'purpose',
  'shadow',
] as const;

export type ConsultationTag = (typeof CONSULTATION_TAG_TAXONOMY)[number];

const SYSTEM_PROMPT = `You are a consultation intake classifier for an astrology/spiritual practice.
Read the seeker's request and assign 1-3 tags that best describe what they're seeking.

Available tags (use ONLY these, lowercase):
- love (relationships, marriage, partnership, breakups)
- career (work, business, professional direction)
- health (physical/mental health, illness, vitality)
- finance (debt, investments, property)
- spiritual (sadhana, awakening, lineage, deity)
- family (parents, children, siblings, lineage karma)
- purpose (dharma, life direction, meaning)
- shadow (patterns, fears, blocks, recurring suffering)

Respond ONLY with a JSON object: {"tags": ["tag1", "tag2"]}
No prose, no markdown fences, no explanation.`;

export interface AutoTagInput {
  request: string;
  name?: string | null;
  email?: string | null;
}

export interface AutoTagResult {
  tags: ConsultationTag[];
  ok: boolean;
  error?: string;
}

/**
 * Parse the LLM's JSON output into a validated tag array.
 * Tolerates fences, prose preambles, and trailing chatter.
 */
export function parseAutoTagOutput(raw: string): ConsultationTag[] {
  // Extract the first {...} block
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as { tags?: unknown };
    if (!Array.isArray(parsed.tags)) return [];
    const seen = new Set<ConsultationTag>();
    for (const t of parsed.tags) {
      if (typeof t === 'string' && (CONSULTATION_TAG_TAXONOMY as readonly string[]).includes(t)) {
        seen.add(t as ConsultationTag);
      }
    }
    return Array.from(seen).slice(0, 3);
  } catch {
    return [];
  }
}

/**
 * Call the LLM chain to classify a consultation request.
 * Returns up to 3 tags from the fixed taxonomy.
 * If the LLM is unconfigured or fails, returns ok:false (the caller
 * leaves the consultation un-tagged — never blocks the save).
 */
export async function autoTagConsultation(input: AutoTagInput): Promise<AutoTagResult> {
  if (!isLLMConfigured()) {
    return { tags: [], ok: false, error: 'AI engine not configured' };
  }
  if (!input.request?.trim()) {
    return { tags: [], ok: false, error: 'Empty request text' };
  }

  const userPrompt = `Seeker: ${input.name || 'Anonymous'}${input.email ? ` <${input.email}>` : ''}

Request:
${input.request.slice(0, 1200)}`;

  try {
    const messages: LLMMessage[] = [{ role: 'user', content: userPrompt }];
    const result = await callLLM(messages, {
      systemPrompt: SYSTEM_PROMPT,
      jsonMode: true,
      temperature: 0.1, // deterministic — same input = same tags
      maxTokens: 200,
    });
    if (!result.text) {
      return { tags: [], ok: false, error: 'Empty LLM response' };
    }
    const tags = parseAutoTagOutput(result.text);
    return { tags, ok: true };
  } catch (e) {
    return { tags: [], ok: false, error: e instanceof Error ? e.message : 'LLM call failed' };
  }
}

/**
 * Serialize a tag array to the JSON string format stored in the DB.
 */
export function tagsToJson(tags: ConsultationTag[]): string | null {
  return tags.length ? JSON.stringify(tags) : null;
}

/**
 * Parse the DB-stored JSON string back to a tag array.
 */
export function jsonToTags(json: string | null): ConsultationTag[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.filter(
      (t): t is ConsultationTag =>
        typeof t === 'string' && (CONSULTATION_TAG_TAXONOMY as readonly string[]).includes(t),
    );
  } catch {
    return [];
  }
}
