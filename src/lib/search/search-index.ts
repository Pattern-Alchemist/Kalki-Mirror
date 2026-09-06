/* =============================================================
   KALKI — SITE-WIDE SEARCH INDEX (Vol. 3 #13)
   Pure, deterministic, client-deliverable index over the four
   static corpora that were previously unreachable by query:
   PATTERNS · GLOSSARY · SEQUENCES · LESSONS.
   (Siddhis already have the Archive's facet search; ContentEntry
   pages are server-rendered and stay out of the static bundle.)

   Scoring: AND semantics across whitespace tokens; each token
   must hit the doc at least once. Title hits weigh 3, subtitle
   and keywords 2, body text 1; a full phrase match in the title
   adds a bonus. Short queries (<2 chars) return nothing.
   ============================================================= */

import { allPatterns } from "@/lib/data/patterns";
import { glossaryEntries } from "@/lib/data/glossary";
import { allSequences } from "@/lib/data/sequences";
import { aghoriCourse } from "@/lib/data/aghori-tantra-course";
import { termAnchor } from "@/lib/utils/term-anchor";

export type SearchCorpus = "pattern" | "glossary" | "sequence" | "lesson";

export interface SearchDoc {
  corpus: SearchCorpus;
  title: string;
  subtitle?: string;
  href: string;
  text: string;
  keywords?: string;
}

export interface SearchHit extends SearchDoc {
  score: number;
}

export const SEARCH_HREF_PREFIXES = [
  "/patterns/",
  "/glossary/",
  "/sequences/",
  "/aghori-tantra/",
] as const;

export function buildSearchDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const p of allPatterns) {
    docs.push({
      corpus: "pattern",
      title: p.name,
      subtitle: p.subtitle,
      href: `/patterns/${p.slug}`,
      text: [p.description, p.origin, p.practice, ...p.signs]
        .filter(Boolean)
        .join(" "),
      keywords: p.archetypeIntegration
        ? `archetype ${p.archetypeIntegration}`
        : undefined,
    });
  }

  for (const g of glossaryEntries) {
    docs.push({
      corpus: "glossary",
      title: g.term,
      subtitle: g.sanskrit,
      href: `/glossary/${termAnchor(g.term)}`,
      text: [g.pronunciation, g.definition].filter(Boolean).join(" "),
      keywords: g.category,
    });
  }

  for (const s of allSequences) {
    docs.push({
      corpus: "sequence",
      title: s.name,
      subtitle: s.subtitle,
      href: `/sequences/${s.slug}`,
      text: `${s.description} ${s.targetPatterns.join(" ")}`,
      keywords: s.minTier,
    });
  }

  for (const mod of aghoriCourse) {
    for (const l of mod.lessons) {
      docs.push({
        corpus: "lesson",
        title: l.title,
        subtitle: `${mod.title} — Phase ${mod.phase}`,
        href: `/aghori-tantra/${mod.id}/${l.id}`,
        text: l.content,
        keywords: l.evidence ? `${l.evidence} lesson aghori` : "lesson aghori",
      });
    }
  }

  return docs;
}

function tokenize(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2)
    )
  );
}

/**
 * Diacritic folding: NFD-normalize, strip combining marks, lowercase.
 * "Śuddhi" → "suddhi", "Nāḍī" → "nadi" — transliteration-tolerant
 * matching across the Sanskrit corpora. Applied to BOTH the query
 * and the haystacks.
 */
function fold(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function scoreDoc(doc: SearchDoc, tokens: string[], phrase: string): number {
  const title = fold(doc.title);
  const subtitle = fold(doc.subtitle ?? "");
  const keywords = fold(doc.keywords ?? "");
  const text = fold(doc.text);

  let score = 0;
  for (const t of tokens) {
    let tokenScore = 0;
    if (title.includes(t)) tokenScore += 3;
    if (subtitle.includes(t)) tokenScore += 2;
    if (keywords.includes(t)) tokenScore += 2;
    if (text.includes(t)) tokenScore += 1;
    // AND semantics: a doc missing ANY token scores zero overall.
    if (tokenScore === 0) return 0;
    score += tokenScore;
  }
  if (phrase && title === phrase) score += 10;
  return score;
}

export function searchDocs(
  docs: SearchDoc[],
  query: string,
  opts?: { limit?: number; corpus?: SearchCorpus | "all" }
): SearchHit[] {
  const limit = opts?.limit ?? 30;
  const trimmed = (query ?? "").trim();
  if (trimmed.length < 2) return [];

  const phrase = fold(trimmed);
  const tokens = tokenize(trimmed).map(fold);
  if (tokens.length === 0) return [];

  const corpus = opts?.corpus ?? "all";
  const hits: SearchHit[] = [];
  for (const doc of docs) {
    if (corpus !== "all" && doc.corpus !== corpus) continue;
    const score = scoreDoc(doc, tokens, phrase);
    if (score > 0) hits.push({ ...doc, score });
  }
  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  return hits.slice(0, limit);
}
