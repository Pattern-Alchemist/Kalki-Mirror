// =============================================================
// KALKI — SEQUENCE HowTo JSON-LD BUILDER (Vol. 4 #10)
// -------------------------------------------------------------
// The six sadhana sequences render step-by-step protocols but
// carried no HowTo graph — the one schema.org type purpose-built
// for "do this, then this, for this long". This builder derives
// the graph from the SAME sequence data the folio renders.
//
// Honesty constraints (same policy as service-schema):
//   · totalTime only when totalDuration parses cleanly ("N min");
//     an unparseable duration is OMITTED, never guessed
//   · every step name/text comes verbatim from the data module
//
// Pure function (no React, no DB) so the page and the
// structured-data truth test share one truth.
// =============================================================

import { SITE_URL } from '@/lib/utils/metadata';
import type { PracticeSequence } from '@/lib/data/sequences';

/** "45 min" → "PT45M"; anything else → undefined (omit, never guess). */
export function sequenceTotalTime(totalDuration: string): string | undefined {
  const m = /^\s*(\d+)\s*min\s*$/i.exec(totalDuration);
  return m ? `PT${m[1]}M` : undefined;
}

export function buildSequenceHowToJsonLd(sequence: PracticeSequence) {
  const url = `${SITE_URL}/sequences/${sequence.slug}`;
  const totalTime = sequenceTotalTime(sequence.totalDuration);
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: sequence.name,
    ...(sequence.sanskrit ? { alternateName: sequence.sanskrit } : {}),
    description: sequence.description,
    url,
    ...(totalTime ? { totalTime } : {}),
    step: sequence.steps.map((step) => ({
      '@type': 'HowToStep',
      name: step.label,
      text: step.note ?? step.label,
    })),
  };
}
