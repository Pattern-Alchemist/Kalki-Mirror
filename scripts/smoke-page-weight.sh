#!/usr/bin/env bash
# =============================================================
# KALKI — page-weight budget drill (re-materialized, Vol. 6 #2)
# -------------------------------------------------------------
# The Vol.5 #18 diet took six hubs down 55–70% — but its enforcement
# script lived sandbox-local and evaporated. This is the budget back
# as a committed drill: every hub < 250KB, every detail page < 120KB,
# measured as UNCOMPRESSED HTML (raw payload = what a cold mobile
# browser parses; compression varies by client, budgets must not).
#
#   SITE_URL   — target origin (default https://www.astrokalki.com)
#   HUB_BUDGET — hub ceiling bytes (default 256000 = 250KB)
#   DETAIL_BUDGET — detail ceiling bytes (default 122880 = 120KB)
#
# Detail URLs resolve from the LIVE sitemap (first hit per class) so
# the drill cannot drift from the map. Exit non-zero listing every
# budget breach.
# =============================================================
set -uo pipefail

BASE="${SITE_URL:-https://www.astrokalki.com}"
HUB_BUDGET="${HUB_BUDGET:-256000}"
DETAIL_BUDGET="${DETAIL_BUDGET:-122880}"
FAILS=()
CHECKED=0

HUBS=(
  / /primer /glossary /patterns /archive /library /sequences
  /archetypes /breathwork /aghori-tantra /codex /method /karma
  /research /practice /search /letters /usa /consultations /pricing
  /email-course /tantra
)
# detail classes: sitemap prefix → label
DETAIL_CLASSES=("/glossary/" "/patterns/" "/archive/" "/sequences/" "/breathwork/" "/usa/")

echo "page-weight drill: base=$BASE hub<${HUB_BUDGET}B detail<${DETAIL_BUDGET}B (uncompressed)"

# Measure the raw (identity) payload — gzip would hide the budget.
measure_raw() {
  curl -fsS -m 20 -H 'Accept-Encoding: identity' -w '%{size_download}' -o /dev/null "$1" 2>/dev/null
}

# 1. Hubs
for p in "${HUBS[@]}"; do
  CHECKED=$((CHECKED+1))
  B=$(measure_raw "$BASE$p")
  if [ -z "$B" ] || [ "$B" = "0" ]; then
    FAILS+=("hub $p — fetch failed"); printf '  [FAIL ] %-34s fetch failed\n' "$p"; continue
  fi
  if [ "$B" -gt "$HUB_BUDGET" ]; then
    FAILS+=("hub $p — ${B}B > ${HUB_BUDGET}B"); printf '  [FAIL ] %-34s %7dB  OVER\n' "$p" "$B"
  else
    printf '  [ok  ] %-34s %7dB\n' "$p" "$B"
  fi
done

# 2. Details — first live sitemap hit per class (the drill tracks the map)
SITEMAP=$(curl -fsS -m 20 "$BASE/sitemap.xml" 2>/dev/null) || SITEMAP=""
for cls in "${DETAIL_CLASSES[@]}"; do
  CHECKED=$((CHECKED+1))
  URL=$(printf '%s' "$SITEMAP" | grep -o "<loc>[^<]*</loc>" | sed 's/<[^>]*>//g' | grep "$cls" | head -1)
  if [ -z "$URL" ]; then
    FAILS+=("detail class $cls — no sitemap URL found")
    printf '  [FAIL ] %-34s no sitemap URL\n' "detail $cls"
    continue
  fi
  B=$(measure_raw "$URL")
  if [ -z "$B" ] || [ "$B" = "0" ]; then
    FAILS+=("detail $URL — fetch failed"); printf '  [FAIL ] %-34s fetch failed\n' "$URL"; continue
  fi
  if [ "$B" -gt "$DETAIL_BUDGET" ]; then
    FAILS+=("detail $URL — ${B}B > ${DETAIL_BUDGET}B")
    printf '  [FAIL ] %-34s %7dB  OVER\n' "$URL" "$B"
  else
    printf '  [ok  ] %-34s %7dB\n' "$URL" "$B"
  fi
done

echo
if [ "${#FAILS[@]}" -eq 0 ]; then
  echo "ALL PASS ($CHECKED checked) — budgets hold."
  exit 0
fi
printf 'BUDGET BREACH (%d of %d):\n' "${#FAILS[@]}" "$CHECKED"
printf '  - %s\n' "${FAILS[@]}"
exit 1
