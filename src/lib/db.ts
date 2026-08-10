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

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// ─── Client factory ─────────────────────────────────────────────────────────

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl) {
    // ── Production: Turso via libSQL adapter ──────────────────────────────
    const adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: tursoAuthToken || undefined,
    });

    console.log(
      `[db] Turso adapter active — ${tursoUrl.replace(/\/\/[^@]+@/, '//***@')}`
    );

    return new PrismaClient({
      adapter,
      log: process.env.PRISMA_LOG === '1' ? ['query'] : [],
    });
  }

  // ── Development: local SQLite (DATABASE_URL from .env) ──────────────────
  return new PrismaClient({
    log: process.env.PRISMA_LOG === '1' ? ['query'] : [],
  });
}

// ─── Singleton ──────────────────────────────────────────────────────────────

export const db =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
