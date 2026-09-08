/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — /ask cache pre-warm query set (Vol. 5 #5)
   ---------------------------------------------------------------------------
   The ask-cache (Vol. 4 #14) makes a repeated (query · retrieved folio set)
   pair free — but only AFTER the first seeker has paid the cold LLM cost.
   The pre-warm cron (/api/cron/prewarm-ask) walks this list through the
   EXACT ask path (retrieval → silence gate → LLM → strict parse → storeAsk)
   so the ten highest-value corpus questions are warm before any seeker
   arrives, and the post-deploy smoke's latency budget holds by construction.

   Curation rules (deliberate):
     · Exactly ten — the cron's worst-case wall time is 10 × 12s chain
       budget + retrieval overhead, and the list must stay readable.
     · Every query must be answerable FROM the corpus (retrieval above the
       silence floor) — the cron reports a corpus_silent item honestly
       instead of forcing it, and the live dryRun proves coverage.
     · Coverage spans the corpus's load-bearing surfaces: the flagship
       practices (ajapa, pranava, soham), the mechanics seekers actually
       ask about (consistency, distraction, breath), and the bridge
       between practice and pattern (the corpus's own framing).
   ═══════════════════════════════════════════════════════════════════════════ */

export const PREWARM_QUERIES: readonly string[] = [
  "How do I practice ajapa japa?",
  "What is pranava japa and how does it work?",
  "How do I practice soham dhyana?",
  "What is the right way to begin mantra repetition?",
  "How does breath counting steady the mind?",
  "What is the role of the guru in sadhana?",
  "How do I keep a daily practice consistent?",
  "How do I work with distraction during japa?",
  "What is the difference between japa and dhyana?",
  "What does the corpus say about the breath before meditation?",
] as const;
