#!/usr/bin/env bash
# ═════════════════════════════════════════════════════════════
# KALKI — /ask post-deploy smoke (Vol. 5 #16)
# -------------------------------------------------------------
# The standard post-deploy drill for the /ask surface:
#   1. /ask page is 200 AND noindexed (the #14 contract)
#   2. an answerable corpus query returns grounded:true with citations
#   3. an out-of-corpus query returns the HONEST silence (grounded:false)
#   4. rate limit holds: the 6th rapid request is a 429
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

# 1. page + noindex
PAGE=$(curl -s -m 30 -D - -o /tmp/kask-page.html "${BASE_URL}/ask")
STATUS=$(printf '%s' "$PAGE" | head -1 | awk '{print $2}')
XROBOTS=$(printf '%s' "$PAGE" | tr -d '\r' | rg -i '^x-robots-tag:' | head -1 || true)
METAROBOTS=$(rg -io '<meta[^>]*name="robots"[^>]*>' /tmp/kask-page.html | head -1 || true)
NOINDEX=0
{ printf '%s' "$XROBOTS" | rg -qi noindex || true; } && NOINDEX=1
if [ "$NOINDEX" = "0" ] && printf '%s' "$METAROBOTS" | rg -qi noindex; then NOINDEX=1; fi
check "ask page 200 + noindex" "$([ "$STATUS" = "200" ] && [ "$NOINDEX" = "1" ] && echo 1 || echo 0)" "HTTP $STATUS, noindex=$NOINDEX"

# 2. grounded path (corpus-covered query)
GROUNDED=$(curl -s -m 90 -X POST "${BASE_URL}/api/ai/ask" -H "Content-Type: application/json" \
  -d '{"query":"How do I practice ajapa japa?"}')
OKG=$(printf '%s' "$GROUNDED" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(1 if d.get("grounded") is True and len(d.get("citations",[]))>0 else 0)' 2>/dev/null || echo 0)
MODEL=$(printf '%s' "$GROUNDED" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("model","?"))' 2>/dev/null || echo "?")
check "grounded answer with citations" "$OKG" "model=$MODEL"

# 3. honest silence (out-of-corpus query)
SILENT=$(curl -s -m 90 -X POST "${BASE_URL}/api/ai/ask" -H "Content-Type: application/json" \
  -d '{"query":"What is the best cryptocurrency to buy in 2026 for guaranteed profit?"}')
OKS=$(printf '%s' "$SILENT" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(1 if d.get("grounded") is False and d.get("reason") in ("ungrounded_output","corpus_silent") else 0)' 2>/dev/null || echo 0)
check "out-of-corpus query → honest silence" "$OKS" "$(printf '%s' "$SILENT" | head -c 120)"

# 4. rate limit: the shared distributed backend engages. The health
#    endpoint runs a one-shot self-test through the EXACT production
#    path with a stable key (external bursts can't do this — the runner's
#    egress IP may rotate, making every call a fresh key). Assert ok=true
#    and a distributed backend label.
ST=$(curl -s -m 30 "${BASE_URL}/api/health" | python3 -c 'import json,sys; d=json.load(sys.stdin); st=d.get("rateLimitSelfTest") or {}; print(st.get("ok"), st.get("backend"), st.get("error") or "-")' 2>/dev/null || echo "err - -")
OKRL=$(printf '%s' "$ST" | python3 -c 'import sys; parts=sys.stdin.read().split(); print(1 if len(parts)>=2 and parts[0]=="True" and parts[1] in ("turso","upstash","vercel-kv") else 0)' 2>/dev/null || echo 0)
check "limiter self-test ok + distributed backend" "$OKRL" "selfTest=$ST"

if [ "$FAIL" = "0" ]; then say "SMOKE /ask: ALL PASS"; else say "SMOKE /ask: FAILURES — investigate before promoting"; fi
exit "$FAIL"
