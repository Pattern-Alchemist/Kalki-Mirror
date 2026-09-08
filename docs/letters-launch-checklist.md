# Letters launch checklist — the five launch letters (Vol. 5 #6)

The broadcast archive ships with a full pipeline and an empty shelf. This
checklist takes it live. The five launch letters live in
`content/launch-letters/` — drafted FROM existing corpus folios, in the
founder-review register: nothing is public until you say so.

## State right now

- `content/launch-letters/` — 5 letters + manifest, repo-tracked, NOT in the DB.
- `POST /api/admin/letters` seeds drafts (`isPublic:false`) or publishes flips.
- Hub `/letters`, sitemap and `/feed.xml` read public rows live (≤1h freshness).

## 1. Review the drafts

Read each letter. They are plain text in the broadcast markup
(`## ` section, `- ` bullet, blank line = paragraph break):

| # | File | Grounds |
|---|------|---------|
| 1 | `01-the-mirror-does-not-flatter.md` | /patterns/the-witness · the-pleaser |
| 2 | `02-the-mantra-that-breathes-you.md` | /glossary/prana · /email-course |
| 3 | `03-one-flame-one-thought.md` | /patterns/the-void · /email-course |
| 4 | `04-prana-is-not-the-breath.md` | /glossary/prana · /patterns/the-architect |
| 5 | `05-why-the-archive-stays-silent.md` | /ask · /letters |

Edit copy in the files, commit — the seeder upserts in place (re-run is safe).

## 2. Seed the drafts (idempotent)

```bash
node scripts/seed-launch-letters.mjs \
  --base https://www.astrokalki.com \
  --email archivist@kalki.mirror --password '<admin password>'
```

Verify: `GET /api/admin/letters` lists five rows, `isPublic:false`; the hub
stays empty ("No letters yet"); sitemap/feed unchanged. Drafts are invisible
by contract — that is the pin.

## 3. Publish (the founder's flip)

```bash
node scripts/seed-launch-letters.mjs --publish \
  --base https://www.astrokalki.com \
  --email archivist@kalki.mirror --password '<admin password>'
```

A draft→public flip re-dates `sentAt` to the publish moment, so the archive
reads in publish order. To publish selectively, POST single letters:

```bash
curl -X POST https://www.astrokalki.com/api/admin/letters \
  -H 'content-type: application/json' -b '<admin session cookie>' \
  -d '{"letters":[{"slug":"the-mirror-does-not-flatter","subject":"…","body":"…","isPublic":true}]}'
```

## 4. Verify within one revalidation (≤1h)

- `/letters` — five cards, newest first.
- `/letters/the-mirror-does-not-flatter` — renders 200, indexable.
- `/sitemap.xml` — `/letters/<slug>` URLs appear (revalidate 3600).
- `/feed.xml` — five `<category>Letter</category>` items with full bodies.
- Audit log — one `letters.upsert` entry per letter.

## 5. Unpublish / edit later

- Unpublish: POST the letter with `"isPublic":false` — it vanishes from hub,
  sitemap and feed on the next revalidation. Nothing else needed.
- Copy edits: fix the file, re-run the seeder (update keeps the publish date).
