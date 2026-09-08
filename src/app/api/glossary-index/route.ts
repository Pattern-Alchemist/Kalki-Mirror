// =============================================================
// KALKI — glossary index payload (Vol. 5 #18)
// -------------------------------------------------------------
// GET /api/glossary-index → the full 86-term Lexicon (projected:
// 300-char definition previews, hi objects stripped) as JSON.
//
// WHY A ROUTE: the /glossary hub used to inline all 86 entries into
// its HTML AND its RSC payload — the heaviest page on the site. The
// hub now ships the first 24 inline (server-rendered, SEO-visible)
// and this route feeds the client the full set once on mount.
// Revalidated hourly; fail-soft consumers by contract.
// =============================================================

import { NextResponse } from 'next/server';
import { glossaryEntries } from '@/lib/data/glossary';

export const revalidate = 3600;

function definitionPreview(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max)}…`;
}

export async function GET() {
  const entries = glossaryEntries.map((e) => ({
    term: e.term,
    sanskrit: e.sanskrit,
    pronunciation: e.pronunciation,
    definition: definitionPreview(e.definition, 300),
    category: e.category,
    relatedTerms: e.relatedTerms,
    relatedSiddhiSlugs: e.relatedSiddhiSlugs,
    minTier: e.minTier,
  }));
  return NextResponse.json(entries);
}
