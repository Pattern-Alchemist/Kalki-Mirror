"use client";

import { useAdminSWR } from "@/components/admin/use-admin-swr";

// =============================================================
// VOL. 2 #16 — SEO Dashboard
// -------------------------------------------------------------
// Free-tier SEO intelligence: sitemap census, internal-link graph,
// orphan pages, recent publications. When GSC OAuth lands, this
// page extends with impressions/CTR/position per URL.
// =============================================================

interface SitemapUrl {
  url: string;
  priority?: number;
}

interface SeoResponse {
  sitemap: {
    totalUrls: number;
    byType: [string, number][];
    newestLastmod: string | null;
    oldestLastmod: string | null;
  };
  internalLinks: {
    homepageLinkCount: number;
    topLinked: string[];
    orphanCount: number;
    orphanPages: SitemapUrl[];
  };
  content: {
    publishedLast30Days: number;
    recent: Array<{ slug: string; title: string; type: string; publishedAt: string | null }>;
  };
  gscConfigured: boolean;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--aw-text)]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[var(--aw-text-3)]">{sub}</p>}
    </div>
  );
}

function timeAgo(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days < 1) return 'today';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

export default function SeoDashboardPage() {
  const { data, loading, error } = useAdminSWR<SeoResponse>({
    key: 'admin-seo',
    fetcher: async () => {
      const r = await fetch('/api/admin/seo');
      if (!r.ok) throw new Error('Failed to load SEO data');
      return r.json();
    },
    refreshInterval: 5 * 60_000, // 5 min — sitemap changes slowly
    revalidateOnFocus: false,
  });

  if (loading && !data) return <div className="text-center py-20 text-[var(--aw-text-2)]">Loading SEO dashboard…</div>;
  if (error) return <div className="text-center py-20 text-red-400">{error.message}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--aw-text)]">SEO Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--aw-text-2)]">
          Sitemap census, internal-link graph, orphan pages, recent publications.
          {!data.gscConfigured && (
            <span className="ml-1 text-amber-300">
              GSC OAuth not configured — impression/CTR data unavailable. Add GSC_PROPERTY_URL + GSC OAuth env vars to extend.
            </span>
          )}
        </p>
      </div>

      {/* Top-line stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sitemap URLs" value={data.sitemap.totalUrls} sub="total indexed pages" />
        <StatCard label="Homepage Links" value={data.internalLinks.homepageLinkCount} sub="internal links on /" />
        <StatCard label="Orphan Pages" value={data.internalLinks.orphanCount} sub="in sitemap, not linked from /" />
        <StatCard label="Published (30d)" value={data.content.publishedLast30Days} sub="new ContentEntry rows" />
      </div>

      {/* Sitemap by type */}
      <section className="aw-card">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Sitemap by Type</h2>
        <p className="mt-1 text-[10px] text-[var(--aw-text-3)]">
          Newest lastmod: {timeAgo(data.sitemap.newestLastmod)} · Oldest: {timeAgo(data.sitemap.oldestLastmod)}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.sitemap.byType.map(([type, count]) => (
            <div
              key={type}
              className="flex items-center justify-between rounded-lg border border-[var(--aw-border-2)]/60 bg-[var(--aw-glass-1)] px-3 py-1.5"
            >
              <span className="text-xs text-[var(--aw-text-2)]">{type}</span>
              <span className="text-xs tabular-nums text-[var(--aw-text)]">{count}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Orphan pages */}
      <section className="aw-card">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">
          Orphan Pages — Top {data.internalLinks.orphanPages.length}
        </h2>
        <p className="mt-1 text-[10px] text-[var(--aw-text-3)]">
          In the sitemap but not linked from the homepage. Add internal links to these pages to improve crawlability.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]">
                <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">URL</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {data.internalLinks.orphanPages.length === 0 ? (
                <tr><td colSpan={2} className="px-4 py-4 text-center text-xs text-[var(--aw-text-3)]">No orphans — every sitemap URL is linked from the homepage.</td></tr>
              ) : (
                data.internalLinks.orphanPages.map(p => (
                  <tr key={p.url} className="hover:bg-[var(--aw-glass-1)]/30">
                    <td className="px-4 py-2 text-xs text-[var(--aw-cyan)] truncate">
                      <a href={p.url} target="_blank" rel="noreferrer" className="hover:text-amber-300">
                        {new URL(p.url).pathname}
                      </a>
                    </td>
                    <td className="px-4 py-2 text-right text-xs tabular-nums text-[var(--aw-text-2)]">
                      {p.priority?.toFixed(2) ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Top linked from homepage */}
      <section className="aw-card">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">
          Top Internal Links — {data.internalLinks.topLinked.length} paths
        </h2>
        <p className="mt-1 text-[10px] text-[var(--aw-text-3)]">
          Pages linked from the homepage that are also in the sitemap.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {data.internalLinks.topLinked.map(path => (
            <a
              key={path}
              href={`https://www.astrokalki.com${path}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-2.5 py-0.5 text-[10px] font-mono text-[var(--aw-cyan)] transition hover:border-[var(--aw-cyan)] hover:text-amber-300"
            >
              {path}
            </a>
          ))}
        </div>
      </section>

      {/* Recent publications */}
      <section className="aw-card">
        <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Recent Publications (30d)</h2>
        {data.content.recent.length === 0 ? (
          <p className="mt-2 text-xs text-[var(--aw-text-3)]">No ContentEntry published in the last 30 days.</p>
        ) : (
          <ul className="mt-3 divide-y divide-[var(--aw-border-2)]/40">
            {data.content.recent.map(e => (
              <li key={e.slug} className="flex items-center justify-between py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-[var(--aw-text)] truncate">{e.title}</p>
                  <p className="text-[10px] text-[var(--aw-text-3)]">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 mr-1">{e.type}</span>
                    <span className="font-mono">{e.slug}</span>
                  </p>
                </div>
                <span className="text-[10px] text-[var(--aw-text-3)] ml-2">
                  {timeAgo(e.publishedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
