// =============================================================
// KALKI — retrieval fusion (Vol. 6 #7)
// -------------------------------------------------------------
// Reciprocal Rank Fusion (RRF) — combines lexical ranking with
// dense (neural) ranking. Pure, no I/O, no dependencies.
//
// RRF is the standard hybrid retrieval combiner because it needs
// no score calibration: a slug at rank 0 contributes 1/(K+1),
// rank 1 contributes 1/(K+2), etc. The sum gives a fused score
// that's robust to wildly different score distributions between
// the lexical (cosine of hashed-TFIDF) and dense (cosine of
// neural embeddings) paths.
//
// When dense is null (EMBED_API_KEY unset, or the embed call
// failed/timed out), the lexical ordering is returned unchanged —
// the doctrine's zero-regression floor.
// =============================================================

const K = 60; // standard RRF constant

export function rrfFuse(
  lexical: string[],
  dense: string[] | null,
  wLex = 0.5,
  wDense = 0.5,
): string[] {
  if (!dense) return lexical;
  const scores = new Map<string, number>();

  const add = (ids: string[], w: number) => {
    ids.forEach((id, i) => {
      scores.set(id, (scores.get(id) ?? 0) + w / (K + i + 1));
    });
  };
  add(lexical, wLex);
  add(dense, wDense);

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}

/** Cosine similarity — used by bed-mode for dense candidate ranking. */
export function cosine(a: number[], b: number[]): number {
  if (!a.length || !b.length) return 0;
  const n = Math.min(a.length, b.length);
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) {
    dot += a[i] * b[i];
    na += a[i] ** 2;
    nb += b[i] ** 2;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}
