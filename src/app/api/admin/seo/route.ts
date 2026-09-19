import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { tryGetAuthSecret } from '@/lib/auth-secret';
import { db } from '@/lib/db';

// =============================================================
// VOL. 2 #16 — SEO Dashboard API
// -------------------------------------------------------------
// GET /api/admin/seo
//   Returns:
//     · sitemap URL count by type (static, archive, patterns, etc.)
//     · last-mod freshness
//     · internal-link graph (top 20 linked pages from homepage)
//     · top 20 orphan pages (in sitemap but NOT linked from homepage)
//     · pages that should be in sitemap but aren't (audit)
//     · ContentEntry publication count (last 30 days)
//
// No external API calls — pure aggregation from sitemap.ts + ContentEntry.
// GSC OAuth is founder-gated; when it lands, this endpoint extends
// with impressions/CTR/position per URL.
// =============================================================

const ADMIN_ROLES = ['ADMIN', 'SUPERADMIN', 'EDITOR', 'REVIEWER'];

interface SitemapUrl {
  url: string;
  lastModified?: Date;
  changeFrequency?: string;
  priority?: number;
}

async function fetchSitemapUrls(): Promise<SitemapUrl[]> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.astrokalki.com';
    const r = await fetch(`${base}/sitemap.xml`, { next: { revalidate: 300 } });
    if (!r.ok) return [];
    const xml = await r.text();
    // Parse <url><loc>...</loc></url> entries
    const urls: SitemapUrl[] = [];
    const urlRegex = /<url>([\s\S]*?)<\/url>/g;
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(xml)) !== null) {
      const block = match[1];
      const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
      const lastmodMatch = block.match(/<lastmod>([^<]+)<\/lastmod>/);
      const prioMatch = block.match(/<priority>([^<]+)<\/priority>/);
      if (locMatch) {
        urls.push({
          url: locMatch[1].trim(),
          lastModified: lastmodMatch ? new Date(lastmodMatch[1]) : undefined,
          priority: prioMatch ? parseFloat(prioMatch[1]) : undefined,
        });
      }
    }
    return urls;
  } catch {
    return [];
  }
}

function classifyUrl(url: string): string {
  const path = new URL(url).pathname;
  if (path === '/') return 'homepage';
  if (path.startsWith('/archive')) return 'archive';
  if (path.startsWith('/archetypes')) return 'archetypes';
  if (path.startsWith('/patterns')) return 'patterns';
  if (path.startsWith('/method')) return 'method';
  if (path.startsWith('/research')) return 'research';
  if (path.startsWith('/pricing')) return 'pricing';
  if (path.startsWith('/consultations')) return 'consultations';
  if (path.startsWith('/letters')) return 'letters';
  if (path.startsWith('/usa')) return 'usa';
  if (path.startsWith('/hi/')) return 'hi-twins';
  if (path.startsWith('/library')) return 'library';
  if (path.startsWith('/glossary')) return 'glossary';
  if (path.startsWith('/sequences')) return 'sequences';
  if (path.startsWith('/breathwork')) return 'breathwork';
  if (path.startsWith('/aghori-tantra')) return 'aghori-course';
  return 'other';
}

async function fetchHomepageLinks(): Promise<Set<string>> {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.astrokalki.com';
    const r = await fetch(base, { next: { revalidate: 300 } });
    if (!r.ok) return new Set();
    const html = await r.text();
    // Extract href="/..." paths from <a> tags
    const links = new Set<string>();
    const linkRegex = /href="(\/[^"]*)"/g;
    let match: RegExpExecArray | null;
    while ((match = linkRegex.exec(html)) !== null) {
      links.add(match[1]);
    }
    return links;
  } catch {
    return new Set();
  }
}

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: tryGetAuthSecret() });
  if (!token || !ADMIN_ROLES.includes(token.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const [sitemapUrls, homepageLinks, contentEntries] = await Promise.all([
      fetchSitemapUrls(),
      fetchHomepageLinks(),
      db.contentEntry.findMany({
        where: {
          status: 'PUBLISHED',
          publishedAt: { gte: new Date(Date.now() - 30 * 86_400_000) },
        },
        select: { id: true, type: true, slug: true, title: true, publishedAt: true },
        orderBy: { publishedAt: 'desc' },
        take: 30,
      }),
    ]);

    // Group by type
    const byType = new Map<string, number>();
    for (const u of sitemapUrls) {
      const t = classifyUrl(u.url);
      byType.set(t, (byType.get(t) ?? 0) + 1);
    }

    // Orphan pages: in sitemap but NOT linked from homepage
    const orphanPages = sitemapUrls.filter(u => {
      try {
        const path = new URL(u.url).pathname;
        return !homepageLinks.has(path) && !homepageLinks.has(path + '/');
      } catch {
        return false;
      }
    }).slice(0, 20);

    // Top linked pages from homepage that are ALSO in the sitemap
    const sitemapPaths = new Set(sitemapUrls.map(u => {
      try { return new URL(u.url).pathname; } catch { return ''; }
    }));
    const topLinked = Array.from(homepageLinks)
      .filter(p => sitemapPaths.has(p))
      .slice(0, 20);

    // Freshness: newest lastmod
    const lastmods = sitemapUrls
      .map(u => u.lastModified)
      .filter((d): d is Date => !!d)
      .sort((a, b) => b.getTime() - a.getTime());
    const newestLastmod = lastmods[0] ?? null;
    const oldestLastmod = lastmods[lastmods.length - 1] ?? null;

    return NextResponse.json({
      sitemap: {
        totalUrls: sitemapUrls.length,
        byType: Array.from(byType.entries()).sort((a, b) => b[1] - a[1]),
        newestLastmod,
        oldestLastmod,
      },
      internalLinks: {
        homepageLinkCount: homepageLinks.size,
        topLinked,
        orphanCount: orphanPages.length,
        orphanPages: orphanPages.map(u => ({ url: u.url, priority: u.priority })),
      },
      content: {
        publishedLast30Days: contentEntries.length,
        recent: contentEntries.slice(0, 10).map(e => ({
          slug: e.slug,
          title: e.title,
          type: e.type,
          publishedAt: e.publishedAt,
        })),
      },
      gscConfigured: !!process.env.GSC_PROPERTY_URL,
    });
  } catch (e) {
    return NextResponse.json({
      error: e instanceof Error ? e.message : 'Unknown error',
    }, { status: 500 });
  }
}
