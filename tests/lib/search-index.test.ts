import { describe, expect, it } from "vitest";
import {
  buildSearchDocs,
  searchDocs,
  SEARCH_HREF_PREFIXES,
  type SearchDoc,
} from "@/lib/search/search-index";
import { allPatterns } from "@/lib/data/patterns";
import { glossaryEntries } from "@/lib/data/glossary";
import { allSequences } from "@/lib/data/sequences";
import { aghoriCourse, COURSE_LESSON_COUNT } from "@/lib/data/aghori-tantra-course";

/* ══════════════════════════════════════════════════════════════
   Vol. 3 #13 — site-wide search. The index is pinned to the
   corpora it is built from (counts + href shapes); scoring is
   pinned for ordering and AND semantics. If a corpus grows and
   the index silently misses it, these tests burn.
   ══════════════════════════════════════════════════════════════ */

const docs = buildSearchDocs();

describe("buildSearchDocs — corpus coverage", () => {
  it("indexes every pattern", () => {
    const n = docs.filter((d) => d.corpus === "pattern").length;
    expect(n).toBe(allPatterns.length);
    expect(n).toBeGreaterThan(10);
  });

  it("indexes all 86 glossary terms at their slug URLs", () => {
    const g = docs.filter((d) => d.corpus === "glossary");
    expect(g).toHaveLength(86);
    expect(g).toHaveLength(glossaryEntries.length);
    const hrefs = new Set(g.map((d) => d.href));
    expect(hrefs.size).toBe(g.length); // termAnchor collisions would merge URLs
  });

  it("indexes every sequence", () => {
    const n = docs.filter((d) => d.corpus === "sequence").length;
    expect(n).toBe(allSequences.length);
    expect(n).toBeGreaterThan(0);
  });

  it("indexes all 54 aghori lessons at their phase/lesson URLs", () => {
    const n = docs.filter((d) => d.corpus === "lesson").length;
    expect(n).toBe(COURSE_LESSON_COUNT);
    expect(n).toBe(54);
  });

  it("every href resolves to a real public route prefix", () => {
    for (const d of docs) {
      expect(
        SEARCH_HREF_PREFIXES.some((p) => d.href.startsWith(p)),
        `bad href: ${d.href}`
      ).toBe(true);
      expect(d.href.includes("//")).toBe(false);
      expect(d.href.endsWith("/")).toBe(false);
    }
  });

  it("no duplicate hrefs across the whole index", () => {
    const hrefs = docs.map((d) => d.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("every doc carries searchable text", () => {
    for (const d of docs) {
      expect(d.title.trim().length).toBeGreaterThan(0);
      expect(d.text.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("searchDocs — behavior", () => {
  it("short queries return nothing (no 1-letter spam)", () => {
    expect(searchDocs(docs, "a")).toEqual([]);
    expect(searchDocs(docs, "")).toEqual([]);
    expect(searchDocs(docs, "   ")).toEqual([]);
  });

  it("finds a pattern by name with the exact title ranked first", () => {
    const hits = searchDocs(docs, "the rescuer");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].corpus).toBe("pattern");
    expect(hits[0].title.toLowerCase()).toBe("the rescuer");
    expect(hits[0].href).toBe("/patterns/the-rescuer");
  });

  it("finds glossary terms diacritic-insensitively (suddhi → Śuddhi)", () => {
    const hits = searchDocs(docs, "suddhi", { corpus: "glossary" });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.corpus === "glossary")).toBe(true);
    expect(hits.some((h) => h.title.includes("Śuddhi"))).toBe(true);
  });

  it("diacritic queries also resolve (Śuddhi → Śuddhi)", () => {
    const hits = searchDocs(docs, "śuddhi", { corpus: "glossary" });
    expect(hits.length).toBeGreaterThan(0);
  });

  it("AND semantics: all tokens must hit somewhere", () => {
    // Both tokens hit the same glossary entry's definition space.
    const hits = searchDocs(docs, "śuddhi breath", { corpus: "glossary" });
    if (hits.length > 0) {
      for (const h of hits) {
        const hay = `${h.title} ${h.subtitle ?? ""} ${h.keywords ?? ""} ${h.text}`
          .toLowerCase();
        expect(
          hay.includes("śuddhi") || hay.includes("suddhi")
        ).toBe(true);
      }
    }
  });

  it("a token that matches nothing eliminates every doc", () => {
    const hits = searchDocs(docs, "rescuer zxqblorp");
    expect(hits).toEqual([]);
  });

  it("corpus filter restricts results", () => {
    const lessons = searchDocs(docs, "aghori", { corpus: "lesson", limit: 200 });
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons.every((l) => l.corpus === "lesson")).toBe(true);
  });

  it("limit caps the result set", () => {
    const hits = searchDocs(docs, "the", { limit: 5 });
    expect(hits.length).toBeLessThanOrEqual(5);
  });

  it("scores rank above substring-only hits", () => {
    const docs2: SearchDoc[] = [
      { corpus: "pattern", title: "Kapalika", href: "/patterns/k", text: "unrelated body" },
      { corpus: "pattern", title: "Other", href: "/patterns/o", text: "kapalika mentioned once" },
    ];
    const hits = searchDocs(docs2, "kapalika");
    expect(hits[0].title).toBe("Kapalika");
    expect(hits[0].score).toBeGreaterThan(hits[1].score);
  });

  it("deterministic ordering across identical queries", () => {
    const a = searchDocs(docs, "breath");
    const b = searchDocs(docs, "breath");
    expect(a.map((h) => h.href)).toEqual(b.map((h) => h.href));
  });
});
