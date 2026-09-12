#!/usr/bin/env python3
# =============================================================
# KALKI — production sweep (re-materialized + permanent, Vol. 6 #4)
# -------------------------------------------------------------
# The 54-check production truth sweep ran twice (Vol. 5 enlistment)
# and then evaporated with its sandbox. This is the sweep as a
# COMMITTED script, generalized from its documented checks, so the
# quarterly full sweep is a button and the weekly cadence is a cron:
#
#   python3 scripts/production-sweep.py                # human table
#   python3 scripts/production-sweep.py --json         # machine verdict
#   python3 scripts/production-sweep.py --report URL   # POST verdict
#
# Checks (SITE_URL, default production):
#   core pages 200 · /ask noindexed · soft-404 noindex posture ·
#   sitemap canonical shape (total bounded, /ask ABSENT, letters hub
#   present) · robots/RSS/JSON-Feed/llms.txt green · cron + admin
#   gates 401 · JSON-LD parseable on home · health green.
#
# Exit non-zero with the failure list; --report posts a drill verdict
# (name production-sweep) to /api/cron/drill-status when CRON_SECRET
# is set, so the digest staleness alarm covers a sweep that dies.
# =============================================================
import argparse
import json
import os
import re
import sys
import urllib.request
import urllib.error

SITE = os.environ.get("SITE_URL", "https://www.astrokalki.com").rstrip("/")

CORE_PAGES = [
    "/", "/primer", "/method", "/codex", "/karma", "/research", "/practice",
    "/library", "/glossary", "/patterns", "/archive", "/sequences",
    "/archetypes", "/breathwork", "/aghori-tantra", "/tantra", "/letters",
    "/search", "/consultations", "/pricing", "/email-course", "/redeem",
    "/usa", "/usa/austin", "/usa/new-york", "/usa/san-francisco-bay",
    "/usa/london",
]

CRON_ROUTES = [
    "/api/indexnow", "/api/cron/cred-audit", "/api/cron/chain-health",
    "/api/cron/prewarm-ask", "/api/cron/testimonial-followup",
    "/api/cron/course-send", "/api/cron/daily-digest",
    "/api/cron/gsc-indexing", "/api/cron/cleanup",
]
ADMIN_ROUTES = ["/api/admin/stats", "/api/admin/warroom", "/api/admin/audit-logs"]
BOGUS_SLUGS = ["/archive/definitely-not-a-folio-xyz", "/glossary/not-a-term-xyz"]

results = []


def fetch(path, timeout=25):
    req = urllib.request.Request(f"{SITE}{path}", headers={"User-Agent": "kalki-production-sweep"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, dict(r.headers), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers), ""
    except Exception as e:
        return None, {}, f"{type(e).__name__}: {e}"


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))


def sweep():
    # 1. Health first — a red health makes everything else noise.
    code, _, body = fetch("/api/health")
    health_ok = code == 200
    db_ok = corpus = None
    if health_ok:
        try:
            h = json.loads(body)
            db_ok = h.get("database", {}).get("status")
            corpus = h.get("corpus", {}).get("total")
            health_ok = h.get("status") == "ok" and db_ok == "ok"
        except Exception:
            health_ok = False
    check("health: status ok + db ok", health_ok, f"corpus={corpus} db={db_ok}")

    # 2. Core pages 200.
    fails = []
    for p in CORE_PAGES:
        c, _, _ = fetch(p)
        if c != 200:
            fails.append(f"{p}={c}")
    check(f"core pages 200 ({len(CORE_PAGES)})", not fails, ", ".join(fails) or "all 200")

    # 3. /ask noindexed by design.
    code, headers, body = fetch("/ask")
    ni = "noindex" in body or "noindex" in headers.get("x-robots-tag", "")
    check("/ask noindexed", code == 200 and ni, f"code={code}")

    # 4. Soft-404 posture: bogus slugs must NOT render as indexable 200s.
    soft = []
    for p in BOGUS_SLUGS:
        c, h, b = fetch(p)
        if c == 200 and "noindex" not in b and "noindex" not in h.get("x-robots-tag", ""):
            soft.append(p)
        elif c not in (200, 404, 410):
            soft.append(f"{p}={c}")
    check("soft-404 noindex posture", not soft, ", ".join(soft) or "bogus slugs honest")

    # 5. Sitemap canonical shape.
    code, _, sm = fetch("/sitemap.xml")
    urls = re.findall(r"<loc>([^<]*)</loc>", sm) if code == 200 else []
    ask_in_map = any(u.rstrip("/").endswith("/ask") for u in urls)
    letters_present = any("/letters" in u for u in urls)
    check(
        "sitemap canonical shape",
        code == 200 and 250 <= len(urls) <= 400 and not ask_in_map and letters_present,
        f"urls={len(urls)} ask_absent={not ask_in_map} letters={letters_present}",
    )

    # 6. Discovery surfaces: robots, RSS, JSON Feed, llms.txt.
    for path, must_contain in [
        ("/robots.txt", "sitemap"),
        ("/feed.xml", "<rss"),
        ("/feed.json", "jsonfeed"),
        ("/llms.txt", None),
    ]:
        c, _, b = fetch(path)
        ok = c == 200 and (must_contain is None or must_contain in b.lower())
        check(f"{path} green", ok, f"code={c}")

    # 7. Cron + admin gates: every one must 401 without a secret.
    gates = []
    for p in CRON_ROUTES + ADMIN_ROUTES:
        c, _, _ = fetch(p)
        if c != 401:
            gates.append(f"{p}={c}")
    check(f"cron+admin gates 401 ({len(CRON_ROUTES) + len(ADMIN_ROUTES)})", not gates, ", ".join(gates) or "all 401")

    # 8. JSON-LD parseable on the homepage.
    code, _, home = fetch("/")
    lds = re.findall(r'<script type="application/ld\+json">(.*?)</script>', home, re.S)
    bad = 0
    for block in lds:
        try:
            json.loads(block)
        except Exception:
            bad += 1
    check("home JSON-LD parseable", code == 200 and len(lds) > 0 and bad == 0, f"blocks={len(lds)} bad={bad}")


def report_verdict(passed: bool, summary: str):
    secret = os.environ.get("CRON_SECRET")
    if not secret:
        print("--report: CRON_SECRET not set, verdict stays local (digest staleness still covers silence)")
        return
    body = json.dumps({
        "name": "production-sweep",
        "verdict": "pass" if passed else "fail",
        "source": "local",
        "details": summary[:300],
    }).encode()
    req = urllib.request.Request(
        f"{SITE}/api/cron/drill-status", data=body,
        headers={"Authorization": f"Bearer {secret}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            print(f"--report: verdict posted ({r.status})")
    except Exception as e:
        print(f"--report: POST failed (non-fatal): {e}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--report", action="store_true", help="POST verdict to /api/cron/drill-status")
    args = ap.parse_args()

    sweep()
    failed = [(n, d) for n, ok, d in results if not ok]
    passed = len(results) - len(failed)

    if args.json:
        print(json.dumps({
            "site": SITE,
            "passed": passed, "failed": len(failed), "total": len(results),
            "failures": [{"name": n, "detail": d} for n, d in failed],
        }, indent=1))
    else:
        for n, ok, d in results:
            print(f"  [{'PASS' if ok else 'FAIL'}] {n}  {d}")
        print(f"\nproduction sweep: {passed}/{len(results)} PASS")

    if args.report:
        summary = f"{passed}/{len(results)} checks" + (f"; failing: {'; '.join(n for n, _ in failed)[:200]}" if failed else "")
        report_verdict(len(failed) == 0, summary)

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
