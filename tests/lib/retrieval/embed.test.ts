import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { embedKey, isEmbedConfigured } from "@/lib/retrieval/embed";

/* ══════════════════════════════════════════════════════════════
   Vol. 6 #7 — neural embedding layer.
   The doctrine: lands asleep, wakes on one env flip. The pure
   logic (isEmbedConfigured, embedKey) is tested here; the
   network/cache paths are exercised by the bedMode integration
   test via mocked Prisma + fetch.
   ══════════════════════════════════════════════════════════════ */

describe("isEmbedConfigured", () => {
  const orig = process.env.EMBED_API_KEY;
  beforeEach(() => { delete process.env.EMBED_API_KEY; });
  afterEach(() => {
    if (orig) process.env.EMBED_API_KEY = orig; else delete process.env.EMBED_API_KEY;
  });

  it("returns false when EMBED_API_KEY is unset (the resting state)", () => {
    expect(isEmbedConfigured()).toBe(false);
  });

  it("returns true when EMBED_API_KEY is set", () => {
    process.env.EMBED_API_KEY = "sk-test-key";
    expect(isEmbedConfigured()).toBe(true);
  });

  it("returns false for empty string", () => {
    process.env.EMBED_API_KEY = "";
    expect(isEmbedConfigured()).toBe(false);
  });
});

describe("embedKey — cache key derivation", () => {
  it("is deterministic for the same (model, text) pair", () => {
    const k1 = embedKey("text-embedding-3-small", "the gayatri mantra");
    const k2 = embedKey("text-embedding-3-small", "the gayatri mantra");
    expect(k1).toBe(k2);
  });

  it("differs when the model changes (cross-model collision impossible)", () => {
    const k1 = embedKey("text-embedding-3-small", "the gayatri mantra");
    const k2 = embedKey("text-embedding-3-large", "the gayatri mantra");
    expect(k1).not.toBe(k2);
  });

  it("differs when the text changes", () => {
    const k1 = embedKey("text-embedding-3-small", "the gayatri mantra");
    const k2 = embedKey("text-embedding-3-small", "the soham mantra");
    expect(k1).not.toBe(k2);
  });

  it("handles the model-text separator inside text without collision", () => {
    // embedding a text that contains \0 should not collide with a different (model, text) pair
    const k1 = embedKey("a", "x\0b");
    const k2 = embedKey("a\0x", "b");
    expect(k1).not.toBe(k2);
  });

  it("produces a 64-char hex string (sha256)", () => {
    const k = embedKey("m", "t");
    expect(k).toMatch(/^[a-f0-9]{64}$/);
  });
});
