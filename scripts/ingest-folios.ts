/**
 * FOLIO INGEST SCRIPT — Chunker + Embedder
 *
 * Reads all siddhi folios from the flat TypeScript data files,
 * splits each into semantic sections, maps caution levels,
 * optionally embeds with text-embedding-3-small,
 * and upserts into the FolioChunk table.
 *
 * Usage:
 *   npx tsx scripts/ingest-folios.ts              # keyword-only (no API key needed)
 *   OPENAI_API_KEY=sk-... npx tsx scripts/ingest-folios.ts  # with embeddings
 */

import { db } from '../src/lib/db';
import { allSiddhis } from '../src/lib/data/siddhis';
import { PATTERN_ARCHETYPE_MAP } from '../src/lib/data/archetypes';
import { getCautionLevel, type CautionLevel } from '../src/lib/data/types';
import type { Siddhi } from '../src/lib/data/types';

// ─── Section extraction ────────────────────────────────────────────────────
//
// Each siddhi object has natural semantic boundaries.
// One chunk per section, metadata attached.

interface RawChunk {
  slug: string;
  archetype: string | null;
  section: string;
  caution: CautionLevel;
  text: string;
}

function extractChunks(s: Siddhi): RawChunk[] {
  const caution = getCautionLevel(s.level);
  const archetype = PATTERN_ARCHETYPE_MAP
    ? Object.entries(PATTERN_ARCHETYPE_MAP)
        .find(([, v]) => {
          // Check if this siddhi's slug appears in the pattern's relatedSiddhis
          // or if the archetype id matches the siddhi's archetypeId
          return v === s.slug || s.archetypeId === v;
        })?.[1] ?? null
    : null;

  // Reverse-lookup: find archetype IDs that reference this siddhi slug
  let archId: string | null = s.archetypeId ?? null;
  if (!archId) {
    for (const [archSlug, siddhiSlug] of Object.entries(PATTERN_ARCHETYPE_MAP)) {
      if (siddhiSlug === s.slug) {
        archId = archSlug;
        break;
      }
    }
  }

  const chunks: RawChunk[] = [];

  // Section: summary
  if (s.summary) {
    chunks.push({
      slug: s.slug,
      archetype: archId,
      section: 'summary',
      caution,
      text: `[${s.name} — ${s.sanskrit}] ${s.category} | ${s.tradition} | ${s.level}\n\n${s.summary}`,
    });
  }

  // Section: benefits
  if (s.benefits.length > 0) {
    chunks.push({
      slug: s.slug,
      archetype: archId,
      section: 'benefits',
      caution,
      text: `[${s.name}] Benefits:\n${s.benefits.map(b => `- ${b}`).join('\n')}`,
    });
  }

  // Section: warnings
  if (s.warnings.length > 0) {
    chunks.push({
      slug: s.slug,
      archetype: archId,
      section: 'warnings',
      caution,
      text: `[${s.name}] Warnings:\n${s.warnings.map(w => `- ${w}`).join('\n')}`,
    });
  }

  // Section: mantra
  if (s.primaryMantra) {
    chunks.push({
      slug: s.slug,
      archetype: archId,
      section: 'mantra',
      caution,
      text: `[${s.name}] Primary Mantra: ${s.primaryMantra}\nMinimum practice: ${s.days} days (${s.durationHours}h total)`,
    });
  }

  // Section: lineage (attestation)
  if (s.lineage) {
    chunks.push({
      slug: s.slug,
      archetype: archId,
      section: 'lineage',
      caution,
      text: `[${s.name}] Lineage / Attestation: ${s.lineage}\nAuthenticity score: ${s.authenticityScore}/100`,
    });
  }

  // Section: bibliography
  if (s.evidenceSources.length > 0) {
    const bibText = s.evidenceSources
      .map(e => `[${e.confidence}] ${e.title}${e.url ? ` — ${e.url}` : ''}`)
      .join('\n');
    chunks.push({
      slug: s.slug,
      archetype: archId,
      section: 'bibliography',
      caution,
      text: `[${s.name}] Evidence (${s.evidenceCount} sources):\n${bibText}`,
    });
  }

  return chunks;
}

// ─── Embedding (optional) ─────────────────────────────────────────────────

async function embedTexts(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.log('  No OPENAI_API_KEY — storing empty embeddings (keyword fallback active).');
    return texts.map(() => []);
  }

  console.log(`  Embedding ${texts.length} chunks with text-embedding-3-small...`);

  // Batch in groups of 100 (OpenAI limit)
  const allEmbeddings: number[][] = [];
  for (let i = 0; i < texts.length; i += 100) {
    const batch = texts.slice(i, i + 100);
    const resp = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: batch,
        model: 'text-embedding-3-small',
        dimensions: 1536,
      }),
    });

    if (!resp.ok) {
 const err = await resp.text();
      console.error(`  Embedding API error (batch ${i}): ${resp.status} — ${err}`);
      console.log('  Falling back to empty embeddings for remaining chunks.');
      return texts.map(() => []);
    }

    const data = await resp.json();
    const batchEmbeddings = data.data.map((d: { embedding: number[] }) => d.embedding);
    allEmbeddings.push(...batchEmbeddings);
    console.log(`    Batch ${Math.floor(i / 100) + 1}: ${batchEmbeddings.length} embeddings received.`);
  }

  return allEmbeddings;
}

// ─── Main ingest ───────────────────────────────────────────────────────────

async function main() {
  console.log('=== KALKI FOLIO INGEST ===\n');

  // 1. Extract chunks from all siddhis
  const allChunks: RawChunk[] = [];
  for (const s of allSiddhis) {
    const chunks = extractChunks(s);
    allChunks.push(...chunks);
  }

  console.log(`Extracted ${allChunks.length} chunks from ${allSiddhis.length} folios.\n`);

  // Caution distribution
  const cautionCounts: Record<string, number> = {};
  for (const c of allChunks) {
    cautionCounts[c.caution] = (cautionCounts[c.caution] || 0) + 1;
  }
  console.log('Caution distribution:', cautionCounts);

  // 2. Embed
  const texts = allChunks.map(c => c.text);
  const embeddings = await embedTexts(texts);

  // 3. Upsert to DB
  console.log('\nUpserting to FolioChunk table...');
  let upserted = 0;
  let skipped = 0;

  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    const emb = embeddings[i];
    const embeddingStr = emb.length > 0 ? JSON.stringify(emb) : '[]';

    // Use a deterministic composite key for upsert: slug + section
    // SQLite doesn't have ON CONFLICT on non-unique columns,
    // so we delete-then-create
    const existing = await db.folioChunk.findFirst({
      where: { slug: chunk.slug, section: chunk.section },
    });

    if (existing) {
      await db.folioChunk.update({
        where: { id: existing.id },
        data: {
          archetype: chunk.archetype,
          caution: chunk.caution,
          text: chunk.text,
          embedding: embeddingStr,
        },
      });
      skipped++;
    } else {
      await db.folioChunk.create({
        data: {
          slug: chunk.slug,
          archetype: chunk.archetype,
          section: chunk.section,
          caution: chunk.caution,
          text: chunk.text,
          embedding: embeddingStr,
        },
      });
      upserted++;
    }
  }

  console.log(`\nDone. ${upserted} created, ${skipped} updated. Total: ${allChunks.length} chunks.`);

  // 4. Verify
  const total = await db.folioChunk.count();
  const withEmbeddings = await db.folioChunk.count({
    where: { embedding: { not: '[]' } },
  });
  console.log(`\nDB verification: ${total} chunks total, ${withEmbeddings} with embeddings.`);
}

main()
  .catch(e => { console.error('Ingest failed:', e); process.exit(1); })
  .finally(() => db.$disconnect());
