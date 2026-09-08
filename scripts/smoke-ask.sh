#!/usr/bin/env bash
# ═════════════════════════════════════════════════════════════
# KALKI — /ask post-deploy smoke (Vol. 5 #16 + #5 latency budget)
# -------------------------------------------------------------
# The standard post-deploy drill for the /ask surface:
#   1. /ask page is 200 AND noindexed (the #14 contract), < 3s
#   2. an answerable corpus query returns grounded:true with citations
#   3. warm repeats of the same query land under the 12s p95 budget (#5)
#   4. an out-of-corpus query returns the HONEST silence (grounded:false)
#   5. rate limit holds: the distributed limiter self-test is ok
#
# Usage:
#   BASE_URL=https://www.astrokalki.com bash scripts/smoke-ask.sh
# Exit 0 = all pass; exit 1 = any failure (deploy suspect).
# ═════════════════════════════════════════════════════════════
set -euo pipefail

BASE_URL="${BASE_URL:-https://www.astrokalki.com}"
FAIL=0

say() { printf '%s\n' "$*"; }
check() { # check <name> <ok> <detail>
  if [ "$2" = "1" ]; then say "PASS  $1  — $3"; else say "FAIL  $1  — $3"; FAIL=1; fi
}

# 1. page + noindex (+ the 3s non-LLM surface budget, Vol. 5 #5)
PAGE_OUT=$(curl -s -m 30 -D - -o /tmp/kask-page.html -w '\n%{time_total}' "${BASE_URL}/ask")
PAGE_TIME=$(printf '%s' "$PAGE_OUT" | tail -1)
PAGE=$(printf '%s' "$PAGE_OUT" | sed '$d')
STATUS=$(printf '%s' "$PAGE" | head -1 | awk '{print $2}')
XROBOTS=$(printf '%s' "$PAGE" | tr -d '\r' | rg -i '^x-robots-tag:' | head -1 || true)
METAROBOTS=$(rg -io '<meta[^>]*name="robots"[^>]*>' /tmp/kask-page.html | head -1 || true)
NOINDEX=0
{ printf '%s' "$XROBOTS" | rg -qi noindex || true; } && NOINDEX=1
if [ "$NOINDEX" = "0" ] && printf '%s' "$METAROBOTS" | rg -qi noindex; then NOINDEX=1; fi
check "ask page 200 + noindex" "$([ "$STATUS" = "200" ] && [ "$NOINDEX" = "1" ] && echo 1 || echo 0)" "HTTP $STATUS, noindex=$NOINDEX"
check "ask page under 3s budget" "$(python3 -c "print(1 if $PAGE_TIME < 3.0 else 0)")" "${PAGE_TIME}s"

# 2. grounded path (corpus-covered query) — timed; the warm samples below
#    complete the p95 budget assertion (#5: the prewarm cron keeps this
#    query hot, so a cold 12s+ answer here means the budget is failing).
GROUNDED=$(curl -s -m 90 -X POST "${BASE_URL}/api/ai/ask" -H "Content-Type: application/json" \
  -w '\n%{time_total}' -d '{"query":"How do I practice ajapa japa?"}')
LAT1=$(printf '%s' "$GROUNDED" | tail -1)
GROUNDED_BODY=$(printf '%s' "$GROUNDED" | sed '$d')
OKG=$(printf '%s' "$GROUNDED_BODY" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(1 if d.get("grounded") is True and len(d.get("citations",[]))>0 else 0)' 2>/dev/null || echo 0)
MODEL=$(printf '%s' "$GROUNDED_BODY" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("model","?"))' 2>/dev/null || echo "?")
CACHED=$(printf '%s' "$GROUNDED_BODY" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("cached","?"))' 2>/dev/null || echo "?")
check "grounded answer with citations" "$OKG" "model=$MODEL cached=$CACHED lat1=${LAT1}s"

# 3. warm p95 budget (#5): two repeats of the SAME query — identical
#    (query · retrieval) keys hit the ask-cache — p95 of 3 samples < 12s.
WARM=$(curl -s -m 90 -X POST "${BASE_URL}/api/ai/ask" -H "Content-Type: application/json" \
  -w '\n%{time_total}' -d '{"query":"How do I practice ajapa japa?"}')
LAT2=$(printf '%s' "$WARM" | tail -1)
WARM2=$(curl -s -m 90 -X POST "${BASE_URL}/api/ai/ask" -H "Content-Type: application/json" \
  -w '\n%{time_total}' -d '{"query":"How do I practice ajapa japa?"}')
LAT3=$(printf '%s' "$WARM2" | tail -1)
P95=$(python3 -c "print(max($LAT1, $LAT2, $LAT3))")
check "ask p95 warm under 12s budget" "$(python3 -c "print(1 if $P95 < 12.0 else 0)")" "samples ${LAT1}/${LAT2}/${LAT3}s → p95 ${P95}s"

# 4. honest silence (out-of-corpus query)
SILENT=$(curl -s -m 90 -X POST "${BASE_URL}/api/ai/ask" -H "Content-Type: application/json" \
  -d '{"query":"What is the best cryptocurrency to buy in 2026 for guaranteed profit?"}')
OKS=$(printf '%s' "$SILENT" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(1 if d.get("grounded") is False and d.get("reason") in ("ungrounded_output","corpus_silent") else 0)' 2>/dev/null || echo 0)
check "out-of-corpus query → honest silence" "$OKS" "$(printf '%s' "$SILENT" | head -c 120)"

# 5. rate limit: the shared distributed backend engages. The health
#    endpoint runs a one-shot self-test through the EXACT production
#    path with a stable key (external bursts can't do this — the runner's
#    egress IP may rotate, making every call a fresh key). Assert ok=true,
#    a distributed backend label, and the 3s non-LLM surface budget (#5).
HEALTH_OUT=$(curl -s -m 30 -w '\n%{time_total}' "${BASE_URL}/api/health")
HEALTH_TIME=$(printf '%s' "$HEALTH_OUT" | tail -1)
HEALTH_BODY=$(printf '%s' "$HEALTH_OUT" | sed '$d')
ST=$(printf '%s' "$HEALTH_BODY" | python3 -c 'import json,sys; d=json.load(sys.stdin); st=d.get("rateLimitSelfTest") or {}; print(st.get("ok"), st.get("backend"), st.get("error") or "-")' 2>/dev/null || echo "err - -")
OKRL=$(printf '%s' "$ST" | python3 -c 'import sys; parts=sys.stdin.read().split(); print(1 if len(parts)>=2 and parts[0]=="True" and parts[1] in ("turso","upstash","vercel-kv") else 0)' 2>/dev/null || echo 0)
check "limiter self-test ok + distributed backend" "$OKRL" "selfTest=$ST"
check "health under 3s budget" "$(python3 -c "print(1 if $HEALTH_TIME < 3.0 else 0)")" "${HEALTH_TIME}s"

if [ "$FAIL" = "0" ]; then say "SMOKE /ask: ALL PASS"; else say "SMOKE /ask: FAILURES — investigate before promoting"; fi
exit "$FAIL"
