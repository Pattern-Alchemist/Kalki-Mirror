/**
 * DEVICE LABEL — User-Agent → human device name (pure, isomorphic).
 *
 * Vol. 2 #11 — the Settings "Active sessions" list should read like a
 * phone's trusted-device screen ("Chrome on macOS", "Safari on iPhone"),
 * not like a server log. Zero-dependency on purpose: UA parsing only ever
 * needs prefix matching for the browsers that actually reach an admin
 * console, and a dep here would outgrow its value.
 *
 * Fail-soft: any UA parses to something — worst case "Unknown device".
 */

export type DeviceKind = 'desktop' | 'mobile' | 'tablet' | 'unknown';

export interface DeviceLabel {
  /** "Chrome on macOS" — ready for the UI */
  label: string;
  browser: string;
  os: string;
  kind: DeviceKind;
}

interface Pattern {
  name: string;
  test: RegExp;
}

/** Ordered — first match wins. Edges/OPR must precede Chrome; ~generic order matters. */
const BROWSERS: Pattern[] = [
  { name: 'Edge', test: /Edg(?:e|A|iOS)?\// },
  { name: 'Opera', test: /(?:OPR|Opera)\// },
  { name: 'Samsung Internet', test: /SamsungBrowser\// },
  { name: 'Firefox', test: /(?:Firefox|FxiOS)\// },
  { name: 'Chrome', test: /(?:Chrome|CriOS)\// },
  { name: 'Safari', test: /Safari\// },
];

const OSES: Pattern[] = [
  { name: 'Windows', test: /Windows NT/ },
  { name: 'Android', test: /Android/ },
  // iOS BEFORE macOS — iPhone/iPad UAs embed "like Mac OS X"
  { name: 'iOS', test: /(?:iPhone|iPad|iPod)/ },
  { name: 'macOS', test: /Mac OS X/ },
  { name: 'Linux', test: /(?:Linux|X11)/ },
];

/**
 * Classify device kind. iPadOS 13+ reports as Mac + touch — unresolvable
 * without JS hints, accepted: it renders as a desktop Safari, which is
 * honest enough for a session list.
 */
function kindOf(ua: string, os: string): DeviceKind {
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return 'tablet';
  if (os === 'Android') return /Mobile/.test(ua) ? 'mobile' : 'tablet';
  if (/Mobi|iPhone|iPod|Windows Phone/i.test(ua)) return 'mobile';
  if (os !== 'unknown') return 'desktop';
  return 'unknown';
}

export function deviceLabel(ua: string | null | undefined): DeviceLabel {
  const raw = (ua ?? '').trim();
  if (!raw) {
    return { label: 'Unknown device', browser: 'Unknown', os: 'Unknown', kind: 'unknown' };
  }

  const browser = BROWSERS.find((b) => b.test.test(raw))?.name ?? 'Unknown browser';
  const os = OSES.find((o) => o.test.test(raw))?.name ?? 'unknown';
  const kind = kindOf(raw, os);

  const osLabel = os === 'unknown' ? 'Unknown OS' : os;
  return {
    label: `${browser} on ${osLabel}`,
    browser,
    os: osLabel,
    kind,
  };
}
