// =============================================================
// KALKI — AUDIO NARRATION REGISTRY (Vol. 4 #12 pilot)
// -------------------------------------------------------------
// The runtime truth for baked narrations: which slugs HAVE a guided
// edition, where the file lives, how long it runs. The bake script
// (scripts/bake-breathwork-audio.mjs) writes the files; this module
// is what the site reads — the tests pin that every row's file is
// actually committed and every slug is real.
//
// Gating decision (documented): breathwork narration is a listen
// companion to the PUBLIC hub/folio copy — it rides the same open
// surface as the pattern description, not the tier-gated visualizer.
// The four pilot patterns are the entry progression (three prithvi +
// the natural next step), so a free seeker gets a complete first
// practice out of the box.
//
// Scale path: bake more files, add a row here — components and the
// email builder pick it up automatically.
// =============================================================

export interface AudioNarration {
  /** breath pattern slug (breath-patterns.ts) or door number string */
  slug: string;
  /** Public URL path (committed static file under public/). */
  url: string;
  /** Display title for the player label. */
  title: string;
  /** Total seconds (from the baked file — pinned by tests within tolerance). */
  durationSec: number;
}

/** The four pilot breath patterns (the classical entry progression). */
export const breathNarrations: AudioNarration[] = [
  { slug: 'nadi-shuddhi-basic', url: '/audio/breathwork/nadi-shuddhi-basic.mp3', title: 'Guided narration — Nāḍī Śuddhi, basic', durationSec: 79 },
  { slug: 'nadi-shuddhi-with-retention', url: '/audio/breathwork/nadi-shuddhi-with-retention.mp3', title: 'Guided narration — Nāḍī Śuddhi with retention', durationSec: 94 },
  { slug: 'bhramari', url: '/audio/breathwork/bhramari.mp3', title: 'Guided narration — Bhrāmarī, bee breath', durationSec: 82 },
  { slug: 'ujjayi-pranayama', url: '/audio/breathwork/ujjayi-pranayama.mp3', title: 'Guided narration — Ujjāyī, ocean breath', durationSec: 74 },
];

const breathBySlug = new Map(breathNarrations.map((n) => [n.slug, n]));

/** The narrated edition of a breath pattern, if the pilot baked one. */
export function getBreathNarration(slug: string): AudioNarration | undefined {
  return breathBySlug.get(slug);
}

/** Doors narrations by day number (sample: Door 1). */
export const doorNarrations: Record<number, AudioNarration> = {
  1: { slug: 'door-01', url: '/audio/doors/door-01.mp3', title: 'Door 1 — narrated edition', durationSec: 76 },
};

export function getDoorNarration(day: number): AudioNarration | undefined {
  return doorNarrations[day];
}

/** Absolute URL for email contexts (the SITE convention of the email module). */
export function doorNarrationAbsoluteUrl(day: number, siteOrigin: string): string | undefined {
  const n = getDoorNarration(day);
  return n ? `${siteOrigin}${n.url}` : undefined;
}
