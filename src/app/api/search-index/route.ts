// =============================================================
// KALKI — search index payload (Vol. 5 #18)
// -------------------------------------------------------------
// GET /api/search-index → the full static-corpus search index
// (patterns, lexicon, sequences, Aghorī lessons) as JSON.
//
// WHY A ROUTE: the docs carry the lesson corpus full-text — search
// RECALL needs it, but inlining it into /search's HTML serialized
// ~290KB into every page view. The page now ships a light shell and
// hydrates the index from here once (revalidated hourly; the client
// caches in memory for the session). Not linked from the site — it
// is a data endpoint for the search surface.
// =============================================================

import { NextResponse } from 'next/server';
import { buildSearchDocs } from '@/lib/search/search-index';

export const revalidate = 3600;

export async function GET() {
  return NextResponse.json(buildSearchDocs());
}
