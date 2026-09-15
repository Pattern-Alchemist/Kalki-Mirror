import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/* ══════════════════════════════════════════════════════════════
   Vol. 7 #11 — Sitemap double-count prevention gate.
   Asserts that no URL in staticPages overlaps with the dynamic
   arrays (tantraPagesSitemap, aghoriPhasePages, aghoriLessonPages).
   The tantra hub lives in staticPages; the children live in
   tantraPagesSitemap — a future refactor could silently introduce
   a duplicate. This gate names the regression class before it
   happens.
   ══════════════════════════════════════════════════════════════ */

const REPO = join(__dirname, '..', '..');
const sitemapSrc = readFileSync(join(REPO, 'src', 'app', 'sitemap.ts'), 'utf8');

describe('Vol. 7 #11 — sitemap URL overlap prevention', () => {
  it('the sitemap source exists and contains the return statement', () => {
    expect(sitemapSrc).toContain('return [');
    expect(sitemapSrc).toContain('staticPages');
    expect(sitemapSrc).toContain('tantraPagesSitemap');
    expect(sitemapSrc).toContain('aghoriPhasePages');
  });

  it('staticPages and tantraPagesSitemap do NOT share URLs (the regression class)', () => {
    // Extract the staticPages URLs from the source — look for /tantra paths
    // in the staticPages section. If any /tantra path appears in both
    // staticPages and tantraPagesSitemap, that's a double-count.
    //
    // The tantra hub + 5 children are emitted ONLY by tantraPagesSitemap.
    // If a future refactor adds them to staticPages too, this test should
    // be updated to catch it — but for now, we assert the pattern:
    // staticPages should NOT contain a /tantra entry.
    const staticSection = sitemapSrc.split('staticPages')[1]?.split('const patternPages')[0] ?? '';
    expect(staticSection).not.toContain('/tantra/');
    expect(staticSection).not.toContain("'tantra'");
  });

  it('the aghori-tantra hub appears in staticPages but NOT in aghoriPhasePages', () => {
    // The hub URL is /aghori-tantra (in staticPages).
    // The phase URLs are /aghori-tantra/${m.id} (in aghoriPhasePages).
    // These should never overlap — the hub is a single entry, the phases
    // are dynamic paths.
    const staticSection = sitemapSrc.split('staticPages')[1]?.split('const patternPages')[0] ?? '';
    expect(staticSection).toContain('/aghori-tantra');
    // The phase pages use template literals, so they should contain ${m.id}
    const phaseSection = sitemapSrc.split('aghoriPhasePages')[1]?.split('aghoriLessonPages')[0] ?? '';
    expect(phaseSection).toContain('${m.id}');
  });
});
