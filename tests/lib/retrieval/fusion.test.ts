import { describe, it, expect } from "vitest";
import { rrfFuse, cosine } from "@/lib/retrieval/fusion";

/* ══════════════════════════════════════════════════════════════
   Vol. 6 #7 — RRF fusion math.
   The zero-regression proof: when dense is null, the lexical
   ordering is returned unchanged. When dense is present, the
   fused ordering merges both rankings with no score calibration.
   ══════════════════════════════════════════════════════════════ */

describe("rrfFuse — zero-regression floor", () => {
  it("returns lexical unchanged when dense is null (the resting state)", () => {
    const lex = ["a", "b", "c", "d"];
    expect(rrfFuse(lex, null)).toEqual(lex);
  });

  it("returns lexical unchanged when dense is empty array", () => {
    const lex = ["a", "b", "c"];
    // dense is `string[] | null` — empty array is treated as present-but-empty
    // the test confirms lexical survives when the dense path returns nothing
    const result = rrfFuse(lex, []);
    expect(result).toEqual(lex);
  });
});

describe("rrfFuse — fusion behavior", () => {
  it("preserves a slug that's #1 in both rankings at #1", () => {
    const fused = rrfFuse(["a", "b", "c"], ["a", "x", "y"]);
    expect(fused[0]).toBe("a");
  });

  it("promotes a slug that appears high in both", () => {
    // 'b' is #2 lexical and #2 dense — should beat 'a' (#1 lexical, #4 dense)
    const fused = rrfFuse(["a", "b", "c", "d"], ["x", "b", "y", "a"]);
    expect(fused[0]).toBe("b");
  });

  it("includes all unique slugs from both rankings", () => {
    const fused = rrfFuse(["a", "b"], ["c", "d"]);
    expect(new Set(fused)).toEqual(new Set(["a", "b", "c", "d"]));
  });

  it("on score ties, lexical wins (stable sort preserves insertion order)", () => {
    // With equal weights and symmetric rankings, scores tie. JavaScript's
    // stable sort preserves insertion order — the lexical list is inserted
    // first, so its order wins the tie. This is the documented behavior.
    const f1 = rrfFuse(["a", "b"], ["b", "a"]);
    expect(f1).toEqual(["a", "b"]);
    const f2 = rrfFuse(["b", "a"], ["a", "b"]);
    expect(f2).toEqual(["b", "a"]);
  });

  it("weight bias shifts the fused ordering toward the heavier side", () => {
    // 'a' is rank-0 lexical, rank-1 dense; 'b' is rank-0 dense, rank-1 lexical
    // with wLex > wDense, 'a' (rank-0 lex) wins
    const lexBias = rrfFuse(["a", "b"], ["b", "a"], 0.9, 0.1);
    expect(lexBias[0]).toBe("a");
    // with wDense > wLex, 'b' (rank-0 dense) wins
    const denseBias = rrfFuse(["a", "b"], ["b", "a"], 0.1, 0.9);
    expect(denseBias[0]).toBe("b");
  });
});

describe("cosine — vector similarity", () => {
  it("returns 1 for identical vectors", () => {
    expect(cosine([1, 0, 0], [1, 0, 0])).toBeCloseTo(1, 5);
  });

  it("returns 0 for orthogonal vectors", () => {
    expect(cosine([1, 0], [0, 1])).toBeCloseTo(0, 5);
  });

  it("returns 0 for empty vectors (never NaN)", () => {
    expect(cosine([], [])).toBe(0);
  });

  it("returns -1 for antipodal vectors", () => {
    expect(cosine([1, 0], [-1, 0])).toBeCloseTo(-1, 5);
  });

  it("handles different-length vectors by truncating to the shorter", () => {
    // first component agrees, second doesn't exist on one side
    expect(cosine([1, 5, 5], [1])).toBeCloseTo(1, 5);
  });
});
