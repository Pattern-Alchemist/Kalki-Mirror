#!/usr/bin/env bash
# ═════════════════════════════════════════════════════════════
# KALKI — letters launch drill (Vol. 6 #12)
# -------------------------------------------------------------
# The one-command post-publish verification:
#   1. Fetch sitemap, extract all /letters/<slug> URLs
#   2. Verify each renders 200 + has a bespoke OG image (200)
#   3. Verify feed.xml has <category>Letter</category> items
#   4. Ping IndexNow with the letters URLs (targeted, not full sitemap)
#   5. Exit 0 = all pass; exit 1 = any failure (deploy suspect)
#
# This script runs AFTER the founder's publish flip (via the seeder
# or POST /api/admin/letters). It does NOT publish — the founder's
# sign-off is the gate; this is the proof the gate worked.
#
# Usage:
#   bash scripts/launch-letters.sh
#   BASE_URL=https://www.astrokalki.com bash scripts/launch-letters.sh
# Exit 0 = all pass; exit 1 = any failure.
# ═════════════════════════════════════════════════════════════
set -euo pipefail

BASE="${BASE_URL:-https://www.astrokalki.com}"
FAIL=0

say() { printf '%s\n' "$*"; }
check() { # check <name> <ok> <detail>
  if [ "$2" = "1" ]; then say "PASS  $1  — $3"; else say "FAIL  $1  — $3"; FAIL=1; fi
}

# ── 1. Fetch sitemap + extract letters URLs ─────────────────
SITEMAP=$(curl -fsS -m 30 "${BASE}/sitemap.xml" 2>/dev/null || echo "")
if [ -z "$SITEMAP" ]; then
  say "FAIL  sitemap fetch — empty response from ${BASE}/sitemap.xml"
  exit 1
fi

# Extract /letters/<slug> URLs (the slug is the last path segment)
SLUGS=$(echo "$SITEMAP" | python3 -c "
import sys, re
xml = sys.stdin.read()
urls = re.findall(r'<loc>([^<]*?/letters/[^<]+)</loc>', xml)
for u in urls:
    slug = u.rstrip('/').split('/letters/')[-1]
    if slug: print(slug)
" 2>/dev/null || echo "")

COUNT=$(echo "$SLUGS" | grep -c . 2>/dev/null || echo 0)
check "sitemap has letters URLs" "$([ "$COUNT" -gt 0 ] && echo 1 || echo 0)" "found $COUNT URL(s)"

# ── 2. Verify each letter page + OG image ─────────────────────
if [ -n "$SLUGS" ]; then
  while IFS= read -r slug; do
    [ -z "$slug" ] && continue
    # Page itself
    PAGE_STATUS=$(curl -s -m 10 -o /dev/null -w "%{http_code}" "${BASE}/letters/${slug}")
    check "letter page: ${slug}" "$([ "$PAGE_STATUS" = "200" ] && echo 1 || echo 0)" "HTTP $PAGE_STATUS"
    # OG image (bespoke card from opengraph-image.tsx)
    OG_STATUS=$(curl -s -m 10 -o /dev/null -w "%{http_code}" "${BASE}/letters/${slug}/opengraph-image")
    check "letter OG image: ${slug}" "$([ "$OG_STATUS" = "200" ] && echo 1 || echo 0)" "HTTP $OG_STATUS"
  done <<< "$SLUGS"
fi

# ── 3. Verify feed.xml has Letter items ───────────────────────
FEED_COUNT=$(curl -fsS -m 10 "${BASE}/feed.xml" 2>/dev/null | grep -c "<category>Letter</category>" || echo 0)
check "feed.xml has Letter items" "$([ "$FEED_COUNT" -gt 0 ] && echo 1 || echo 0)" "found $FEED_COUNT item(s)"

# ── 4. IndexNow ping (targeted — letters only) ─────────────────
if [ "$COUNT" -gt 0 ]; then
  say "Pinging IndexNow with $COUNT letter URL(s)..."
  # Build the URL list
  URL_LIST=""
  while IFS= read -r slug; do
    [ -z "$slug" ] && continue
    URL_LIST="${URL_LIST}\"${BASE}/letters/${slug}\","
  done <<< "$SLUGS"
  URL_LIST="[${URL_LIST%,}]"

  # POST to the server-side IndexNow route (it handles the API key + ownership proof)
  PING_RESP=$(curl -fsS -m 20 -X POST "${BASE}/api/indexnow" \
    -H "Content-Type: application/json" \
    -d "{\"urls\": ${URL_LIST}}" 2>/dev/null || echo '{"error":"ping failed"}')
  say "IndexNow: $(echo "$PING_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('accepted', d.get('error', '?')))" 2>/dev/null || echo "?")"
fi

# ── Summary ───────────────────────────────────────────────────
if [ "$FAIL" = "0" ]; then
  say ""
  say "LETTERS LAUNCH: ALL PASS — $COUNT letter(s) live, OG cards verified, feed indexed, IndexNow pinged"
else
  say ""
  say "LETTERS LAUNCH: FAILURES — investigate before broadcasting"
fi
exit "$FAIL"
