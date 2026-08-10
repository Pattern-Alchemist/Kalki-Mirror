---
Task ID: 2
Agent: Main
Task: Persistence split — static corpus DB + Turso-ready dynamic DB

Work Log:
- Identified critical production blocker: Vercel serverless filesystem is read-only; SQLite writes (User, Streaks, Keys) evaporate between invocations
- Installed @prisma/adapter-libsql + @libsql/client for Turso connection
- Created src/lib/static-db.ts: cold-start loader that copies baked db/custom.db to /tmp/kalki-corpus.db on Vercel, PrismaClient singleton for read-only FolioChunk queries, getCorpusStats() health check
- Refactored src/lib/db.ts: createPrismaClient() factory that routes to Turso via PrismaLibSql adapter when TURSO_DATABASE_URL + TURSO_AUTH_TOKEN are set, falls back to local SQLite in dev
- Re-pointed src/lib/rag/retrieval.ts from `db` to `staticDb` — all FolioChunk reads now go through the baked corpus client
- Fixed /api/keys/route.ts and /api/keys/redeem/route.ts: replaced inline `new PrismaClient()` with shared `db` singleton from @/lib/db
- Updated .env with TURSO_DATABASE_URL/TURSO_AUTH_TOKEN placeholders
- Updated prisma/schema.prisma header with full persistence split documentation
- Verified: 279 FolioChunks read correctly through staticDb, two-pool retrieval works (prescription=4, citation=4), /api/initiate returns 200 in 252ms with grounded dossier (7 folio blocks, method=grounded)

Stage Summary:
- Architecture: static corpus (baked SQLite, 279 chunks, read-only) + dynamic runtime (Turso/libSQL for production, local SQLite for dev)
- New files: src/lib/static-db.ts
- Modified files: src/lib/db.ts, src/lib/rag/retrieval.ts, src/app/api/keys/route.ts, src/app/api/keys/redeem/route.ts, prisma/schema.prisma, .env
- No migration needed for Turso: set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN in Vercel env vars and prisma db push
- Next: Day 4 Dossier UI, then Days 5-6 Pulse (needs Turso live for streak writes)

---
Task ID: 1
Agent: Main
Task: Ingest Tantra archive (Horizon 5 — The Archive) and build archetype taxonomy

Work Log:
- Examined Tantra_compress.zip (41 PDFs) and Images_tantra.zip (53 JPEGs) from /home/z/my-project/upload/
- Extracted Images_tantra.zip to /tmp, selected 23 best resonating images by resolution and thematic match
- Copied images to /public/assets/tantra/archetypes/ — one per Mahāvidyā + supplementary archetype + vault/sealed imagery
- Created /src/lib/data/archetypes.ts — 16 archetypes (10 Mahāvidyās + 6 supplementary), each with pattern taxonomy, bija, caution level, tier access, connected siddhis and patterns
- Created /src/lib/data/siddhis-supplementary.ts — 7 new siddhis from Tantra_compress.zip PDFs (Nyāsa, Personalized Bīja, 5 Rare Breath, Agni Māraṇa, Stambhana-Māraṇa, Vīrudha-Āhāra Māraṇa, Nimbu Mantra)
- Extended Siddhi type with cautionLevel, subcategory, archetypeId fields
- Wired supplementary siddhis into allSiddhis (now 48 total)
- Created CautionBadge component (OPEN/MODERATE/HIGH/SEALED with Cinnabar for HIGH)
- Created AcknowledgmentGate modal (friction-as-reverence for HIGH/SEALED, vault icon, crimson styling)
- Rebuilt /archive page as reading-room ledger: caution-level badges, tier filters, archetype category filters, Museum Minimalism, Mahāvidyā teaser grid at bottom
- Rebuilt /archive/[slug] folio page: archetype classification section, CautionBadge in header, AcknowledgmentGate wrapping HIGH/SEALED content, no CTA on SEALED, archetype-linked patterns
- Created /archetypes page: interactive 2-column Mahāvidyā cards with images, expandable detail panels showing description + bija + connected folios + mirror method patterns, supplementary archetypes grid
- Created /api/initiate route: chains transits → pattern-match → archetype classification → prescribed sādhana → returns single Dossier JSON
- Added Archetypes link to SacredNav and SacredFooter
- Wired patterns/[slug] to show Mahāvidyā archetype classification card
- Build passes clean: 21 routes, 0 errors

Stage Summary:
- 48 siddhis now in the archive (was 41), 7 new from Tantra_compress.zip
- 16 archetypes (10 Mahāvidyās + 6 supplementary) as YANTRA's pattern taxonomy
- 23 archetype-specific images in /public/assets/tantra/archetypes/
- Safety layer: AcknowledgmentGate on HIGH/SEALED, no CTA on SEALED, YANTRA constrained to OPEN-tier sādhana only in /api/initiate
- Brand promise 'Where Forbidden Knowledge Meets Pattern Intelligence' is now architectural
---
Task ID: 0
Agent: main
Task: Step 0 — Vercel deploy hardening (nft include, runtime guards, health endpoint, getCautionLevel fix, Pulse schema)

Work Log:
- Added outputFileTracingIncludes to next.config.ts forcing db/**/* into all /api/** bundles (Gotcha 1 fix)
- Added export const runtime = 'nodejs' to /api/initiate, /api/yantra, /api/health (Gotcha 2 fix)
- Created /api/health/route.ts — GET endpoint exposing getCorpusStats(), returns status ok/degraded/critical
- Extracted getCautionLevel() from CautionBadge.tsx ('use client') to @/lib/data/types.ts — this was causing 500 on /api/initiate in Next.js 16
- CautionBadge.tsx now re-exports getCautionLevel for backward compat
- Added latitude, longitude, timezone, lastTransmissionDate fields to User model in schema.prisma (Pulse prep)
- Full smoke-test passed: health=279 chunks (OPEN:42, MODERATE:71, HIGH:96, SEALED:70), initiate=200 grounded 4+4 pools 5 folio blocks

Stage Summary:
- next.config.ts: outputFileTracingIncludes added
- /api/health: new route, returns corpus stats + timing + environment
- /api/initiate: runtime=nodejs, getCautionLevel import fixed (was importing from 'use client' component)
- /api/yantra: runtime=nodejs added
- prisma/schema.prisma: User model extended with 4 Pulse fields
- Build: clean, 0 errors, 0 warnings
- Local smoke-test: all 5 checklist items pass
---
Task ID: 1
Agent: main
Task: Apply hero image to homepage from 6 uploaded candidates

Work Log:
- VLM-analyzed all 6 images across 5 axes: composition, color harmony, text-overlay suitability, mobile crop, authenticity
- Selected Runes_hovering_above_ancient_manuscript (45/50) — perfect palette match (Akasha void, Gold runes, Cinnabar embers, Bhasma parchment)
- Copied to public/assets/tantra/hero-runes-manuscript.jpeg (2752x1536, 542KB)
- Updated page.tsx Chamber I hero: swapped src, updated alt text
- Build: clean, 0 errors

Stage Summary:
- Hero image: /assets/tantra/hero-runes-manuscript.jpeg
- All CinematicImage effects preserved (kenBurns slow, full scrim, vignette, volumetric, dust)
- Mobile: object-cover centers on manuscript/altar in portrait crop
---
Task ID: 1
Agent: main
Task: Hero video background, pulsating glow, section image swaps, pricing clarity

Work Log:
- Identified 6 uploaded files: 1 MP4 (hero video), 4 new images, 2 reference screenshots
- Uploaded 5 assets to Cloudinary: hero-kalki-avatar-riding (video), nadi-shuddhi-channel, translucent-figure-silhouettes, copper-trident-courtyard, ancient-temple-midnight
- Hero: Replaced CinematicImage with <video> element, poster fallback to old hero still, dark scrim layer above video below text
- Hero: Restructured text to 2 lines only (KALKI + ESOTERIC INTELLIGENCE), removed eyebrow/tagline/Light for Dark Age
- Hero: Added pulsating gold glow (3s ease-in-out) with stacked text-shadows + radial ::before, reduced-motion static fallback
- Hero: Mobile video object-position: center 40% for rider framing
- Breathe: Converted from centered overlay to 2-column grid (text left, Nadi Shuddhi image right with gold frame)
- Pricing: Swapped galaxy background for copper-trident-courtyard with rgba(0,0,0,0.8) overlay
- Pricing: Strengthened cards with rgba(8,8,8,0.92) bg, blur(10px), gold border
- Pricing: Fixed truncated button with whitespace-normal, break-words, min-w instead of fixed w-56
- Beyond Archive: Swapped to translucent-figure-silhouettes with left-to-right scrim gradient
- CTA Band: Swapped to ancient-temple-midnight with bottom-anchored scrim
- Build verified clean, committed and pushed to GitHub

Stage Summary:
- All 5 sections updated in page.tsx, PricingCards.tsx, globals.css
- 5 new Cloudinary assets uploaded and referenced
- Commit: feat: hero video, pulsating glow typography, section image swaps, pricing clarity
---
Task ID: batch5
Agent: Main
Task: Batch 5 UI upgrades + Mahavidyas questionnaire bug fix

Work Log:
- Investigated Mahavidyas questionnaire bug: traced "The AI engine is calibrating" message to ConsultationScreener (503 response) and ArchetypeQuiz (503 response) when isLLMConfigured() returns false
- Root cause: archetype-quiz API returns 503 when LLM_API_KEY env var is not set (happens on Vercel deployment)
- Fixed archetype-quiz/route.ts: added complete rule-based fallback with per-answer archetype weight scoring matrix (5 questions x 4 answers x 2-3 archetypes each), descriptions for all 10 Mahavidyas, confidence calculation
- Fixed archetype-quiz/route.ts: added normalizeArchetypeId() to catch LLM misspellings (chhinnamasta->chinnamasta, tripurasundari->shodashi, dhoomavati->dhumavati)
- Fixed archetype-quiz/route.ts: LLM failure now gracefully falls back to rule-based analysis instead of returning 503
- Fixed consultation-screen/route.ts: updated LLM prompt to use canonical archetype IDs (shodashi, chinnamasta, dhumavati)
- Fixed archetypes/page.tsx: added useEffect to auto-expand archetype card when navigated via URL hash (e.g. /archetypes#kali) with smooth scroll
- Updated ArchetypeQuiz component: improved unconfigured state UX with retry button
- Batch 5.1: Japa page - added second parallax interlude (meditation bowl image), lifetime accumulation stats panel (total beads, sessions, avg/session) with AnimatedCounter
- Batch 5.2: Timer page - created AnimatedTimeDisplay component with per-digit AnimatedCounter for minutes and seconds, added second parallax interlude (meditation platform), added sitting statistics panel (sessions completed, total minutes sat)
- Batch 5.3: Verified all photo <img> tags already use CinematicImage; remaining <img> tags are intentional SVG yantras in loading states
- Batch 5.4: Pricing page - replaced static formatPrice() display with AnimatedCounter for animated price counting, with currency symbol prefix
- Batch 5.5: Added second parallax interludes on archive page (before Mahavidyas section, sri-yantra-mist image) and pricing page (before guarantee, sri-yantra-sky image)
- Build: clean, 0 errors, committed and pushed

Stage Summary:
- 8 files changed, 366 insertions, 65 deletions
- Key fix: archetype quiz now works WITHOUT LLM API key via deterministic fallback
- Key fix: archetype ID mismatches between LLM prompts and canonical data corrected
- Key fix: hash-based auto-expand on archetypes page for "View Full Archetype" link
- All 5 Batch 5 UI upgrades implemented and verified
