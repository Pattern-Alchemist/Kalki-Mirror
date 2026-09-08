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
  // ── Vol. 5 #9 — the long tail: the corpus is fully voiced. Durations
  // measured from the baked files (ffprobe), pinned by tests in the
  // 60–120s band. Progression order: entry → build → advanced pair.
  { slug: 'sitali', url: '/audio/breathwork/sitali.mp3', title: 'Guided narration — Śītalī, cooling breath', durationSec: 74 },
  { slug: 'kapalabhati-basic', url: '/audio/breathwork/kapalabhati-basic.mp3', title: 'Guided narration — Kapālabhāti, skull shining (basic)', durationSec: 81 },
  { slug: 'surya-bhedana', url: '/audio/breathwork/surya-bhedana.mp3', title: 'Guided narration — Sūrya Bhedana, solar piercing', durationSec: 86 },
  { slug: 'chandra-bhedana', url: '/audio/breathwork/chandra-bhedana.mp3', title: 'Guided narration — Candra Bhedana, lunar piercing', durationSec: 87 },
  { slug: 'bhastrika', url: '/audio/breathwork/bhastrika.mp3', title: 'Guided narration — Bhastrikā, bellows breath', durationSec: 84 },
  { slug: 'nadi-shuddhi-advanced', url: '/audio/breathwork/nadi-shuddhi-advanced.mp3', title: 'Guided narration — Nāḍī Śuddhi, advanced ratio', durationSec: 77 },
  { slug: 'kapalabhati-advanced', url: '/audio/breathwork/kapalabhati-advanced.mp3', title: 'Guided narration — Kapālabhāti, advanced', durationSec: 77 },
  { slug: 'kevala-kumbhaka', url: '/audio/breathwork/kevala-kumbhaka.mp3', title: 'Guided narration — Kevala Kumbhaka, spontaneous retention', durationSec: 84 },
];

const breathBySlug = new Map(breathNarrations.map((n) => [n.slug, n]));

/** The narrated edition of a breath pattern, if the pilot baked one. */
export function getBreathNarration(slug: string): AudioNarration | undefined {
  return breathBySlug.get(slug);
}

/** Doors narrations by day number — the full course, told aloud (Vol. 5 #9). */
export const doorNarrations: Record<number, AudioNarration> = {
  1: { slug: 'door-01', url: '/audio/doors/door-01.mp3', title: 'Door 1 — narrated edition', durationSec: 76 },
  2: { slug: 'door-02', url: '/audio/doors/door-02.mp3', title: 'Door 2 — narrated edition', durationSec: 74 },
  3: { slug: 'door-03', url: '/audio/doors/door-03.mp3', title: 'Door 3 — narrated edition', durationSec: 83 },
  4: { slug: 'door-04', url: '/audio/doors/door-04.mp3', title: 'Door 4 — narrated edition', durationSec: 87 },
  5: { slug: 'door-05', url: '/audio/doors/door-05.mp3', title: 'Door 5 — narrated edition', durationSec: 82 },
  6: { slug: 'door-06', url: '/audio/doors/door-06.mp3', title: 'Door 6 — narrated edition', durationSec: 74 },
  7: { slug: 'door-07', url: '/audio/doors/door-07.mp3', title: 'Door 7 — narrated edition', durationSec: 75 },
  8: { slug: 'door-08', url: '/audio/doors/door-08.mp3', title: 'Door 8 — narrated edition', durationSec: 81 },
  9: { slug: 'door-09', url: '/audio/doors/door-09.mp3', title: 'Door 9 — narrated edition', durationSec: 65 },
  10: { slug: 'door-10', url: '/audio/doors/door-10.mp3', title: 'Door 10 — narrated edition', durationSec: 85 },
};

export function getDoorNarration(day: number): AudioNarration | undefined {
  return doorNarrations[day];
}

/** Absolute URL for email contexts (the SITE convention of the email module). */
export function doorNarrationAbsoluteUrl(day: number, siteOrigin: string): string | undefined {
  const n = getDoorNarration(day);
  return n ? `${siteOrigin}${n.url}` : undefined;
}
