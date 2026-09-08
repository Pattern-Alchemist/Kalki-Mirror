#!/usr/bin/env bash
# ═════════════════════════════════════════════════════════════════════════════
# KALKI — Corpus bake, the ONE command (Vol. 5 #7)
# ------------------------------------------------------------------------------
# A new folio used to require a ritual documented across three worklogs:
# bake → fingerprint diff → CORPUS_SIZE update → re-deploy, all by hand and
# memory. This script IS the ritual now — each step gated, each failure loud.
#
# Run from repo root:   bash scripts/bake-corpus.sh [--dry-run] [--replace]
#
#   validate folio JSON (content/folios/*.json, pure-contract strict)
#     → ingest new folios into db/custom.db (idempotent by slug; the
#       JSON CLI is scripts/ingest-folio-json.ts — scripts/ingest-folios.ts
#       remains the historical full data-module re-ingest it always was)
#     → bake embeddings + regenerate idf-generated.ts (CORPUS_SIZE rides along)
#     → fingerprint diff: live corpus vs generated module must be IN_SYNC
#     → CORPUS_SIZE assertion: generated constant == sqlite COUNT
#     → vitest corpus gates (pattern-bridge + swap-readiness truth)
#     → done banner (commit list, push → re-deploy reminder, rollback line)
#
# Exit 0 = corpus baked and verified. Exit 1 = fix the FAIL first.
# ═════════════════════════════════════════════════════════════════════════════

set -u

PASS=0
FAIL=0
DRY=0
if [ "${1:-}" = "--dry-run" ]; then DRY=1; fi
EXTRA=""
[ "${1:-}" = "--replace" ] || [ "${2:-}" = "--replace" ] && EXTRA="--replace"

ok()  { echo "  PASS  $1"; PASS=$((PASS+1)); }
bad() { echo "  FAIL  $1"; FAIL=$((FAIL+1)); }

echo "── Corpus bake (one command) ────────────────────────────────────────────"

# 1. Validate folio JSON against the pure contract (also prints the plan).
echo "  ----  step 1 · folio JSON validation"
if npx tsx scripts/ingest-folio-json.ts --dry-run $EXTRA 2>&1 | sed 's/^/        /'; then
  ok "folio JSON valid (or none pending)"
else
  bad "folio JSON validation failed — fix the errors above, nothing was written"
  echo "──────────────────────────────────────────────────────────────────────────"
  echo "Bake aborted: ${PASS} passed · ${FAIL} failures"
  exit 1
fi

if [ "$DRY" = "1" ]; then
  echo "  ----  --dry-run: stopping after validation (plan shown above)."
  echo "──────────────────────────────────────────────────────────────────────────"
  echo "Dry run: ${PASS} passed · ${FAIL} failures"
  exit 0
fi

# 2. Ingest new folios (idempotent — skips slugs already baked).
echo "  ----  step 2 · ingest"
if npx tsx scripts/ingest-folio-json.ts $EXTRA 2>&1 | sed 's/^/        /'; then
  ok "ingest plan executed (0 new chunks is a valid outcome)"
else
  bad "ingest failed — the corpus was not modified by a failed plan's later steps"
  echo "──────────────────────────────────────────────────────────────────────────"
  echo "Bake aborted: ${PASS} passed · ${FAIL} failures"
  exit 1
fi

# 3. Bake embeddings + regenerate the runtime IDF module.
echo "  ----  step 3 · bake (embeddings + idf-generated.ts)"
if npx tsx scripts/bake-folio-embeddings.ts 2>&1 | tail -n 12 | sed 's/^/        /'; then
  ok "bake completed (corpus re-embedded, IDF module regenerated)"
else
  bad "bake failed — db/custom.db may hold chunks with '[]' embeddings; re-run this script"
  echo "──────────────────────────────────────────────────────────────────────────"
  echo "Bake aborted: ${PASS} passed · ${FAIL} failures"
  exit 1
fi

# 4. Fingerprint diff — the generated module must agree with the live corpus.
echo "  ----  step 4 · fingerprint diff (live corpus vs idf-generated.ts)"
PROBE_OUT="$(npx tsx scripts/neural-swap-fingerprint.ts 2>/dev/null)"
IN_SYNC="$(echo "$PROBE_OUT" | grep '^IN_SYNC=' | cut -d= -f2)"
COUNT_MATCH="$(echo "$PROBE_OUT" | grep '^CORPUS_COUNT_MATCH=' | cut -d= -f2)"
if [ "$IN_SYNC" = "yes" ] && [ "$COUNT_MATCH" = "yes" ]; then
  ok "fingerprints agree (IN_SYNC=yes · CORPUS_COUNT_MATCH=yes)"
else
  bad "fingerprint diverge (IN_SYNC=$IN_SYNC · COUNT_MATCH=$COUNT_MATCH) — re-run the bake"
fi

# 5. CORPUS_SIZE assertion — generated constant vs the sqlite truth.
echo "  ----  step 5 · CORPUS_SIZE assertion"
GEN="$(grep -o 'export const CORPUS_SIZE = [0-9]*' src/lib/rag/idf-generated.ts | grep -o '[0-9]*$')"
ACTUAL="$(python3 -c "import sqlite3;print(sqlite3.connect('db/custom.db').execute('SELECT COUNT(*) FROM FolioChunk').fetchone()[0])")"
if [ -n "$GEN" ] && [ "$GEN" = "$ACTUAL" ]; then
  ok "CORPUS_SIZE = $GEN == sqlite COUNT ($ACTUAL)"
else
  bad "CORPUS_SIZE ($GEN) != sqlite COUNT ($ACTUAL) — the generated module is stale"
fi

# 6. Vitest corpus gates — the truth tests catch a bad bake before CI does.
echo "  ----  step 6 · vitest corpus gates"
if npx vitest run tests/lib/pattern-bridge.test.ts tests/lib/swap-readiness.test.ts 2>&1 | tail -n 6 | sed 's/^/        /'; then
  ok "corpus gates green (pattern-bridge + swap-readiness)"
else
  bad "corpus gates RED — do not ship this bake; investigate before committing"
fi

echo "──────────────────────────────────────────────────────────────────────────"
if [ "$FAIL" -gt 0 ]; then
  echo "Bake NOT clean: ${PASS} passed · ${FAIL} failures — fix above, re-run."
  exit 1
fi
echo "Bake complete: ${PASS} checks passed. The corpus is verified end-to-end."
echo ""
echo "Finish by hand (deliberately not automated — a bake is a content change):"
echo "    git add db/custom.db src/lib/rag/idf-generated.ts content/folios/"
echo "    git commit -m 'corpus: bake folios (CORPUS_SIZE=$GEN)'"
echo "    git push   # deploy rides the push; sitemap/health verify after"
echo ""
echo "Rollback if anything looks wrong: git checkout -- db/custom.db src/lib/rag/idf-generated.ts"
exit 0
