# content/folios — new corpus folios pending bake (Vol. 5 #7)

One JSON file per folio. `bash scripts/bake-corpus.sh` validates, ingests
into `db/custom.db`, bakes embeddings, regenerates `src/lib/rag/idf-generated.ts`,
asserts CORPUS_SIZE, runs the corpus gates and prints the commit banner.
Idempotent: a slug already baked is skipped (`--replace` re-bakes it).

```json
{
  "slug": "my-new-folio",              // lowercase-kebab, unique in the corpus
  "archetype": "bagalamukhi",          // optional — links an archetype id
  "caution": "OPEN",                   // OPEN | MODERATE | HIGH | SEALED
  "sections": [                        // one chunk per section (>= 40 chars each)
    { "section": "summary",   "text": "What the practice is, stated plainly." },
    { "section": "benefits",  "text": "What it reliably does for attention." },
    { "section": "warnings",  "text": "Where it bites and who should wait." }
  ]
}
```

Sections: summary · benefits · warnings · mantra · lineage · bibliography
(the FolioChunk.section enum). Commit the folio JSON together with the baked
`db/custom.db` + regenerated `idf-generated.ts` — the corpus, its IDF map and
its source JSON move as one unit.
