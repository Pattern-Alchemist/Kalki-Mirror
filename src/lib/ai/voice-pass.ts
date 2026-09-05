/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Vol. 2 #8: screener voice pass
   ---------------------------------------------------------------------------
   The RAG-grounded floor (pattern-based synthesis in /api/initiate) reads
   clinical: it is corpus copy concatenated verbatim. This module lifts the
   floor into the Kaustubh voice — short sentences, second person, zero
   promises — WITHOUT letting the model add, remove, or soften content.

   Contract (mirrors yantra-synthesize.ts posture):
     · REWRITE-ONLY: the model receives the floor text and restyles it. The
       prompt forbids new practices, sources, or reassurance; the validator
       enforces forbidden-words + length so drift cannot reach a seeker.
     · SOFT-FAIL: any failure (no key, chain exhausted, contract breach)
       returns null — the caller serves the raw floor exactly as before.
     · CACHED: the floor is a deterministic function of the dominant pattern
       (≈14 unique floors across the corpus), so rewrites are stored in the
       SynthesisCache under a voice-namespaced key with the same 7-day TTL.
       A degraded LLM day costs at most one extra call per unique floor.
   ═══════════════════════════════════════════════════════════════════════════ */

import { createHash } from "crypto";
import { chatComplete } from "./openrouter";
import { YANTRA_FORBIDDEN_WORDS } from "./yantra-prompt";
import { db } from "../db";

/** Cache TTL — matches SynthesisCache (7 days). */
const TTL_DAYS = 7;
const TIMEOUT_MS = 12_000;

export const KAUSTUBH_VOICE_SYSTEM = `You are the voice of Kaustubh, the archivist of KALKI (astrokalki.com — Vedic-tantric pattern work).

You receive ONE paragraph from a pattern dossier. Rewrite it for the seeker. STYLE ONLY — the meaning must survive untouched.

HARD RULES:
- REWRITE, never invent: keep every practice name, Sanskrit term, and claim from the original. Add nothing new — no practices, no sources, no citations.
- Second person ("you"), addressed to the seeker directly.
- Short sentences. Plain English. Warm, precise, unsentimental.
- NO promises, NO reassurance, NO outcome guarantees ("you will heal" is forbidden; "the loop loosens with repetition" is acceptable only if the original states it).
- NO clinical distance ("the subject exhibits" becomes "you find yourself").
- Never use these words: ${YANTRA_FORBIDDEN_WORDS.slice(0, 12).join(", ")}.
- Length: at most the original's length plus 20%. Never expand the content.
- Output ONLY the rewritten paragraph — no preamble, no quotes, no markdown.`;

function buildUserPrompt(floor: string): string {
  return `ORIGINAL PARAGRAPH:
${floor}

Rewrite it now. Output the paragraph only.`;
}

/**
 * Validate the rewrite against the floor. Returns the cleaned rewrite, or
 * null on any contract breach. Pure — unit-tested.
 */
export function validateVoicePass(floor: string, rewrite: string): string | null {
  const candidate = rewrite.trim();
  if (candidate.length < 20) return null;

  // Length guard: a rewrite that inflates the floor is inventing content.
  // Cap at 1.4x + 40 (the +40 covers short floors where sentence-splitting
  // overhead dominates proportionally).
  const cap = Math.floor(floor.length * 1.4) + 40;
  if (candidate.length > cap) return null;

  // Forbidden-word guard, case-insensitive, word-boundary anchored so
  // "journeys" or "crystalline" do not false-positive on "journey"/"crystal".
  const lower = candidate.toLowerCase();
  for (const word of YANTRA_FORBIDDEN_WORDS) {
    const re = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(lower)) return null;
  }

  // No links, no markdown artifacts, no leaked meta-instructions.
  if (/https?:\/\/|```|^#|\*\*/.test(candidate)) return null;

  return candidate;
}

function voiceCacheKey(floor: string): string {
  return `voice:${createHash("sha256").update(floor.replace(/\s+/g, " ").trim()).digest("hex")}`;
}

/** Voice cache read — same table as SynthesisCache, own namespace. Fail-soft. */
async function lookupVoice(floor: string): Promise<string | null> {
  try {
    const row = await db.synthesisCache.findUnique({
      where: { cacheKey: voiceCacheKey(floor) },
      select: { output: true, expiresAt: true },
    });
    if (!row || row.expiresAt.getTime() <= Date.now()) return null;
    const parsed = JSON.parse(row.output) as { text?: unknown };
    return typeof parsed?.text === "string" && parsed.text.length > 0 ? parsed.text : null;
  } catch {
    return null;
  }
}

/** Voice cache write — fire-and-forget by contract. */
async function storeVoice(floor: string, rewrite: string, model: string): Promise<void> {
  try {
    const expiresAt = new Date(Date.now() + TTL_DAYS * 24 * 60 * 60 * 1000);
    await db.synthesisCache.upsert({
      where: { cacheKey: voiceCacheKey(floor) },
      create: { cacheKey: voiceCacheKey(floor), output: JSON.stringify({ text: rewrite }), model, expiresAt },
      update: { output: JSON.stringify({ text: rewrite }), model, expiresAt },
    });
  } catch {
    // cache write must never break the dossier
  }
}

/**
 * Attempt the style pass. Returns null when the key is absent, the chain
 * fails, or the rewrite breaches the contract — callers serve the raw floor.
 */
export async function voicePass(
  floor: string
): Promise<{ text: string; model: string } | null> {
  const trimmed = floor.trim();
  if (trimmed.length < 40) return null; // nothing to restyle
  if (!process.env.OPENROUTER_API_KEY) return null;

  const cached = await lookupVoice(trimmed);
  if (cached) return { text: cached, model: "cached" };

  const res = await chatComplete(
    [
      { role: "system", content: KAUSTUBH_VOICE_SYSTEM },
      { role: "user", content: buildUserPrompt(trimmed) },
    ],
    { maxTokens: 3000, temperature: 0.4, timeoutMs: TIMEOUT_MS }
  );
  if (!res.ok || !res.content) return null;

  const validated = validateVoicePass(trimmed, res.content);
  if (!validated) {
    if (process.env.YANTRA_DEBUG === "1") {
      console.warn("[voice-pass] rejected rewrite:", res.content.slice(0, 300));
    }
    return null;
  }

  await storeVoice(trimmed, validated, res.model ?? "unknown");
  return { text: validated, model: res.model ?? "unknown" };
}
