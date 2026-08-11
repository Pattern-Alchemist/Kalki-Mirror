/* ══════════════════════════════════════════════════════════════
   TIER COLORS — Single source of truth for all tier badge styling.
   Used by Library, Aghori Tantra, and any future tier-gated UI.
   ══════════════════════════════════════════════════════════════ */

/** Tailwind class strings for tier badges */
export const TIER_BADGE_STYLE: Record<string, string> = {
  prithvi: 'bg-[#8a7230]/15 text-[#d4a853] border-[#8a7230]/30',
  jal:     'bg-[#4a8fa8]/15 text-[#7ec8e3] border-[#4a8fa8]/30',
  agni:    'bg-[#c44b2b]/15 text-[#e8734f] border-[#c44b2b]/30',
  akash:   'bg-[#7c6bb5]/15 text-[#a99de0] border-[#7c6bb5]/30',
};

/** Method stage accent colors (hex for style props) */
export const STAGE_ACCENT_COLORS = {
  gold:  '#D4AF37',
  teal:  '#7EC8E3',
  copper: '#E8734F',
  violet: '#A99DE0',
} as const;
