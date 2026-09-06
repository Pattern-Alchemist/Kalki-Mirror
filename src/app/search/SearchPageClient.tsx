"use client";

import React, { useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";
import {
  searchDocs,
  type SearchCorpus,
  type SearchDoc,
} from "@/lib/search/search-index";

/* =============================================================
   SEARCH CLIENT — one box over the static corpora.
   Grouped results, per-corpus filter chips, honest empty state.
   No LLM, no network round-trip: the index ships with the page.
   ============================================================= */

const CORPUS_LABELS: Record<SearchCorpus, string> = {
  pattern: "Patterns",
  glossary: "Lexicon",
  sequence: "Sequences",
  lesson: "Lessons",
};

const CORPUS_ORDER: SearchCorpus[] = ["pattern", "glossary", "sequence", "lesson"];

export default function SearchPageClient({ docs }: { docs: SearchDoc[] }) {
  const [query, setQuery] = useState("");
  const [corpus, setCorpus] = useState<SearchCorpus | "all">("all");
  const inputRef = useRef<HTMLInputElement>(null);

  const hits = useMemo(
    () => searchDocs(docs, query, { corpus, limit: 40 }),
    [docs, query, corpus]
  );

  const grouped = useMemo(() => {
    const map = new Map<SearchCorpus, typeof hits>();
    for (const h of hits) {
      const arr = map.get(h.corpus) ?? [];
      arr.push(h);
      map.set(h.corpus, arr);
    }
    return map;
  }, [hits]);

  const trimmed = query.trim();

  return (
    <div className="bg-deep-black min-h-screen text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-14">
        <p className="text-[0.6rem] font-mono tracking-[0.3em] uppercase text-gold-dim mb-3">
          The Reading Room
        </p>
        <h1 className="font-display text-3xl md:text-4xl tracking-[0.04em] font-light mb-8">
          Search the Archive
        </h1>

        {/* ── Input ── */}
        <div className="relative mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted/60 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try “rescuer”, “pranayama”, “kapalika”, “cremation”…"
            autoFocus
            className="w-full bg-black/40 border border-white/10 rounded-lg pl-11 pr-10 py-3.5 text-sm text-foreground placeholder:text-text-muted/50 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-colors"
            aria-label="Search the archive"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Corpus filter chips ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(["all", ...CORPUS_ORDER] as const).map((c) => {
            const count =
              c === "all" ? hits.length : grouped.get(c)?.length ?? 0;
            const active = corpus === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCorpus(c)}
                className={`text-[0.65rem] font-mono tracking-[0.15em] uppercase px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? "border-gold/60 text-gold bg-gold/10"
                    : "border-white/10 text-text-muted hover:border-white/25 hover:text-text-secondary"
                }`}
              >
                {c === "all" ? "All" : CORPUS_LABELS[c]}
                {trimmed && ` · ${count}`}
              </button>
            );
          })}
        </div>

        {/* ── Results ── */}
        {!trimmed || trimmed.length < 2 ? (
          <div className="border border-white/10 rounded-lg p-8 bg-white/[0.02] text-center">
            <p className="text-sm text-text-secondary leading-relaxed">
              Patterns, the 86-term lexicon, practice sequences, and all 54
              Aghorī lessons — answerable from this one box.
            </p>
            <p className="text-xs text-text-muted mt-2">
              Type at least two letters to begin.
            </p>
          </div>
        ) : hits.length === 0 ? (
          <div className="border border-white/10 rounded-lg p-8 bg-white/[0.02] text-center">
            <p className="text-sm text-text-secondary">
              Nothing in the corpus matches{" "}
              <span className="text-gold">&ldquo;{trimmed}&rdquo;</span>.
            </p>
            <p className="text-xs text-text-muted mt-2">
              Diacritics are ignored — &ldquo;suddhi&rdquo; finds Śuddhi,
              &ldquo;nadi&rdquo; finds Nāḍī.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {CORPUS_ORDER.filter((c) => grouped.has(c)).map((c) => (
              <section key={c}>
                <h2 className="text-[0.6rem] font-mono tracking-[0.25em] uppercase text-text-muted mb-3">
                  {CORPUS_LABELS[c]} · {grouped.get(c)!.length}
                </h2>
                <ul className="space-y-2">
                  {grouped.get(c)!.map((hit) => (
                    <li key={hit.href}>
                      <Link
                        href={hit.href}
                        className="group block border border-white/10 hover:border-gold/40 rounded-lg px-5 py-4 bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="font-display text-base tracking-[0.03em] text-foreground group-hover:text-gold transition-colors">
                            {hit.title}
                          </span>
                          {hit.subtitle && (
                            <span className="text-[0.65rem] text-text-muted whitespace-nowrap hidden sm:block">
                              {hit.subtitle}
                            </span>
                          )}
                        </div>
                        {hit.subtitle && (
                          <span className="text-[0.65rem] text-text-muted sm:hidden block mt-1">
                            {hit.subtitle}
                          </span>
                        )}
                        <p className="text-xs text-text-secondary mt-1.5 leading-relaxed line-clamp-2">
                          {hit.text.slice(0, 180)}
                          {(hit.text.length ?? 0) > 180 ? "…" : ""}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
