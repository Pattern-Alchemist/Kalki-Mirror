/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — YANTRA synthesis (Tier-1 ③: connect the LLM)
   ---------------------------------------------------------------------------
   /api/initiate already computes everything the screener needs — transit
   geometry, matched patterns, RAG-grounded folio chunks (L4) — and assembles
   a full yantra_prompt "ready for LLM connection". This module IS that
   connection: one OpenRouter call through the fallback chain, strict-JSON
   contract, soft-fail to the pattern-based synthesis on ANY failure.

   Grounding rules honoured (blueprint Ch 5/9):
     · The LLM may only cite folio slugs it was given — no invented sources.
     · HIGH/SEALED material must never be prescribed — the retrieval layer
       already gated the chunks by tier; the prompt restates the rule.
     · Voice: the archivist — precise, warm, non-horoscopic, zero promises.
   ═══════════════════════════════════════════════════════════════════════════ */

import { chatComplete } from "./openrouter";

export interface SynthesisInput {
  behavioralQuery: string;
  patterns: Array<{ name: string; subtitle: string }>;
  transitSummary: string;
  folioChunks: Array<{ slug: string; section: string; caution: string; text: string }>;
}

export interface SynthesisOutput {
  karmic_loop: string;        // 1–2 sentences naming the loop in the seeker's own terms
  prescription_line: string;  // one OPEN-caution practice to begin with
  citation_line: string;      // one sentence grounded in a cited folio
  cited_folios: string[];     // slugs the citation draws on (must be a subset of input)
}

const SYSTEM_PROMPT = `You are YANTRA, the synthesis voice of the KALKI archivist console (astrokalki.com — Vedic-tantric pattern work, not horoscopy).
You receive a seeker's behavioral query, the matched patterns, the current transit summary, and folio chunks retrieved from a curated sādhana corpus.
You write as the archivist: precise, warm, unsentimental. No flattery, no scare language, no medical or financial promises, no "manifestation" clichés.
HARD RULES:
- Ground every prescription ONLY in the provided folio chunks. Never invent sources, mantras, or practices.
- Never prescribe anything beyond OPEN caution level. If a chunk is not OPEN, reference it as lineage context only or ignore it.
- Write for the seeker in second person ("you"), 1–2 sentences per field, plain English.
- COMPACTNESS: at most 45 words per field. Verbose output gets truncated mid-JSON and rejected.
- Output ONLY a single valid JSON object, no markdown, no commentary. Schema (cited_folios FIRST so grounding survives truncation; each entry a BARE folio slug like "pranava-japa" — never "slug · section"):
{"cited_folios":[string],"karmic_loop":string,"prescription_line":string,"citation_line":string}`;

function buildUserPrompt(input: SynthesisInput): string {
  const patterns = input.patterns
    .map((p) => `- ${p.name} (${p.subtitle})`)
    .join("\n");
  const folios = input.folioChunks
    .map((c) => `[${c.slug} · ${c.section} · caution=${c.caution}]\n${c.text.slice(0, 700)}`)
    .join("\n\n");

  return `SEEKER QUERY:
${input.behavioralQuery || "(not provided — synthesize from the patterns alone)"}

MATCHED PATTERNS:
${patterns || "(none matched)"}

CURRENT TRANSIT:
${input.transitSummary}

FOLIO CHUNKS (the only sources you may cite):
${folios || "(none retrieved)"}

Synthesize now. Respond with the JSON object only.`;
}

/**
 * Models habitually echo the chunk label ("slug · section") instead of the
 * bare slug the contract asks for. Normalize: keep the token before the
 * first separator and strip whitespace/punctuation. Grounding is preserved —
 * the normalized slug must still be in the allowed set.
 */
function normalizeCitation(entry: string, allowedSlugs: Set<string>): string | null {
  const candidates = [
    entry,
    entry.split(/[\u00B7\u2014\u2013\u2022|:]/)[0], // · — – • | :
  ].map((s) => s.trim().toLowerCase());
  for (const c of candidates) {
    if (allowedSlugs.has(c)) return c;
  }
  return null;
}

/** Parse + validate the model output. Returns null on any contract breach. */
function parseSynthesis(raw: string, allowedSlugs: Set<string>): SynthesisOutput | null {
  const attempt = (candidate: string): SynthesisOutput | null => {
    try {
      const parsed = JSON.parse(candidate) as Record<string, unknown>;

      const str = (v: unknown, max: number) =>
        typeof v === "string" && v.trim().length > 3 ? v.trim().slice(0, max) : null;
      const karmic = str(parsed.karmic_loop, 400);
      const rx = str(parsed.prescription_line, 400);
      const cite = str(parsed.citation_line, 400);
      if (!karmic || !rx || !cite) return null;

      const folios = Array.isArray(parsed.cited_folios)
        ? (parsed.cited_folios as unknown[])
            .filter((s): s is string => typeof s === "string")
            .map((s) => normalizeCitation(s, allowedSlugs))
            .filter((s): s is string => s !== null)
            .slice(0, 4)
        : [];
      // A citation with zero valid folio references breaks grounding — reject.
      if (folios.length === 0) return null;

      return { karmic_loop: karmic, prescription_line: rx, citation_line: cite, cited_folios: folios };
    } catch {
      return null;
    }
  };

  try {
    // Tolerate code fences even though the prompt forbids them.
    const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    const start = cleaned.indexOf("{");
    if (start === -1) return null;
    const body = cleaned.slice(start);

    // Repair ladder — each rung re-validated by the full contract:
    //   1. the object is complete (primary path)
    //   2. an open string value was cut → close quote + object
    //   3. a structural cut → trim to the last complete field, close object
    const end = body.lastIndexOf("}");
    if (end !== -1) {
      const parsed = attempt(body.slice(0, end + 1));
      if (parsed) return parsed;
    }
    const closedString = attempt(body + '"}');
    if (closedString) return closedString;

    const lastFieldEnd = Math.max(
      body.lastIndexOf('",'),
      body.lastIndexOf('"]'),
    );
    if (lastFieldEnd !== -1) {
      const trimmed = body.slice(0, lastFieldEnd + 1).replace(/,\s*$/, "") + "}";
      return attempt(trimmed);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * One attempt at an LLM synthesis. Returns null when the key is absent,
 * every model in the chain fails, or the output violates the contract —
 * callers fall back to the pattern-based synthesis without ceremony.
 */
export async function synthesizeYantra(input: SynthesisInput): Promise<{ output: SynthesisOutput; model: string } | null> {
  const allowedSlugs = new Set(input.folioChunks.map((c) => c.slug));
  const res = await chatComplete(
    [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
    // 3000 tokens: the strict-JSON contract died at 700, and even 1400 was
    // fragile — minimax-m2.7 is a REASONING model (observed: 747 reasoning
    // tokens before a single content token), so the content budget is what
    // remains after reasoning. Ceiling high enough for both; free tier, so
    // headroom costs nothing. Found via the Tier-5 #6 smoke test.
    { maxTokens: 3000, temperature: 0.6, timeoutMs: 20_000 }
  );
  if (!res.ok || !res.content) {
    if (process.env.YANTRA_DEBUG === "1") {
      console.warn("[yantra] chatComplete failed:", res.error ?? "empty content", "| skipped:", res.skipped ?? false);
    }
    return null;
  }
  const output = parseSynthesis(res.content, allowedSlugs);
  if (!output && process.env.YANTRA_DEBUG === "1") {
    console.warn("[yantra] parse rejected raw output:", res.content.slice(0, 1200));
  }
  return output ? { output, model: res.model ?? "unknown" } : null;
}
