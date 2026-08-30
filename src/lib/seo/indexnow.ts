// =============================================================
// KALKI — IndexNow instant-indexing client (server-side)
// -------------------------------------------------------------
// IndexNow is the shared push-indexing protocol of Bing, Yandex,
// Seznam and Naver (api.indexnow.org fan-out). Google is NOT a
// participant — Google indexing is driven by GSC + sitemap.xml.
//
// Ownership proof: the key is served at /<key>.txt from public/
// (82b322319a121d16e788612d3fbb1e79.txt). The key is a PUBLIC
// capability by protocol design — it only proves "this host
// controls this key", it grants no write access to the site.
//
// Env:
//   INDEXNOW_KEY  — override the committed default key
//   CRON_SECRET   — shared secret Vercel automatically sends as
//                   `Authorization: Bearer <CRON_SECRET>` on cron
//                   invocations (see vercel.json crons).
// =============================================================

const HOST = 'www.astrokalki.com';
const BASE = `https://${HOST}`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/** Protocol caps: 10,000 URLs per request, 20KB payload ceiling. */
const MAX_URLS_PER_REQUEST = 10_000;

export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY ?? '82b322319a121d16e788612d3fbb1e79';

export interface IndexNowResult {
  ok: boolean;
  /** HTTP status from the IndexNow fan-out (200/202 = accepted). */
  status: number;
  submitted: number;
  detail?: string;
}

/** Guard: only ever ping URLs that belong to this host. */
export function filterOwnUrls(urls: string[]): string[] {
  return [...new Set(urls)]
    .map((u) => u.trim())
    .filter((u) => u.startsWith(`${BASE}/`) || u === BASE)
    .slice(0, MAX_URLS_PER_REQUEST);
}

/**
 * Submit a URL list to IndexNow. Fire-and-forget friendly: never
 * throws — a failed ping must not break a publish flow, so every
 * failure degrades to `{ ok: false }`.
 */
export async function pingIndexNow(urls: string[]): Promise<IndexNowResult> {
  const urlList = filterOwnUrls(urls);
  if (urlList.length === 0) {
    return { ok: false, status: 0, submitted: 0, detail: 'no valid urls for host' };
  }

  const body = JSON.stringify({ host: HOST, key: INDEXNOW_KEY, urlList });

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body,
      // Engines dedupe behind the protocol — do not cache a ping here.
      cache: 'no-store',
      signal: AbortSignal.timeout(8_000),
    });
    return {
      ok: res.status === 200 || res.status === 202,
      status: res.status,
      submitted: urlList.length,
      detail: res.ok ? undefined : await res.text().catch(() => undefined),
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      submitted: urlList.length,
      detail: err instanceof Error ? err.message : 'network error',
    };
  }
}

/**
 * The full indexable surface, straight from the sitemap module —
 * a ping can never drift from what the sitemap actually declares.
 */
export async function allSitemapUrls(): Promise<string[]> {
  const { default: sitemap } = await import('@/app/sitemap');
  return sitemap().map((entry) =>
    typeof entry === 'string' ? entry : entry.url,
  );
}
