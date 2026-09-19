import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { tryGetAuthSecret } from '@/lib/auth-secret';
import { createClient } from '@libsql/client';

// =============================================================
// VOL. 2 #18 — Core Web Vitals dashboard API
// -------------------------------------------------------------
// GET /api/admin/web-vitals?range=7
//   Returns p50/p75/p95 per metric (LCP, FID, CLS, INP, TTFB)
//   by route + device. Reads from the existing AnalyticsEvent table
//   (event = 'web_vitals', properties = JSON with metrics array).
// =============================================================

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN'];

function getClient() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) return null;
  return createClient({ url, authToken: token });
}

interface VitalRecord {
  metric: string;
  value: number;
  rating: string;
  path: string;
  device: string;
  connection: string;
  ts: string;
}

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rangeDays = Math.min(Math.max(Number(new URL(request.url).searchParams.get('range') ?? '7'), 1), 90);
  const since = new Date(Date.now() - rangeDays * 86_400_000).toISOString();

  const client = getClient();
  if (!client) {
    return NextResponse.json({ error: 'Analytics store unreachable' }, { status: 503 });
  }

  try {
    // Fetch all web_vitals events in the range (capped at 5000)
    const result = await client.execute({
      sql: `SELECT properties, path, createdAt FROM AnalyticsEvent
            WHERE event = 'web_vitals' AND createdAt >= ?
            ORDER BY createdAt DESC
            LIMIT 5000`,
      args: [since],
    });

    const records: VitalRecord[] = [];
    for (const row of result.rows) {
      try {
        const props = JSON.parse(row.properties as string);
        if (!props.metrics || !Array.isArray(props.metrics)) continue;
        for (const m of props.metrics) {
          records.push({
            metric: m.name,
            value: m.value,
            rating: m.rating,
            path: (row.path as string) || '/',
            device: props.device || 'unknown',
            connection: props.connection || 'unknown',
            ts: row.createdAt as string,
          });
        }
      } catch { /* skip malformed */ }
    }

    // Aggregate per metric (p50, p75, p95)
    const metrics = ['LCP', 'FID', 'CLS', 'INP', 'TTFB'];
    const byMetric = metrics.map(metric => {
      const values = records.filter(r => r.metric === metric).map(r => r.value).sort((a, b) => a - b);
      if (values.length === 0) {
        return { metric, count: 0, p50: null, p75: null, p95: null, goodCount: 0, needsImprovementCount: 0, poorCount: 0 };
      }
      const pick = (p: number) => values[Math.floor(values.length * p)] ?? null;
      return {
        metric,
        count: values.length,
        p50: pick(0.5),
        p75: pick(0.75),
        p95: pick(0.95),
        goodCount: records.filter(r => r.metric === metric && r.rating === 'good').length,
        needsImprovementCount: records.filter(r => r.metric === metric && r.rating === 'needs-improvement').length,
        poorCount: records.filter(r => r.metric === metric && r.rating === 'poor').length,
      };
    });

    // Aggregate per route (top 10 by sample count)
    const byRouteMap = new Map<string, { count: number; lcpValues: number[]; clsValues: number[] }>();
    for (const r of records) {
      const entry = byRouteMap.get(r.path) ?? { count: 0, lcpValues: [], clsValues: [] };
      entry.count++;
      if (r.metric === 'LCP') entry.lcpValues.push(r.value);
      if (r.metric === 'CLS') entry.clsValues.push(r.value);
      byRouteMap.set(r.path, entry);
    }
    const byRoute = Array.from(byRouteMap.entries())
      .map(([path, e]) => ({
        path,
        count: e.count,
        medianLcp: e.lcpValues.length > 0 ? e.lcpValues.sort((a, b) => a - b)[Math.floor(e.lcpValues.length / 2)] : null,
        medianCls: e.clsValues.length > 0 ? e.clsValues.sort((a, b) => a - b)[Math.floor(e.clsValues.length / 2)] : null,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Aggregate per device
    const byDeviceMap = new Map<string, number>();
    for (const r of records) {
      byDeviceMap.set(r.device, (byDeviceMap.get(r.device) ?? 0) + 1);
    }
    const byDevice = Array.from(byDeviceMap.entries()).sort((a, b) => b[1] - a[1]);

    return NextResponse.json({
      totalSamples: records.length,
      rangeDays,
      byMetric,
      byRoute,
      byDevice,
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Unknown error',
    }, { status: 500 });
  }
}
