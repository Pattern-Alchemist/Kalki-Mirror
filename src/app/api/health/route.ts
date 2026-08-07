export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getCorpusStats } from '@/lib/static-db';
import { db } from '@/lib/db';

/**
 * GET /api/health
 *
 * Full health check: corpus (static DB) + Turso (dynamic DB).
 * If corpus returns 279 chunks AND Turso responds, status is "ok".
 */
export async function GET() {
  const start = Date.now();

  try {
    // Corpus check
    const stats = await getCorpusStats();
    const isCorpusHealthy = stats.total === 279;

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
    const isDegraded = stats.total > 0 && stats.total !== 279;
    const isHealthy = isCorpusHealthy && dbStatus === 'ok';

    return NextResponse.json({
      status: isHealthy ? 'ok' : isDegraded || dbStatus === 'ok' ? 'degraded' : 'critical',
      corpus: stats,
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
        error: dbError,
      },
      environment: process.env.VERCEL === '1' ? 'serverless' : 'local',
      timing: {
        coldStartMs: elapsed,
        isServerless: process.env.VERCEL === '1',
      },
      timestamp: new Date().toISOString(),
    }, {
      status: isHealthy ? 200 : 503,
    });
  } catch (error) {
    const elapsed = Date.now() - start;
    return NextResponse.json({
      status: 'critical',
      error: 'Health check failed.',
      detail: error instanceof Error ? error.message : String(error),
      timing: { coldStartMs: elapsed },
      environment: process.env.VERCEL === '1' ? 'serverless' : 'local',
      timestamp: new Date().toISOString(),
    }, {
      status: 503,
    });
  }
}
