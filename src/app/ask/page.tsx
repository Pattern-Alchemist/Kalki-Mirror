// =============================================================
// KALKI — /ASK (Vol. 4 #14 — public grounded Q&A)
// -------------------------------------------------------------
// A narrow, honest AI surface: ask the corpus a question, get an
// answer grounded in the canonical folio corpus with citations, or
// get silence. No improvisation, no invented authority.
//
// ROBOTS DECISION (per the roadmap item): NOINDEX. This is a
// utility surface over the corpus, not a content door — search
// engines get the 327 real folio pages instead of a query box.
// The API (/api/ai/ask) is already disallowed via robots.ts /api/.
// Observability: every call fires an ai_ask event (Vol. 4 #17).
// =============================================================

import type { Metadata } from 'next';
import { AskForm } from './AskForm';

export const metadata: Metadata = {
  title: 'Ask the corpus — KALKI',
  description:
    'Ask a question; receive an answer grounded in the curated folio corpus with citations — or an honest silence. No improvisation.',
  robots: { index: false, follow: false },
};

export default function AskPage() {
  return (
    <main className="mx-auto min-h-screen max-w-3xl px-5 pb-24 pt-16">
      <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">Grounded Q&amp;A</p>
      <h1 className="mt-3 font-serif text-4xl text-zinc-100">
        Ask the corpus
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
        This page answers from the curated sadhana corpus only — the same folios
        the wizard cites. Every answer carries its folio citations so you can
        verify the ground it stands on. When the corpus does not contain the
        answer, the archivist stays silent. That silence is the feature: no
        invented mantras, no improvised lineage, no borrowed authority.
      </p>
      <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-600">
        Practice-bound questions only. Nothing here is medical, psychiatric, or
        financial advice — the corpus teaches practice, not prescription.
      </p>

      <AskForm />

      <div className="mt-10 rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
          The contract
        </h2>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-zinc-400">
          <li>
            <span className="text-zinc-200">Corpus-or-silence.</span> Retrieval must clear a
            strength threshold before any synthesis is attempted; weak matches are refused,
            not guessed at.
          </li>
          <li>
            <span className="text-zinc-200">Citations or nothing.</span> The answer engine may
            only cite folios it was actually shown; a citation outside the retrieved set voids
            the answer.
          </li>
          <li>
            <span className="text-zinc-200">Public tier.</span> Questions retrieve at the
            strictest caution ladder — the same access a new seeker has. Nothing restricted
            leaks through phrasing.
          </li>
          <li>
            <span className="text-zinc-200">Cached, not re-paid.</span> Identical questions over
            identical retrievals are served from cache — the layer stays cheap by construction.
          </li>
        </ul>
      </div>
    </main>
  );
}
