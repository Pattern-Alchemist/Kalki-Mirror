export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getCorpusStats } from '@/lib/static-db';
import { db } from '@/lib/db';
import { rateLimitBackend, rateLimit429Snapshot } from '@/lib/rate-limit';
import { CORPUS_SIZE } from '@/lib/rag/idf-generated';

/**
 * GET /api/health
 *
 * Full health check: corpus (static DB) + Turso (dynamic DB).
 * Each subsystem is probed independently and reported inline —
 * a failing subsystem degrades the overall status but never
 * collapses the response shape, so operators always get the
 * full diagnostic picture.
 * The corpus health bar is the BAKED canonical count (CORPUS_SIZE from
 * src/lib/rag/idf-generated.ts, regenerated on every bake) — never a
 * hardcoded literal. (Vol. 3 #20: the old `=== 279` literal reported
 * "degraded" for the entire 327-chunk era.)
 */

interface CorpusStats {
  total: number;
  withEmbeddings: number;
  cautionBreakdown: Record<string, number>;
  source: string;
  error?: string | null;
}

export async function GET() {
  const start = Date.now();

  // Corpus check — isolated so a corpus probe failure never hides
  // the rest of the report.
  let stats: CorpusStats | null = null;
  let corpusError: string | null = null;
  try {
    stats = (await getCorpusStats()) as CorpusStats;
  } catch (e) {
    corpusError = e instanceof Error ? e.message : String(e);
  }
  const corpus: CorpusStats =
    stats ?? {
      total: 0,
      withEmbeddings: 0,
      cautionBreakdown: {},
      source: 'unavailable',
      error: corpusError,
    };
  const isCorpusHealthy = corpus.total === CORPUS_SIZE;
  const isDegraded = corpus.total > 0 && corpus.total !== CORPUS_SIZE;

  // Dynamic DB (Turso) connectivity check
  let dbStatus: 'ok' | 'error' = 'ok';
  let dbLatencyMs = 0;
  let dbError: string | null = null;
  try {
    const dbStart = Date.now();
    await db.user.count();
    dbLatencyMs = Date.now() - dbStart;
  } catch (e) {
    dbStatus = 'error';
    dbError = e instanceof Error ? e.message : String(e);
  }

  const elapsed = Date.now() - start;
  const isHealthy = isCorpusHealthy && dbStatus === 'ok';

  // Vol. 3 #19 — backup age (OpsState.last_backup_at, written by
  // scripts/backup-db.mjs). Fail-soft: a missing marker or a read error
  // degrades the ops picture, never the response shape. 48h+ since a
  // backup signals the backup routine is silently broken.
  let backup: { lastBackupAt: string | null; ageHours: number | null; stale: boolean | null } = {
    lastBackupAt: null,
    ageHours: null,
    stale: null,
  };
  try {
    const marker = await db.opsState.findUnique({ where: { key: 'last_backup_at' } });
    if (marker) {
      const ts = new Date(marker.value);
      if (!Number.isNaN(ts.getTime())) {
        const ageHours = Math.round(((Date.now() - ts.getTime()) / 3_600_000) * 10) / 10;
        backup = { lastBackupAt: marker.value, ageHours, stale: ageHours > 48 };
      }
    }
  } catch {
    // table not yet present / transient DB issue — report the default
  }

  return NextResponse.json(
    {
      status: isHealthy ? 'ok' : isDegraded || dbStatus === 'ok' ? 'degraded' : 'critical',
      corpus,
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        error: dbError,
      },
      // Vol. 3 #19 — backup freshness (null marker = never marked)
      backup,
      rateLimitBackend: rateLimitBackend(),
      // Vol. 2 #14 — throttling visibility (per serverless instance)
      rateLimit429: rateLimit429Snapshot(),
      environment: process.env.VERCEL === '1' ? 'serverless' : 'local',
      timing: {
        coldStartMs: elapsed,
        isServerless: process.env.VERCEL === '1',
      },
      timestamp: new Date().toISOString(),
    },
    {
      status: isHealthy ? 200 : 503,
    },
  );
}
