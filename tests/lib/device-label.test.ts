import { describe, it, expect } from 'vitest';
import { deviceLabel } from '@/lib/admin/device-label';

/* ══════════════════════════════════════════════════════════════
   Vol. 2 #11 — device labels for the Active Sessions read model
   ══════════════════════════════════════════════════════════════ */

describe('deviceLabel', () => {
  it('labels desktop Chrome on macOS', () => {
    const d = deviceLabel(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    );
    expect(d).toMatchObject({ label: 'Chrome on macOS', browser: 'Chrome', os: 'macOS', kind: 'desktop' });
  });

  it('labels iPhone Safari as mobile (not desktop Safari)', () => {
    const d = deviceLabel(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    );
    expect(d).toMatchObject({ browser: 'Safari', os: 'iOS', kind: 'mobile' });
    expect(d.label).toBe('Safari on iOS');
  });

  it('labels Edge before Chrome (Edge UA contains Chrome)', () => {
    const d = deviceLabel(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0',
    );
    expect(d.browser).toBe('Edge');
    expect(d.os).toBe('Windows');
    expect(d.kind).toBe('desktop');
  });

  it('labels Android Chrome phones mobile and Android tablets as tablet', () => {
    const phone = deviceLabel(
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    );
    expect(phone).toMatchObject({ browser: 'Chrome', os: 'Android', kind: 'mobile' });

    const tablet = deviceLabel(
      'Mozilla/5.0 (Linux; Android 13; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    );
    expect(tablet.kind).toBe('tablet');
  });

  it('labels Firefox on Linux', () => {
    const d = deviceLabel(
      'Mozilla/5.0 (X11; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
    );
    expect(d).toMatchObject({ browser: 'Firefox', os: 'Linux', kind: 'desktop' });
  });

  it('never throws on hostile or empty input', () => {
    expect(deviceLabel(null).label).toBe('Unknown device');
    expect(deviceLabel('').label).toBe('Unknown device');
    expect(deviceLabel('   ').label).toBe('Unknown device');
    const weird = deviceLabel('not-a-user-agent-at-all');
    expect(weird.label).toContain('on');
  });

  it('prefers Samsung Internet over Chrome when present', () => {
    const d = deviceLabel(
      'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36',
    );
    expect(d.browser).toBe('Samsung Internet');
    expect(d.kind).toBe('mobile');
  });
});
