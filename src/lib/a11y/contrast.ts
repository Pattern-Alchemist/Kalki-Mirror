/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — WCAG 2.x contrast audit utilities (Vol. 1 #19)
   ---------------------------------------------------------------------------
   Pure, dependency-free WCAG relative-luminance + contrast-ratio math over
   the platform's actual design tokens. The companion test locks the wizard
   surface's real foreground/background pairs at AA (≥ 4.5:1), so any future
   token drift that would push a seeker-facing pair below accessibility
   minimums fails CI instead of shipping.

   References:
   - sRGB linearization: WCAG 2.x §1.4.3 definition
   - Composite backgrounds: translucent glass panels are composited over
     --background (#0A0A0A) before auditing (backdrop blur cannot raise
     luminance beyond the composite of its inputs here — all inputs are dark).
   ═══════════════════════════════════════════════════════════════════════════ */

/** Linearize an sRGB channel per WCAG 2.x. */
function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG relative luminance of an #RRGGBB color. */
export function relativeLuminance(hex: string): number {
  const h = hex.replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/**
 * Composite a translucent foreground color over an opaque background.
 * `fgAlpha` in [0,1]. Used to derive the effective background behind
 * translucent glass panels.
 */
export function compositeOver(fgHex: string, fgAlpha: number, bgHex: string): string {
  const f = fgHex.replace(/^#/, '');
  const b = bgHex.replace(/^#/, '');
  const out: string[] = [];
  for (let i = 0; i < 6; i += 2) {
    const fv = parseInt(f.slice(i, i + 2), 16);
    const bv = parseInt(b.slice(i, i + 2), 16);
    const v = Math.round(fv * fgAlpha + bv * (1 - fgAlpha));
    out.push(v.toString(16).padStart(2, '0'));
  }
  return `#${out.join('')}`;
}

/** WCAG contrast ratio between two #RRGGBB colors — range [1, 21]. */
export function contrastRatio(hexA: string, hexB: string): number {
  const la = relativeLuminance(hexA);
  const lb = relativeLuminance(hexB);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
