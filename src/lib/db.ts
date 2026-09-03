/**
 * DYNAMIC DB — Runtime write client
 *
 * Architecture decision (the persistence split):
 *   - This client handles ALL runtime writes: User, SadhanaStreak,
 *     PatternResolution, InviteCode, InviteUsage.
 *   - In production: connects to Turso (hosted libSQL) via @prisma/adapter-libsql.
 *     Vercel's serverless filesystem is read-only — SQLite writes evaporate
 *     between invocations and are not shared across function instances.
 *   - In development: falls back to local SQLite (DATABASE_URL).
 *
 * DO NOT use this client for FolioChunk queries.
 * FolioChunk reads go through src/lib/static-db.ts (baked corpus).
 */

import { PrismaClient } from '@/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// ── Turso config (env-only, G-10 cleared) ────────────────────────────────
// Credentials live in Vercel env vars (production/preview) and local
// .env.local for development. No inline fallbacks — this file is public.

// ─── Retry wrapper for Turso cold starts ─────────────────────────────
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries) await new Promise(r => setTimeout(r, RETRY_DELAY_MS * (i + 1)));
    }
  }
  throw lastErr;
}

/**
 * Health-check wrapper: pings the DB on first use to catch cold-start
 * connection failures early, with retries.
 */
let healthChecked = false;
async function ensureConnection(client: PrismaClient) {
  if (healthChecked) return;
  await withRetry(() => client.user.count());
  healthChecked = true;
}

// ─── Client factory ─────────────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL || '';
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || '';

  if (tursoUrl) {
    // ── Production: Turso via libSQL adapter ──────────────────────────────
    const adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: tursoAuthToken || undefined,
    });

    const maskedUrl = tursoUrl.replace(/\/\/[^@]+@/, '//***@');
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[db] Turso adapter active — ${maskedUrl}`);
    }

    const client = new PrismaClient({
      adapter,
      log: process.env.PRISMA_LOG === '1' ? ['query'] : [],
    });

    // Fire-and-forget health check (won't block first real query)
    ensureConnection(client).catch(() => { healthChecked = false; });

    return client;
  }

  // ── Development: local SQLite via the libSQL adapter. Prisma 7 removed
  //    the Rust query engine — every connection requires a driver adapter.
  //    ─────────────────────────────────────────────────────────────────────
  const localUrl = process.env.DATABASE_URL || 'file:./db/custom.db';
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[db] Local SQLite adapter active — ${localUrl}`);
  }
  return new PrismaClient({
    adapter: new PrismaLibSql({ url: localUrl }),
    log: process.env.PRISMA_LOG === '1' ? ['query'] : [],
  });
}

// ─── Singleton ──────────────────────────────────────────────────────────────

export const db =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
