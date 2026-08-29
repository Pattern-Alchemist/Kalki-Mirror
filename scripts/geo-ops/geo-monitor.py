#!/usr/bin/env python3
"""
KALKI geo-monitor — the self-checking machine (Dossier No. 03, Part VI).

Eleven core checks plus the Search Console readiness layer
(hreflang, GSC verification, sitemap lastmod quality) against the
live public surface. Python standard library only; no credentials
required. Exit code 1 if any check FAILs.

Usage:
    GEO_TARGET=https://www.astrokalki.com python3 geo-monitor.py
    GEO_TARGET=https://<preview-url>.vercel.app python3 geo-monitor.py

Writes a dated JSON record to logs/ (created next to this file) so the
scoreboard is diffable across the life of the platform.
"""

import datetime
import json
import os
import re
import sys
import urllib.request

BASE = os.environ.get("GEO_TARGET", "https://www.astrokalki.com").rstrip("/")
AI_CRAWLERS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "PerplexityBot",
               "Google-Extended", "Applebot-Extended", "CCBot", "Meta-ExternalAgent"]
CANONICAL_FOLIOS = 56
CANONICAL_PATTERNS = 20

results = []


def fetch(url, timeout=20):
    req = urllib.request.Request(url, headers={"User-Agent": "kalki-geo-monitor/1.0"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return resp.status, resp.read().decode("utf-8", "replace"), dict(resp.headers)


def record(name, status, detail):
    results.append({"check": name, "status": status, "detail": detail})
    mark = {"PASS": "[PASS]", "WARN": "[WARN]", "FAIL": "[FAIL]"}[status]
    print(f"{mark} {name}: {detail}")


def check(name):
    """Register a check; runs it (exception-safe) when invoked from main()."""
    def decorator(fn):
        def wrapper():
            try:
                fn()
            except Exception as exc:  # noqa: BLE001 — a probe crash is itself a finding
                record(name, "FAIL", f"probe error: {exc}")
        wrapper.check_name = name
        return wrapper
    return decorator


@check("homepage_health")
def homepage_health():
    started = datetime.datetime.now()
    status, body, _ = fetch(BASE + "/")
    elapsed = (datetime.datetime.now() - started).total_seconds()
    if status != 200:
        record("homepage_health", "FAIL", f"HTTP {status}")
        return
    if len(body) < 5000:
        record("homepage_health", "WARN", f"200 but suspiciously thin body ({len(body)} bytes)")
        return
    level = "PASS" if elapsed < 5 else "WARN"
    record("homepage_health", level, f"200 in {elapsed:.2f}s, {len(body)} bytes")


@check("llms_txt")
def llms_txt():
    status, body, headers = fetch(BASE + "/llms.txt")
    ctype = ""
    for key, value in headers.items():
        if key.lower() == "content-type":
            ctype = value
            break
    if status != 200:
        record("llms_txt", "FAIL", f"HTTP {status} — the machine surface is down")
        return
    problems = []
    if "text/plain" not in ctype:
        problems.append(f"content-type is {ctype!r}, expected text/plain")
    if "KALKI" not in body:
        problems.append("body does not mention KALKI")
    link_count = len(re.findall(r"\]\(https?://", body))
    if link_count < 100:
        problems.append(f"only {link_count} links (expected ~110)")
    if problems:
        record("llms_txt", "WARN", "; ".join(problems) + f" ({link_count} links)")
    else:
        record("llms_txt", "PASS", f"200, text/plain, {link_count} curated links")


@check("robots_ai_policy")
def robots_ai_policy():
    status, body, _ = fetch(BASE + "/robots.txt")
    if status != 200:
        record("robots_ai_policy", "FAIL", f"robots.txt HTTP {status}")
        return
    named = [bot for bot in AI_CRAWLERS if bot in body]
    private_blocked = all(p in body for p in ("/admin", "/api", "/dossier"))
    if len(named) >= 5 and private_blocked:
        record("robots_ai_policy", "PASS", f"{len(named)} AI crawlers welcomed by name; private surfaces disallowed")
    elif len(named) >= 3:
        record("robots_ai_policy", "WARN", f"only {len(named)} AI crawlers named")
    else:
        record("robots_ai_policy", "FAIL", f"no AI-crawler policy ({len(named)} named)")


@check("apex_redirect")
def apex_redirect():
    apex = BASE.replace("https://www.", "https://")
    if apex == BASE:
        record("apex_redirect", "PASS", "target is already the apex-canonical host (monitor pointed at non-www)")
        return
    req = urllib.request.Request(apex, method="HEAD",
                                 headers={"User-Agent": "kalki-geo-monitor/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            final = resp.geturl()
    except urllib.error.HTTPError as exc:
        final = exc.geturl() if hasattr(exc, "geturl") else ""
    if final.startswith(BASE):
        record("apex_redirect", "PASS", f"apex resolves to www ({final})")
    else:
        record("apex_redirect", "WARN", f"apex resolves to {final!r}, expected {BASE}")


@check("count_drift")
def count_drift():
    _, body, _ = fetch(BASE + "/")
    m = re.search(r'<meta name="description" content="([^"]*)"', body)
    desc = m.group(1) if m else ""
    if f"{CANONICAL_FOLIOS} siddhi" in desc and f"{CANONICAL_PATTERNS} emotional" in desc:
        record("count_drift", "PASS", f"homepage description carries canonical {CANONICAL_FOLIOS}/{CANONICAL_PATTERNS}")
    elif "48 siddhis" in desc or "12 emotional" in desc:
        record("count_drift", "FAIL", f"drift live in description: {desc[:120]!r}")
    else:
        record("count_drift", "WARN", f"counts not found verbatim in description: {desc[:120]!r}")


@check("title_template")
def title_template():
    _, body, _ = fetch(BASE + "/")
    m = re.search(r"<title>([^<]*)</title>", body)
    title = m.group(1) if m else ""
    if re.search(r"KALKI.*\|\s*KALKI\s*$", title):
        record("title_template", "FAIL", f"double suffix in title: {title!r}")
    elif title:
        record("title_template", "PASS", f"title clean: {title!r}")
    else:
        record("title_template", "FAIL", "no <title> found")


@check("folio_count")
def folio_count():
    _, body, _ = fetch(BASE + "/archive")
    slugs = set(re.findall(r'href="/archive/([^"/?#]+)"', body))
    has_count = f"of {CANONICAL_FOLIOS}" in body or f"{CANONICAL_FOLIOS}" in body
    if len(slugs) >= CANONICAL_FOLIOS * 0.2 and has_count:
        record("folio_count", "PASS", f"archive shows {len(slugs)} folio links; canonical {CANONICAL_FOLIOS} referenced")
    elif has_count:
        record("folio_count", "WARN", f"canonical count present but only {len(slugs)} links rendered")
    else:
        record("folio_count", "FAIL", f"archive shows {len(slugs)} links, canonical count missing")


@check("pattern_count")
def pattern_count():
    _, body, _ = fetch(BASE + "/patterns")
    slugs = set(re.findall(r'href="/patterns/([^"/?#]+)"', body))
    if len(slugs) >= CANONICAL_PATTERNS * 0.5:
        record("pattern_count", "PASS", f"{len(slugs)} pattern links rendered (canonical {CANONICAL_PATTERNS})")
    else:
        record("pattern_count", "WARN", f"only {len(slugs)} pattern links rendered (canonical {CANONICAL_PATTERNS})")


def _jsonld_blocks(html):
    return re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', html, re.S)


@check("jsonld_website_single")
def jsonld_website_single():
    _, body, _ = fetch(BASE + "/")
    blocks = _jsonld_blocks(body)
    website_nodes = 0
    for block in blocks:
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        nodes = data.get("@graph", [data]) if isinstance(data, dict) else data
        if not isinstance(nodes, list):
            nodes = [nodes]
        website_nodes += sum(1 for n in nodes
                             if isinstance(n, dict) and n.get("@type") in ("WebSite", "WebSite"))
    if website_nodes == 1:
        record("jsonld_website_single", "PASS", "exactly one WebSite node on homepage")
    elif website_nodes == 0:
        record("jsonld_website_single", "FAIL", "no WebSite node found — entity identity missing")
    else:
        record("jsonld_website_single", "FAIL", f"{website_nodes} competing WebSite nodes")


@check("person_entity")
def person_entity():
    _, body, _ = fetch(BASE + "/")
    blocks = _jsonld_blocks(body)
    person_ok = False
    for block in blocks:
        try:
            data = json.loads(block)
        except json.JSONDecodeError:
            continue
        nodes = data.get("@graph", [data]) if isinstance(data, dict) else data
        if not isinstance(nodes, list):
            nodes = [nodes]
        for n in nodes:
            if isinstance(n, dict) and n.get("@type") == "Person":
                if n.get("sameAs"):
                    person_ok = True
    if person_ok:
        record("person_entity", "PASS", "Person node present with sameAs cross-references")
    else:
        record("person_entity", "FAIL", "no Person node with sameAs — entity layer incomplete")


@check("sitemap_size")
def sitemap_size():
    _, body, _ = fetch(BASE + "/sitemap.xml")
    urls = re.findall(r"<loc>([^<]+)</loc>", body)
    if len(urls) >= 100:
        record("sitemap_size", "PASS", f"{len(urls)} URLs in sitemap")
    elif len(urls) >= 80:
        record("sitemap_size", "WARN", f"sitemap shrank to {len(urls)} URLs")
    else:
        record("sitemap_size", "FAIL", f"sitemap collapsed to {len(urls)} URLs")


@check("hreflang_us")
def hreflang_us():
    """US targeting layer: every indexable page must declare
    hreflang en-US + x-default (self-referencing). Checked on the
    homepage and one representative deep page."""
    problems = []
    for path in ("/", "/patterns"):
        _, body, _ = fetch(BASE + path)
        # HTML attributes are ASCII case-insensitive; Next.js renders
        # the camelCase form (hrefLang). Match both.
        alternates = re.findall(
            r'<link[^>]*rel="alternate"[^>]*>', body, re.I)
        hreflangs = " ".join(alternates).lower()
        has_us = 'hreflang="en-us"' in hreflangs
        has_default = 'hreflang="x-default"' in hreflangs
        if not (has_us and has_default):
            problems.append(f"{path or '/'}: en-US={has_us}, x-default={has_default}")
    if problems:
        record("hreflang_us", "FAIL", "; ".join(problems) +
               " — US routing signal lost")
    else:
        record("hreflang_us", "PASS", "en-US + x-default on / and /patterns")


@check("gsc_verification")
def gsc_verification():
    """Search Console ownership verification readiness.
    GSC_VERIFY_METHOD=dns  -> PASS (Domain property via DNS TXT; the
                               HTML-file check is moot by design)
    GSC_VERIFICATION_TOKEN -> fetch /google<token>.html and require
                               the exact verification body
    neither set            -> WARN (site not yet claimed in GSC)"""
    method = os.environ.get("GSC_VERIFY_METHOD", "").strip().lower()
    token = os.environ.get("GSC_VERIFICATION_TOKEN", "").strip()
    if method == "dns":
        record("gsc_verification", "PASS",
               "DNS TXT method declared — HTML-file check skipped by design")
        return
    if not token:
        record("gsc_verification", "WARN",
               "not claimed yet — verify in GSC and set GSC_VERIFY_METHOD=dns "
               "or GSC_VERIFICATION_TOKEN (docs/geo/search-console-us-targeting.md)")
        return
    path = f"/google{token}.html"
    try:
        status, body, _ = fetch(BASE + path)
    except Exception as exc:  # noqa: BLE001
        record("gsc_verification", "FAIL", f"{path}: probe error {exc}")
        return
    expected = f"google-site-verification: google{token}.html"
    if status == 200 and expected in body:
        record("gsc_verification", "PASS", f"{path} serves the verification body")
    else:
        record("gsc_verification", "FAIL",
               f"{path}: HTTP {status}, body does not contain {expected!r}")


@check("sitemap_lastmod")
def sitemap_lastmod():
    """lastmod quality for Search Console: dates must be stable
    content dates, not per-build timestamps. Uniform dates in the
    last 24h usually mean new Date() crept back in (or a legitimate
    SITE_LASTMOD bump today — recheck tomorrow); future dates are
    always wrong."""
    _, body, _ = fetch(BASE + "/sitemap.xml")
    entries = re.findall(r"<url>(.*?)</url>", body, re.S)
    if not entries:
        record("sitemap_lastmod", "FAIL", "no <url> entries in sitemap")
        return
    missing = sum(1 for e in entries if "<lastmod>" not in e)
    dates = re.findall(r"<lastmod>([^<]+)</lastmod>", body)
    now = datetime.datetime.now(datetime.timezone.utc)
    future = []
    fresh = []
    for d in dates:
        try:
            dt = datetime.datetime.fromisoformat(d.replace("Z", "+00:00"))
        except ValueError:
            continue
        if dt > now:
            future.append(d)
        elif (now - dt).total_seconds() < 24 * 3600:
            fresh.append(d)
    problems = []
    if missing:
        problems.append(f"{missing}/{len(entries)} URLs missing lastmod")
    if future:
        problems.append(f"{len(future)} future dates")
    if problems:
        record("sitemap_lastmod", "FAIL", "; ".join(problems))
    elif fresh and dates and len(fresh) == len(dates):
        record("sitemap_lastmod", "WARN",
               "all lastmod dates within 24h — SITE_LASTMOD bumped today "
               "(legitimate) or per-build timestamps returned (defect)")
    elif fresh:
        record("sitemap_lastmod", "WARN", f"{len(fresh)} of {len(dates)} dates within 24h")
    else:
        sample = dates[0][:10] if dates else "?"
        record("sitemap_lastmod", "PASS",
               f"{len(dates)} stable lastmod dates (e.g. {sample})")


def main():
    print(f"KALKI geo-monitor — {datetime.datetime.now(datetime.timezone.utc).isoformat()}")
    print(f"target: {BASE}\n")
    homepage_health()
    llms_txt()
    robots_ai_policy()
    apex_redirect()
    count_drift()
    title_template()
    folio_count()
    pattern_count()
    jsonld_website_single()
    person_entity()
    sitemap_size()
    hreflang_us()
    gsc_verification()
    sitemap_lastmod()

    passed = sum(1 for r in results if r["status"] == "PASS")
    warned = sum(1 for r in results if r["status"] == "WARN")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    print(f"\nsummary: {passed} pass · {warned} warn · {failed} fail "
          f"({len(results)} checks)")

    log_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "logs")
    os.makedirs(log_dir, exist_ok=True)
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H%M%SZ")
    record_path = os.path.join(log_dir, f"geo-{stamp}.json")
    with open(record_path, "w", encoding="utf-8") as fh:
        json.dump({"timestamp": stamp, "target": BASE, "results": results,
                   "summary": {"pass": passed, "warn": warned, "fail": failed}},
                  fh, indent=2)
    print(f"log: {record_path}")

    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
