#!/usr/bin/env bash
# ═════════════════════════════════════════════════════════════════════════════
# KALKI — Neural-swap rehearsal (Vol. 4 #16)
# ------------------------------------------------------------------------------
# EMBED_API_KEY stays founder-gated. A gated key must mean ONE command, not a
# research project — so this rehearsal validates EVERY step up to the API call
# WITHOUT the key, and prints the one command for the day the key lands.
#
# Run from repo root:   bash scripts/rehearse-neural-swap.sh
# Exit 0 = ready to swap the moment a key exists. Exit 1 = fix the FAIL first.
# Exit 2 = a key IS set (nothing to rehearse — you can perform the real swap).
# ═════════════════════════════════════════════════════════════════════════════

set -u

PASS=0
FAIL=0
WARN=0

ok()   { echo "  PASS  $1"; PASS=$((PASS+1)); }
bad()  { echo "  FAIL  $1"; FAIL=$((FAIL+1)); }
warn() { echo "  WARN  $1"; WARN=$((WARN+1)); }

echo "── Neural-swap rehearsal (keyless) ──────────────────────────────────────"

# 0. The key must NOT be set: a rehearsal runs up to the API call, not into it.
if [ -n "${EMBED_API_KEY:-}" ]; then
  echo "  FAIL  EMBED_API_KEY is SET in this shell — a rehearsal must run keyless."
  echo "        Unset it to rehearse, or go straight to the real swap (see bottom)."
  exit 2
fi
ok "EMBED_API_KEY unset (rehearsal is keyless by design)"

# 1. The contract layer: embed.ts decision record + exports intact.
if [ -f src/lib/rag/embed.ts ] \
   && grep -q "DECISION RECORD" src/lib/rag/embed.ts \
   && grep -q "export const EMBED_DIM" src/lib/rag/embed.ts \
   && grep -q "export const EMBED_MODEL" src/lib/rag/embed.ts \
   && grep -q "export function embedText" src/lib/rag/embed.ts; then
  ok "embed.ts contract intact (decision record + EMBED_DIM/EMBED_MODEL/embedText exports)"
else
  bad "embed.ts contract broken — decision record or exports missing (the swap contract lives here)"
fi

# 2. The bake tooling: the one script the swap actually runs.
if [ -f scripts/bake-folio-embeddings.ts ] \
   && grep -q "embedText" scripts/bake-folio-embeddings.ts \
   && grep -q "makeIdfLookup" scripts/bake-folio-embeddings.ts \
   && grep -q "FolioChunk" scripts/bake-folio-embeddings.ts; then
  ok "bake tooling present (scripts/bake-folio-embeddings.ts reads FolioChunk, uses the shared embedText contract)"
else
  bad "bake tooling missing or mutated — the swap command would not run as documented"
fi

# 3. The generated IDF module exists and carries the corpus truth exports.
if [ -f src/lib/rag/idf-generated.ts ] \
   && grep -q "export const CORPUS_SIZE" src/lib/rag/idf-generated.ts \
   && grep -q "export const IDF" src/lib/rag/idf-generated.ts; then
  ok "idf-generated.ts present (CORPUS_SIZE + IDF exports)"
else
  bad "idf-generated.ts missing — the runtime query embedder has no IDF map to import"
fi

# 4. Rollback path: the module is git-tracked (one checkout restores it).
if git ls-files --error-unmatch src/lib/rag/idf-generated.ts > /dev/null 2>&1; then
  ok "idf-generated.ts is git-tracked — rollback is: git checkout -- src/lib/rag/idf-generated.ts && npm run build"
else
  bad "idf-generated.ts is NOT tracked by git — a bad bake could not be rolled back with one command"
fi
if git diff --quiet -- src/lib/rag/idf-generated.ts 2>/dev/null && git diff --cached --quiet -- src/lib/rag/idf-generated.ts 2>/dev/null; then
  ok "idf-generated.ts clean in the working tree (rollback target is the last commit, not a dirty state)"
else
  warn "idf-generated.ts has uncommitted changes — commit or stash before swapping so rollback is unambiguous"
fi

# 5. The corpus is present and the fingerprint agrees with the generated map.
echo "  ----  fingerprint probe (live corpus vs generated module)"
PROBE_OUT="$(npx tsx scripts/neural-swap-fingerprint.ts 2>/dev/null)"
if [ $? -ne 0 ] || [ -z "$PROBE_OUT" ]; then
  bad "fingerprint probe failed to run — is db/custom.db present and readable?"
else
  echo "$PROBE_OUT" | grep -v '^NEURAL_SWAP_REPORT_JSON=' | sed 's/^/        /'
  IN_SYNC="$(echo "$PROBE_OUT" | grep '^IN_SYNC=' | cut -d= -f2)"
  COUNT_MATCH="$(echo "$PROBE_OUT" | grep '^CORPUS_COUNT_MATCH=' | cut -d= -f2)"
  EST_TOKENS="$(echo "$PROBE_OUT" | grep '^EST_TOKENS=' | cut -d= -f2)"
  EST_COST="$(echo "$PROBE_OUT" | grep '^EST_BAKE_COST_USD=' | cut -d= -f2)"
  if [ "$IN_SYNC" = "yes" ]; then
    ok "idf-generated.ts is IN SYNC with the baked corpus (fingerprints agree)"
  else
    if [ "$COUNT_MATCH" != "yes" ]; then
      bad "corpus count drifted from CORPUS_SIZE — the corpus changed after the last bake"
    fi
    bad "IDF fingerprints DIVERGE — re-bake FIRST (npx tsx scripts/bake-folio-embeddings.ts) before any swap, or retrieval quality silently rots"
  fi

  # 6. Cost estimate — printed from the canonical chunk count, provider-agnostic.
  echo "  ----  bake cost estimate (price tunable via NEURAL_EMBED_PRICE_PER_1M_USD)"
  if [ -n "${EST_TOKENS:-}" ] && [ -n "${EST_COST:-}" ]; then
    echo "        chunks: $(echo "$PROBE_OUT" | grep '^GENERATED_CORPUS_SIZE=' | cut -d= -f2) · est tokens: ${EST_TOKENS} · est bake cost: \$${EST_COST} @ \$$(printenv NEURAL_EMBED_PRICE_PER_1M_USD 2>/dev/null || echo 0.02)/1M tokens"
    echo "        per-query cost after the swap is one query-embedding call (negligible) — the one-time bake is the whole bill."
    ok "cost estimate printed (no pricing surprises left for swap day)"
  else
    warn "cost estimate unavailable (probe printed no token counts)"
  fi
fi

# 7. Post-swap verification path exists (the truth gates that catch a bad bake).
if [ -f tests/lib/pattern-bridge.test.ts ]; then
  ok "post-swap verification available: npx vitest run tests/lib/pattern-bridge.test.ts (corpus-sync truth)"
else
  warn "pattern-bridge corpus-sync test not found — add a verification step to the runbook"
fi

echo "──────────────────────────────────────────────────────────────────────────"
echo "Rehearsal: ${PASS} passed · ${WARN} warnings · ${FAIL} failures"
if [ "$FAIL" -gt 0 ]; then
  echo "NOT ready to swap — fix the failures above, then re-run this rehearsal."
  exit 1
fi
echo "READY. The day the key lands, the neural swap is ONE command:"
echo "    EMBED_API_KEY=<key> npx tsx scripts/bake-folio-embeddings.ts"
echo "Then: npx vitest run tests/lib/pattern-bridge.test.ts  (and commit the regenerated idf-generated.ts + corpus)"
echo "Rollback if anything looks wrong: git checkout -- src/lib/rag/idf-generated.ts && npm run build"
exit 0
