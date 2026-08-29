// =============================================================
// Google Search Console ownership verification (HTML-file method)
// -------------------------------------------------------------
// Serves the verification file GSC asks for at
//   https://www.astrokalki.com/google<token>.html
// via a next.config rewrite (path-param form), without a
// redeploy-hostile static file.
//
// Founder flow (docs/geo/search-console-us-targeting.md):
//   1. In GSC choose "HTML file" verification → note the filename
//      google<token>.html
//   2. Set GSC_VERIFICATION_TOKEN=<token> in Vercel env vars
//   3. Redeploy; click Verify in GSC
//
// The DNS TXT method (Domain property) needs no code at all and
// is the recommended path — this route is the fallback.
// Fail-closed: with no env var configured, every token 404s.
// =============================================================

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function normalizeToken(raw: string): string {
  // Accept the bare token OR the full filename (google<token>.html)
  // — removes the classic copy-paste stumble.
  return raw.replace(/^google/, '').replace(/\.html$/i, '').trim();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const expected = normalizeToken(process.env.GSC_VERIFICATION_TOKEN ?? '');
  if (!expected) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const { token } = await params;
  const provided = normalizeToken(token);
  if (!provided || provided !== expected) {
    return new NextResponse('Not Found', { status: 404 });
  }

  return new NextResponse(`google-site-verification: google${expected}.html\n`, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
