import type { Metadata } from "next";
import { buildSearchDocs } from "@/lib/search/search-index";
import SearchPageClient from "./SearchPageClient";

/* =============================================================
   /search — SITE-WIDE SEARCH (Vol. 3 #13)
   The static corpora (patterns, glossary, sequences, lessons)
   become answerable from one box. Noindexed: it is a router,
   not a destination — canonical content lives on the target URLs.
   ============================================================= */

export const metadata: Metadata = {
  title: "Search — KALKI",
  description:
    "Search across patterns, the lexicon, practice sequences, and the Aghorī course.",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  const docs = buildSearchDocs();
  return <SearchPageClient docs={docs} />;
}
