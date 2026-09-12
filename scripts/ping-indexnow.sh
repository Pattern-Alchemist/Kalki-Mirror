#!/usr/bin/env bash
# =============================================================
# KALKI — direct IndexNow ping (re-materialized, Vol. 6 #2)
# -------------------------------------------------------------
# The local half of the IndexNow protocol: fetch the live sitemap,
# submit every URL to the shared IndexNow endpoint in one batch.
# The server-side half is /api/indexnow (cron + ?key= open relay
# with the same key). Ownership proof: the key is PUBLIC by design
# and served at /<key>.txt — this script verifies that proof BEFORE
# submitting, so a drifted key fails loud instead of silently
# no-op'ing.
#
#   SITE_URL      — target origin (default https://www.astrokalki.com)
#   INDEXNOW_KEY  — protocol key (default: the committed public key)
#
# Exit 0 only if the endpoint accepted the batch (HTTP 2xx).
# =============================================================
set -euo pipefail

BASE="${SITE_URL:-https://www.astrokalki.com}"
KEY="${INDEXNOW_KEY:-82b322319a121d16e788612d3fbb1e79}"
HOST="$(printf '%s' "$BASE" | sed -E 's#^https?://##; s#/.*$##')"

echo "ping-indexnow: base=$BASE key=${KEY:0:8}… host=$HOST"

# 1. Ownership proof must be reachable — the protocol's own gate.
PROOF=$(curl -fsS -o /dev/null -w '%{http_code}' -m 15 "$BASE/$KEY.txt")
if [ "$PROOF" != "200" ]; then
  echo "FAIL: ownership proof $BASE/$KEY.txt returned $PROOF — key drift; refusing to submit." >&2
  exit 1
fi
echo "ownership proof: 200"

# 2. Fetch the live sitemap and extract the URL list.
URLS=$(curl -fsS -m 30 "$BASE/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | sed 's/<[^>]*>//g')
COUNT=$(printf '%s\n' "$URLS" | grep -c . || true)
if [ "${COUNT:-0}" -eq 0 ]; then
  echo "FAIL: sitemap yielded zero URLs — refusing to submit an empty batch." >&2
  exit 1
fi
echo "sitemap URLs: $COUNT"

# 3. Submit one batch (IndexNow caps at 10k URLs per request; the census
#    keeps the map bounded far below that — assert it).
if [ "$COUNT" -gt 10000 ]; then
  echo "FAIL: $COUNT URLs exceed the 10k single-batch cap — the sitemap census should have caught this." >&2
  exit 1
fi

BODY=$(printf '%s\n' "$URLS" | INDEXNOW_HOST="$HOST" INDEXNOW_KEY="$KEY" python3 -c "
import json, sys, os
urls = [u.strip() for u in sys.stdin if u.strip()]
print(json.dumps({'host': os.environ['INDEXNOW_HOST'], 'key': os.environ['INDEXNOW_KEY'], 'urlList': urls}))
")

# 4. Submit.
CODE=$(curl -fsS -o /tmp/indexnow-resp.txt -w '%{http_code}' -m 30 \
  -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "$BODY") || CODE="curl_error"

if [ "$CODE" = "200" ] || [ "$CODE" = "202" ]; then
  echo "OK: IndexNow accepted the batch ($COUNT URLs, HTTP $CODE)."
  exit 0
fi
echo "FAIL: IndexNow returned $CODE: $(cat /tmp/indexnow-resp.txt 2>/dev/null || echo '?')" >&2
exit 1
