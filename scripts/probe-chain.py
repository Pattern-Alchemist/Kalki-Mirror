#!/usr/bin/env python3
# =============================================================
# KALKI — AI chain contract-size probe (re-materialized, Vol. 6 #2)
# -------------------------------------------------------------
# The methodology that twice rebuilt the chain (2026-09-08 hotfix,
# 2026-09-09 ops-day2), now a PERMANENT, COMMITTED script:
#
#   Toy prompts lie. ling-3.0-flash-sante passed toy prompts and
#   HTTP-400'd every real-size body. So this probe fires the REAL
#   /ask contract — the actual system prompt (read from
#   src/lib/ai/ask.ts, single source of truth), six real OPEN corpus
#   chunks from the baked db/custom.db, production-size user message
#   — at EVERY model under test, with the #5 latency budget (12s).
#
# Verdict per model: contract_ok (parseable ask JSON: grounded answer
# with in-pool citations, OR honest grounded=false silence) vs breach
# (prose, truncation, unknown slug, malformed JSON, HTTP error,
# timeout). The chain is alive iff at least one model passes within
# budget — exit 0, else exit 1.
#
#   OPENROUTER_API_KEY   required (env or --key)
#   --all-free           probe every :free model OpenRouter lists
#                        (default: just the DEFAULT_MODELS chain)
#   --budget SECONDS     per-model budget (default 12)
#   --db PATH            corpus db (default db/custom.db)
# =============================================================
import argparse
import json
import os
import re
import sqlite3
import sys
import time
import urllib.request
import urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASK_TS = os.path.join(ROOT, "src", "lib", "ai", "ask.ts")
OPENROUTER_TS = os.path.join(ROOT, "src", "lib", "ai", "openrouter.ts")
POOL_SIZE = 6
PROBE_QUERY = "How should I prepare for gayatri mantra practice?"


def read_system_prompt() -> str:
    """Extract ASK_SYSTEM_PROMPT from ask.ts — the real contract, not a copy."""
    src = open(ASK_TS, encoding="utf-8").read()
    m = re.search(r"const ASK_SYSTEM_PROMPT = `(.*?)`;", src, re.S)
    if not m:
        sys.exit(f"FAIL: could not extract ASK_SYSTEM_PROMPT from {ASK_TS}")
    return m.group(1)


def read_default_chain() -> list:
    src = open(OPENROUTER_TS, encoding="utf-8").read()
    m = re.search(r"const DEFAULT_MODELS = \[(.*?)\];", src, re.S)
    if not m:
        sys.exit(f"FAIL: could not extract DEFAULT_MODELS from {OPENROUTER_TS}")
    return re.findall(r'"([^"]+)"', m.group(1))


def load_open_pool(db_path: str):
    """Six real OPEN chunks (one per distinct slug, longest text = most
    production-like size) + the citation pool (their slugs)."""
    con = sqlite3.connect(db_path)
    rows = con.execute(
        """SELECT slug, MAX(LENGTH(text)), section, caution, text
             FROM FolioChunk WHERE caution = 'OPEN'
         GROUP BY slug ORDER BY 2 DESC LIMIT ?""",
        (POOL_SIZE,),
    ).fetchall()
    con.close()
    if len(rows) < POOL_SIZE:
        sys.exit(f"FAIL: only {len(rows)} OPEN slugs in {db_path} — corpus drift")
    chunks = [
        {"slug": r[0], "section": r[2], "caution": r[3], "text": r[4]} for r in rows
    ]
    pool = sorted({c["slug"] for c in chunks})
    return chunks, pool


def build_user_message(chunks) -> str:
    """Mirrors buildAskMessages in ask.ts byte for byte."""
    corpus = "\n\n---\n\n".join(
        f"[{i + 1}] slug: {c['slug']} · section: {c['section']} · caution: {c['caution']}\n{c['text']}"
        for i, c in enumerate(chunks)
    )
    return f"Corpus chunks:\n{corpus}\n\nSeeker's question: \"{PROBE_QUERY}\"\n\nAnswer per the rules."


def parse_ask_output(text: str, pool) -> str:
    """Mirrors parseAskOutput + validateAskChainOutput strictness:
    strip fences, first { .. last }, JSON shape, citations ⊆ pool.
    Returns 'grounded' | 'honest_silence' | 'breach: <why>'."""
    t = text.strip()
    if t.startswith("```"):
        t = re.sub(r"^```[a-zA-Z]*\n?", "", t)
        t = re.sub(r"\n?```\s*$", "", t)
    start, end = t.find("{"), t.rfind("}")
    if start == -1 or end <= start:
        return "breach: no JSON object in completion"
    try:
        obj = json.loads(t[start : end + 1])
    except json.JSONDecodeError as e:
        return f"breach: invalid JSON ({e.msg})"
    if not isinstance(obj, dict):
        return "breach: not a JSON object"
    grounded = obj.get("grounded")
    answer = obj.get("answer")
    cited = obj.get("cited_folios")
    if grounded is False:
        return "honest_silence" if (answer in (None, "", [])) else "breach: grounded=false but answer non-empty"
    if grounded is not True:
        return "breach: grounded not boolean"
    if not isinstance(answer, str) or not answer.strip():
        return "breach: empty answer"
    if not isinstance(cited, list) or not cited or not all(isinstance(s, str) for s in cited):
        return "breach: cited_folios not a non-empty string list"
    unknown = [s for s in cited if s not in pool]
    if unknown:
        return f"breach: citations outside pool: {unknown}"
    return "grounded"


def probe_model(model: str, api_key: str, system_prompt: str, user_msg: str, budget: float):
    """One real-size call. Returns (verdict, detail, latency_s)."""
    body = json.dumps({
        "model": model,
        "max_tokens": 1600,  # the route's floor — the contract budget
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_msg},
        ],
    }).encode()
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://www.astrokalki.com",
            "X-Title": "KALKI chain probe",
        },
    )
    t0 = time.monotonic()
    try:
        with urllib.request.urlopen(req, timeout=budget) as resp:
            data = json.loads(resp.read().decode())
        latency = time.monotonic() - t0
        try:
            text = data["choices"][0]["message"]["content"] or ""
        except (KeyError, IndexError, TypeError):
            return "breach", "no choices[].message.content in response", latency
        if not text.strip():
            return "breach", "empty completion (hidden reasoning burn?)", latency
        verdict = parse_ask_output(text, POOL_SLUGS)
        return verdict, "", latency
    except urllib.error.HTTPError as e:
        latency = time.monotonic() - t0
        detail = ""
        try:
            detail = json.loads(e.read().decode()).get("error", {}).get("message", "")[:120]
        except Exception:
            detail = f"HTTP {e.code}"
        return f"http_error", f"HTTP {e.code}: {detail}", latency
    except Exception as e:
        return "http_error", f"{type(e).__name__}: {str(e)[:120]}", time.monotonic() - t0


def free_models(api_key: str) -> list:
    req = urllib.request.Request(
        "https://openrouter.ai/api/v1/models",
        headers={"Authorization": f"Bearer {api_key}"},
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        data = json.loads(resp.read().decode())
    return sorted(m["id"] for m in data.get("data", []) if m["id"].endswith(":free"))


POOL_SLUGS = []

def main() -> int:
    global POOL_SLUGS
    ap = argparse.ArgumentParser()
    ap.add_argument("--key", default=os.environ.get("OPENROUTER_API_KEY", ""))
    ap.add_argument("--all-free", action="store_true")
    ap.add_argument("--budget", type=float, default=12.0)
    ap.add_argument("--db", default=os.path.join(ROOT, "db", "custom.db"))
    args = ap.parse_args()
    if not args.key:
        sys.exit("FAIL: OPENROUTER_API_KEY missing (env or --key)")

    system_prompt = read_system_prompt()
    default_chain = read_default_chain()
    chunks, POOL_SLUGS = load_open_pool(args.db)
    user_msg = build_user_message(chunks)
    models = free_models(args.key) if args.all_free else default_chain
    total_kb = len(user_msg) / 1024
    print(f"contract-size probe: {len(models)} model(s) · prompt {total_kb:.1f}KB · "
          f"pool {POOL_SLUGS} · budget {args.budget}s\n")

    alive = 0
    for model in models:
        verdict, detail, latency = probe_model(model, args.key, system_prompt, user_msg, args.budget)
        ok = verdict in ("grounded", "honest_silence")
        over = latency > args.budget
        flag = "PASS" if ok and not over else "OVER-BUDGET" if ok else "FAIL"
        if ok and not over:
            alive += 1
        line = f"[{flag:>11}] {model}  {latency:6.1f}s  {verdict}"
        if detail:
            line += f"  ({detail})"
        print(line)

    print(f"\nchain alive models (contract_ok within budget): {alive}/{len(models)}")
    if alive == 0:
        print("CHAIN DEAD at contract size — rebuild on survivors (see worklog hotfix-ai-chain).")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
