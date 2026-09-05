export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getCorpusStats } from '@/lib/static-db';
import { db } from '@/lib/db';
import { rateLimitBackend, rateLimit429Snapshot } from '@/lib/rate-limit';

/**
 * GET /api/health
 *
 * Full health check: corpus (static DB) + Turso (dynamic DB).
 * Each subsystem is probed independently and reported inline —
 * a failing subsystem degrades the overall status but never
 * collapses the response shape, so operators always get the
 * full diagnostic picture.
 * If corpus returns 279 chunks AND Turso responds, status is "ok".
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
  const isCorpusHealthy = corpus.total === 279;
  const isDegraded = corpus.total > 0 && corpus.total !== 279;

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

  return NextResponse.json(
    {
      status: isHealthy ? 'ok' : isDegraded || dbStatus === 'ok' ? 'degraded' : 'critical',
      corpus,
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        error: dbError,
      },
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
