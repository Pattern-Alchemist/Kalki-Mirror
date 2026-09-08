import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { createClient } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { parseAskOutput, buildAskMessages, buildCitations, type RetrievedChunk } from "@/lib/ai/ask";
import { askCacheKey, lookupAsk, storeAsk, recordAskHit } from "@/lib/ai/ask-cache";
import { db } from "@/lib/db";

/* ══════════════════════════════════════════════════════════════
   Vol. 5 #16 — /ask contract truth gate (the gaps ask.test.ts
   did not pin): trim tolerance on citations, the full
   store→lookup→hit→breach cache round trip against the real
   local store, and the contract-size prompt re-derivation.
   The production route is only as strong as these seams.
   ══════════════════════════════════════════════════════════════ */

const POOL = ["pranava-japa", "manasika-japa", "soham-dhyana"];

/**
 * The db-touching tests are the first unit tests to exercise the real
 * local store (DATABASE_URL, default file:./db/custom.db). Provision the
 * directory + SynthesisCache table (schema.prisma-faithful DDL) so a fresh
 * clone / CI runner passes without a manual db push. Same resolution
 * logic as src/lib/db.ts so the paths agree whatever the CWD.
 */
beforeAll(async () => {
  const url = process.env.DATABASE_URL || "file:./db/custom.db";
  if (!url.startsWith("file:")) return; // remote store — assume migrated
  const filePath = url.slice("file:".length);
  mkdirSync(dirname(filePath) || ".", { recursive: true });
  const client = createClient({ url });
  await client.execute(`CREATE TABLE IF NOT EXISTS "SynthesisCache" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "cacheKey" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT '',
    "hits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
  )`);
  await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "SynthesisCache_cacheKey_key" ON "SynthesisCache"("cacheKey")`);
  await client.execute(`CREATE INDEX IF NOT EXISTS "SynthesisCache_expiresAt_idx" ON "SynthesisCache"("expiresAt")`);
  client.close();
});

describe("parseAskOutput — trim tolerance (Vol. 5 #16 gap)", () => {
  it("accepts slugs with trailing punctuation — trim defends", () => {
    const out = parseAskOutput(
      JSON.stringify({ grounded: true, answer: "Do the japa.", cited_folios: ["pranava-japa.", "manasika-japa,"] }),
      POOL
    );
    expect(out).toEqual({ answer: "Do the japa.", citedSlugs: ["pranava-japa", "manasika-japa"] });
  });

  it("accepts mixed-case slugs — the citation is lowercased before pool check", () => {
    const out = parseAskOutput(
      JSON.stringify({ grounded: true, answer: "Chant Om.", cited_folios: ["Pranava-Japa"] }),
      POOL
    );
    expect(out?.citedSlugs).toEqual(["pranava-japa"]);
  });

  it("still rejects a slug the model never saw, even trimmed", () => {
    expect(parseAskOutput(JSON.stringify({ grounded: true, answer: "x", cited_folios: [" kapala-bhati "] }), POOL)).toBeNull();
  });

  it("rejects non-string citation entries (the strictness is deliberate)", () => {
    expect(parseAskOutput(JSON.stringify({ grounded: true, answer: "x", cited_folios: [7] }), POOL)).toBeNull();
  });

  it("buildCitations follows the model's citation order, not similarity order", () => {
    const chunks: RetrievedChunk[] = [
      { slug: "manasika-japa", section: "summary", caution: "OPEN", text: "a", similarity: 0.99 },
      { slug: "pranava-japa", section: "summary", caution: "OPEN", text: "b", similarity: 0.98 },
    ] as unknown as RetrievedChunk[];
    const cites = buildCitations(["pranava-japa", "manasika-japa"], chunks);
    expect(cites.map((c) => c.slug)).toEqual(["pranava-japa", "manasika-japa"]);
  });

  it("buildAskMessages numbers chunks and appends the question verbatim", () => {
    const chunks = [
      { slug: "pranava-japa", section: "summary", caution: "OPEN", text: "Om repetition.", similarity: 0.9 },
    ] as unknown as RetrievedChunk[];
    const msgs = buildAskMessages("How do I begin?", chunks);
    expect(msgs).toHaveLength(1);
    expect(msgs[0].content).toContain("[1] slug: pranava-japa");
    expect(msgs[0].content).toContain('"How do I begin?"');
  });
});

describe("ask-cache round trip against the real store (Vol. 5 #16 gap)", () => {
  const keys: string[] = [];

  afterEach(async () => {
    if (keys.length > 0) {
      try {
        await db.synthesisCache.deleteMany({ where: { cacheKey: { in: keys } } });
      } catch {
        /* local store only — nothing to protect */
      }
      keys.length = 0;
    }
  });

  it("store → lookup hit with the same model; key is tier-isolated", async () => {
    const key = askCacheKey("how do I practice pranava japa?", POOL);
    keys.push(key);
    await storeAsk(key, { answer: "Begin with 21 audible repetitions.", cited_folios: ["pranava-japa"] }, "dots-test");
    const hit = await lookupAsk(key);
    expect(hit).not.toBeNull();
    expect(hit?.model).toBe("dots-test");
    expect(hit?.output.answer).toContain("21 audible");
    expect(hit?.output.cited_folios).toEqual(["pranava-japa"]);
    // the ask bucket key must differ from a yantra synthesis key for the same query
    expect(key).not.toBe(askCacheKey("how do I practice pranava japa?", []) /* no folio slugs → different key */);
  });

  it("recordAskHit is fire-and-forget and never throws on a live key", async () => {
    const key = askCacheKey("round trip hit counter", POOL);
    keys.push(key);
    await storeAsk(key, { answer: "ok", cited_folios: ["pranava-japa"] }, "m");
    expect(() => recordAskHit(key)).not.toThrow();
  });

  it("a contract breach in the stored row degrades to a miss, not an error", async () => {
    const key = askCacheKey("breach test", POOL);
    keys.push(key);
    await storeAsk(key, { answer: "fine", cited_folios: ["pranava-japa"] }, "m");
    // corrupt: empty citations — exactly what a bad LLM write would look like
    await db.synthesisCache.update({ where: { cacheKey: key }, data: { output: JSON.stringify({ answer: "fine", cited_folios: [] }) } });
    expect(await lookupAsk(key)).toBeNull();
  });

  it("a fresh key with no row is a clean miss", async () => {
    const key = askCacheKey("never stored query", POOL);
    expect(await lookupAsk(key)).toBeNull();
  });
});
