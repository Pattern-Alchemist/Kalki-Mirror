/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Ask referral sources (Vol. 5 #11)
   ---------------------------------------------------------------------------
   /ask is noindexed by design — its only discovery paths are the "Ask the
   archive" CTA bands on /library, /patterns and /codex, plus direct traffic.
   Every ask carries a `ref` so the ai_ask event (#17 dictionary) can say
   WHICH surface sent the question — the funnel finally sees the ask origins.

   Client-safe and pure: imported by the CTA component, the AskForm island,
   the zod contract and the observability wrapper alike. No I/O, no server
   imports — a bad ref degrades to `undefined` (recorded as a direct ask),
   never to a 400 on an otherwise valid question.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Surfaces a question can originate from. `ask_page` = typed URL / direct. */
export const ASK_REF_SOURCES = ['library', 'patterns', 'codex', 'ask_page'] as const;

export type AskRefSource = (typeof ASK_REF_SOURCES)[number];

/** Narrow unknown input to a valid ref — anything else is `undefined`. */
export function normalizeAskRef(value: unknown): AskRefSource | undefined {
  return typeof value === 'string' && (ASK_REF_SOURCES as readonly string[]).includes(value)
    ? (value as AskRefSource)
    : undefined;
}

/**
 * Pull a valid ref out of an already-parsed JSON body (or any unknown shape).
 * Used by the observability wrapper's body-peek — must tolerate anything.
 */
export function refFromBody(body: unknown): AskRefSource | undefined {
  return normalizeAskRef(
    body != null && typeof body === 'object' ? (body as Record<string, unknown>).ref : undefined
  );
}

/** Parse `?q=` + `?ref=` out of a URL search string for the AskForm prefill. */
export function askParamsFromSearch(
  search: string
): { q?: string; ref?: AskRefSource } {
  if (!search) return {};
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  } catch {
    return {};
  }
  const q = (params.get('q') ?? '').trim().slice(0, 500);
  const ref = normalizeAskRef(params.get('ref'));
  return { ...(q ? { q } : {}), ...(ref ? { ref } : {}) };
}
