// =============================================================
// KALKI — neural embedding layer (Vol. 6 #7)
// -------------------------------------------------------------
// The EMBED_API_KEY landing surface. Mirrors the Sentry pattern:
// lands asleep, wakes on one env flip. When EMBED_API_KEY is unset:
//   isEmbedConfigured() → false
//   embedBatch(...) → null
//   /api/ai/ask retrieval path is byte-identical to pre-#7 behavior
//
// When EMBED_API_KEY is set:
//   embedBatch(texts) calls the provider, returns number[][]
//   Cache via Prisma EmbedCache (key = sha256(JSON([model, text])))
//   3s AbortController budget — abort returns null, never throws
//   Any error returns null (never throws into /ask)
//
// The retrieval seam (in retrieval.ts) composes this with the
// existing lexical path via rrfFuse(). The bedMode harness
// (in bed-mode.ts) measures whether adding dense improves hit-rate.
// =============================================================

import { createHash } from 'node:crypto';
import { db } from '@/lib/db';

export const isEmbedConfigured = (): boolean => Boolean(process.env.EMBED_API_KEY);

const EMBED_ENDPOINT = process.env.EMBED_ENDPOINT ?? 'https://api.openai.com/v1/embeddings';
const EMBED_MODEL = process.env.EMBED_MODEL ?? 'text-embedding-3-small';
const EMBED_TIMEOUT_MS = 3_000; // 3s budget inside the 12s chain budget
const BATCH_SIZE = 32;

/**
 * Cache key: sha256 of JSON-encoded [model, text] pair.
 *
 * Length-prefixed / JSON encoding is critical — naive `model + "\0" + text`
 * collides when model or text contains the separator (e.g., `("a", "x\0b")`
 * and `("a\0x", "b")` both serialize to `"a\0x\0b"`). JSON.stringify wraps
 * each field in quotes and escapes special chars, so the boundaries are
 * always unambiguous.
 */
export function embedKey(model: string, text: string): string {
  return createHash('sha256').update(JSON.stringify([model, text])).digest('hex');
}

interface EmbedCacheRow {
  cacheKey: string;
  model: string;
  vec: string;
  createdAt: Date;
}

async function readCache(keys: string[]): Promise<Map<string, number[]>> {
  const out = new Map<string, number[]>();
  if (keys.length === 0) return out;
  try {
    const rows: EmbedCacheRow[] = await db.embedCache.findMany({
      where: { cacheKey: { in: keys } },
    });
    for (const r of rows) {
      try {
        const v = JSON.parse(r.vec);
        if (Array.isArray(v) && v.length > 0) out.set(r.cacheKey, v as number[]);
      } catch {
        // corrupt row — skip
      }
    }
  } catch {
    // cache miss is the doctrine's resting state
  }
  return out;
}

async function writeCache(entries: { key: string; model: string; text: string; vec: number[] }[]): Promise<void> {
  if (entries.length === 0) return;
  try {
    // best-effort upsert — partial success persists (next run pays only for misses)
    await Promise.all(
      entries.map((e) =>
        db.embedCache.upsert({
          where: { cacheKey: e.key },
          create: {
            cacheKey: e.key,
            model: e.model,
            vec: JSON.stringify(e.vec),
          },
          update: {
            model: e.model,
            vec: JSON.stringify(e.vec),
          },
        }).catch(() => null),
      ),
    );
  } catch {
    // cache write is a convenience, never a dependency
  }
}

async function callProvider(texts: string[]): Promise<number[][] | null> {
  if (!isEmbedConfigured()) return null;
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), EMBED_TIMEOUT_MS);
  try {
    const res = await fetch(EMBED_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EMBED_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: texts, model: EMBED_MODEL }),
      signal: ac.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { data?: Array<{ embedding?: number[] }> };
    const rows = data.data ?? [];
    if (rows.length !== texts.length) return null;
    const out: number[][] = [];
    for (const r of rows) {
      if (!Array.isArray(r.embedding) || r.embedding.length === 0) return null;
      out.push(r.embedding);
    }
    return out;
  } catch {
    return null; // timeout, network, anything — never throws into /ask
  } finally {
    clearTimeout(t);
  }
}

/**
 * Embed a batch of texts with cache + provider call. Returns:
 *   - null when EMBED_API_KEY unset (the resting state — /ask stays lexical)
 *   - null when any provider call fails or times out (fail-soft)
 *   - number[][] aligned with the input order on success
 */
export async function embedBatch(texts: string[]): Promise<number[][] | null> {
  if (!isEmbedConfigured()) return null;
  if (texts.length === 0) return [];

  // 1) cache lookup
  const keys = texts.map((t) => embedKey(EMBED_MODEL, t));
  const cached = await readCache(keys);
  const out: number[][] = new Array(texts.length).fill(null);
  const misses: { idx: number; text: string; key: string }[] = [];
  for (let i = 0; i < texts.length; i++) {
    const v = cached.get(keys[i]);
    if (v) out[i] = v;
    else misses.push({ idx: i, text: texts[i], key: keys[i] });
  }

  if (misses.length === 0) return out; // all cache hits

  // 2) batch the misses (provider limit BATCH_SIZE)
  const newEntries: { key: string; model: string; text: string; vec: number[] }[] = [];
  for (let i = 0; i < misses.length; i += BATCH_SIZE) {
    const batch = misses.slice(i, i + BATCH_SIZE);
    const batchTexts = batch.map((b) => b.text);
    const vecs = await callProvider(batchTexts);
    if (!vecs) return null; // any failure = fail-soft to null
    for (let j = 0; j < batch.length; j++) {
      out[batch[j].idx] = vecs[j];
      newEntries.push({ key: batch[j].key, model: EMBED_MODEL, text: batch[j].text, vec: vecs[j] });
    }
  }

  // 3) persist cache (best-effort, never blocks)
  await writeCache(newEntries);

  return out;
}
