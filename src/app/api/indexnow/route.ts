// =============================================================
// KALKI — IndexNow ping endpoint
// -------------------------------------------------------------
// GET  /api/indexnow
//        Full-surface ping: submits every sitemap URL to the
//        IndexNow fan-out (Bing, Yandex, Seznam, Naver).
//        Wired as the daily Vercel cron (vercel.json). Also
//        callable manually after a big content change.
//
// GET  /api/indexnow?dryRun=1
//        Same auth, but skips the outbound ping — reports what
//        WOULD be submitted. Safe smoke test.
//
// POST /api/indexnow   { "urls": ["https://www.astrokalki.com/…"] }
//        Targeted instant ping for newly published or materially
//        edited URLs (call from publish flows / admin tooling).
//
// AUTH (either):
//   · ?key=<INDEXNOW_KEY>            — the protocol key, also the
//     ownership proof served at /<key>.txt (public by design)
//   · Authorization: Bearer <CRON_SECRET> — the header Vercel
//     automatically attaches to cron invocations
//
// Defense: every URL — from sitemap, body, or query — must belong
// to www.astrokalki.com (see filterOwnUrls). The endpoint can
// never be abused as an open relay into the engines.
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { INDEXNOW_KEY, pingIndexNow, allSitemapUrls, filterOwnUrls } from '@/lib/seo/indexnow';

export const dynamic = 'force-dynamic';

type AuthState =
  | { authorized: true }
  | { authorized: false; reason: 'missing' | 'invalid' };

function authorize(request: NextRequest): AuthState {
  const providedKey = request.nextUrl.searchParams.get('key');
  if (providedKey && providedKey === INDEXNOW_KEY) {
    return { authorized: true };
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const header = request.headers.get('authorization') ?? '';
    if (header === `Bearer ${cronSecret}`) {
      return { authorized: true };
    }
  }

  return { authorized: false, reason: providedKey ? 'invalid' : 'missing' };
}

export async function GET(request: NextRequest) {
  const auth = authorize(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'unauthorized', hint: 'pass ?key=<IndexNow key> or Vercel CRON_SECRET bearer token' },
      { status: 401 },
    );
  }

  const urls = await allSitemapUrls();
  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

  if (dryRun) {
    return NextResponse.json({ dryRun: true, wouldSubmit: urls.length, sample: urls.slice(0, 8) });
  }

  const result = await pingIndexNow(urls);
  return NextResponse.json(
    { ...result, host: 'www.astrokalki.com', source: 'sitemap' },
    { status: result.ok ? 200 : 502 },
  );
}

export async function POST(request: NextRequest) {
  const auth = authorize(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: 'unauthorized', hint: 'pass ?key=<IndexNow key> or Vercel CRON_SECRET bearer token' },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid json body' }, { status: 400 });
  }

  const rawUrls: string[] = Array.isArray((body as { urls?: unknown })?.urls)
    ? ((body as { urls: unknown[] }).urls.filter((u): u is string => typeof u === 'string'))
    : [];

  // Query-string convenience: /api/indexnow?key=…&urls=/guhya,/karma
  const qsUrls = (request.nextUrl.searchParams.get('urls') ?? '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean)
    .map((u) => (u.startsWith('http') ? u : `https://www.astrokalki.com${u.startsWith('/') ? '' : '/'}${u}`));

  const urls = filterOwnUrls([...rawUrls, ...qsUrls]);
  if (urls.length === 0) {
    return NextResponse.json(
      { error: 'no pinging-eligible urls — all urls must belong to www.astrokalki.com' },
      { status: 422 },
    );
  }

  const result = await pingIndexNow(urls);
  return NextResponse.json(
    { ...result, host: 'www.astrokalki.com', source: 'targeted' },
    { status: result.ok ? 200 : 502 },
  );
}
