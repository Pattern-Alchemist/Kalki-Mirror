export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getCorpusStats } from '@/lib/static-db';

/**
 * GET /api/health
 *
 * Corpus health check — the canonical smoke-test for Vercel deployment.
 * If this returns 0 chunks, the nft include is broken.
 * If this returns 279 chunks, the baked corpus survived the cold start.
 *
 * Response shape:
 * {
 *   status: "ok" | "degraded",
 *   corpus: { total: 279, withEmbeddings: N, cautionBreakdown: {...}, source: "..." },
 *   environment: "serverless" | "local",
 *   timestamp: ISO
 * }
 */
export async function GET() {
  const start = Date.now();

  try {
    const stats = await getCorpusStats();
    const elapsed = Date.now() - start;

    // Health classification
    const isHealthy = stats.total === 279;
    const isDegraded = stats.total > 0 && stats.total !== 279;

    return NextResponse.json({
      status: isHealthy ? 'ok' : isDegraded ? 'degraded' : 'critical',
      corpus: stats,
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
      error: 'Corpus health check failed.',
      detail: error instanceof Error ? error.message : String(error),
      timing: { coldStartMs: elapsed },
      environment: process.env.VERCEL === '1' ? 'serverless' : 'local',
      timestamp: new Date().toISOString(),
    }, {
      status: 503,
    });
  }
}
