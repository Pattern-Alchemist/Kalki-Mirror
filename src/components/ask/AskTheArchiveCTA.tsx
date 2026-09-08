// =============================================================
// KALKI — "Ask the archive" CTA band (Vol. 5 #11)
// -------------------------------------------------------------
// /ask is noindexed by design — the corpus answers with citations,
// but nothing invited the question. These bands are the invitation:
// a server-rendered, zero-JS block on /library, /patterns and
// /codex whose example chips deep-link into /ask with the question
// prefilled (?q=) and the surface stamped (?ref=), so the ai_ask
// event can say which surface asks come from. Noindex on /ask
// itself stays untouched.
// =============================================================

import Link from 'next/link';
import type { AskRefSource } from '@/lib/ai/ask-refs';

interface SurfaceCopy {
  lede: string;
  examples: string[];
}

const SURFACE_COPY: Record<AskRefSource, SurfaceCopy> = {
  library: {
    lede: 'The sādhanā library teaches the practice; the archive answers questions about it. Ask the corpus anything it teaches — every answer carries its folio citations, or stays silent.',
    examples: [
      'How do I practice ajapa japa?',
      'What is the role of the guru in sādhana?',
      'What does the corpus teach about prāṇāyāma safety?',
    ],
  },
  patterns: {
    lede: 'Naming the pattern is the first half; the corpus holds the second. Ask it about the loop you recognized — the answer cites the folios it stands on, or refuses to guess.',
    examples: [
      'How do I interrupt the rescuer loop?',
      'Why does spiritual practice become performance?',
      'What does the corpus say about the controller pattern?',
    ],
  },
  codex: {
    lede: 'The codex gives the map; the archive answers in detail. Probe the corpus directly — grounded answers with citations, honest silence when the ground is thin.',
    examples: [
      'What is the difference between dhāraṇā and dhyāna?',
      'What does the corpus teach about the kuṇḍalinī ascent?',
      'How does nāḍī śuddhi prepare deeper practice?',
    ],
  },
  ask_page: {
    lede: 'Ask the corpus a question — grounded answers with citations, or an honest silence.',
    examples: [],
  },
};

export function AskTheArchiveCTA({ surface }: { surface: AskRefSource }) {
  const copy = SURFACE_COPY[surface];
  const askHref = (q?: string) =>
    q ? `/ask?ref=${surface}&q=${encodeURIComponent(q)}` : `/ask?ref=${surface}`;

  return (
    <section aria-label="Ask the archive" className="bg-deep-black border-t border-gold/10 py-16">
      <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
        <p className="section-label mb-5">ASK THE ARCHIVE</p>
        <p className="text-editorial text-sm text-foreground/70 leading-relaxed max-w-xl mx-auto">
          {copy.lede}
        </p>
        {copy.examples.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-2.5">
            {copy.examples.map((q) => (
              <Link
                key={q}
                href={askHref(q)}
                className="text-xs text-gold/80 italic transition hover:text-gold"
              >
                &ldquo;{q}&rdquo;
              </Link>
            ))}
          </div>
        )}
        <div className="mt-8">
          <Link href={askHref()} className="ghost-cta text-xs">
            Ask the corpus →
          </Link>
        </div>
      </div>
    </section>
  );
}
