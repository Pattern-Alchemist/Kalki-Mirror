/**
 * STATIC DB — Read-only FolioChunk corpus
 *
 * Architecture decision (the persistence split):
 *   - The 279 FolioChunk embeddings are STATIC (the folio set never changes at runtime (count: see src/lib/canonical.ts)).
 *   - This client reads from a baked SQLite file committed as a read-only asset.
 *   - On Vercel serverless: the deployment filesystem is read-only; only /tmp is writable.
 *     At cold start, we copy the baked db/custom.db → /tmp/kalki-corpus.db and open it there.
 *   - On local dev: we read directly from db/custom.db.
 *
 * This client should ONLY be used for FolioChunk queries.
 * All runtime writes (User, Streaks, Keys) go through src/lib/db.ts → Turso.
 */

import { PrismaClient } from '@/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { unstable_cache } from 'next/cache';

// ─── Paths ──────────────────────────────────────────────────────────────────

const BAKED_CORPUS_PATH = join(process.cwd(), 'db', 'custom.db');
const SERVERLESS_CORPUS_PATH = '/tmp/kalki-corpus.db';

/**
 * Detect if we're running in a serverless environment
 * where the deployment filesystem is read-only.
 * Vercel, AWS Lambda, Cloudflare Workers, etc.
 */
const isServerless =
  process.env.VERCEL === '1' ||
  process.env.AWS_LAMBDA_FUNCTION_NAME != null ||
  process.env.CF_PAGES === '1';

// ─── Cold-start loader ─────────────────────────────────────────────────────

/**
 * On serverless cold start, /tmp is empty and the only writable location.
 * Copy the baked corpus there so Prisma's SQLite engine can open it.
 * Subsequent invocations within the same warm instance skip the copy.
 */
function ensureCorpusInTmp(): void {
  if (existsSync(SERVERLESS_CORPUS_PATH)) return; // Already copied in this instance

  try {
    mkdirSync('/tmp', { recursive: true });
    copyFileSync(BAKED_CORPUS_PATH, SERVERLESS_CORPUS_PATH);
  } catch (err) {
    console.error(
      '[static-db] Failed to copy corpus to /tmp. ' +
      'Ensure db/custom.db is bundled in the deployment.',
      err
    );
  }
}

if (isServerless) {
  ensureCorpusInTmp();
}

// ─── Client instantiation ───────────────────────────────────────────────────

const corpusPath = isServerless ? SERVERLESS_CORPUS_PATH : BAKED_CORPUS_PATH;

const globalForStatic = globalThis as unknown as {
  staticDb: PrismaClient | undefined;
};

/**
 * Read-only Prisma client for the baked FolioChunk corpus.
 *
 * In serverless: reads from /tmp/kalki-corpus.db (copied from baked asset at cold start).
 * In local dev: reads directly from db/custom.db.
 *
 * IMPORTANT: This client must ONLY be used for FolioChunk read queries.
 * Never use this for User, SadhanaStreak, InviteCode, etc.
 */
export const staticDb =
  globalForStatic.staticDb ??
  new PrismaClient({
    // Prisma 7: driver adapters are mandatory — the Rust engine is gone.
    adapter: new PrismaLibSql({ url: `file:${corpusPath}` }),
    log: process.env.PRISMA_LOG === '1' ? ['query'] : [],
  });

// Prevent multiple instances in hot-reload during development
if (process.env.NODE_ENV !== 'production') {
  globalForStatic.staticDb = staticDb;
}

// ─── Health check ───────────────────────────────────────────────────────────

/**
 * Cached corpus stats using Next.js unstable_cache.
 * The corpus DB never changes at runtime (read-only baked asset),
 * so a 5-minute TTL is safe — eliminates redundant SQLite queries
 * across concurrent serverless invocations.
 */
export const getCorpusStats = unstable_cache(
  async () => {
    const [total, withEmbeddings, allChunks] = await Promise.all([
      staticDb.folioChunk.count(),
      staticDb.folioChunk.count({ where: { embedding: { not: '[]' } } }),
      staticDb.folioChunk.findMany({ select: { caution: true } }),
    ]);

    const cautionBreakdown: Record<string, number> = {};
    for (const c of allChunks) {
      cautionBreakdown[c.caution] = (cautionBreakdown[c.caution] || 0) + 1;
    }

    return {
      total,
      withEmbeddings,
      cautionBreakdown,
      source: isServerless ? '/tmp/kalki-corpus.db (serverless)' : corpusPath,
    };
  },
  ['corpus-stats'],
  { revalidate: 300, tags: ['corpus'] }
);
