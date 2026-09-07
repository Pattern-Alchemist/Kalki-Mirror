'use client';

/**
 * /ask client island (Vol. 4 #14). Posts to /api/ai/ask and renders the
 * two honest outcomes: a grounded answer with citation chips (each chip
 * links to the cited folio at /archive/[slug]) or an explicit silence.
 */

import { useState } from 'react';

interface AskCitation {
  slug: string;
  section: string;
  similarity: number;
}

type AskResponse =
  | {
      grounded: true;
      answer: string;
      citations: AskCitation[];
      model: string;
      method: string;
      cached: boolean;
    }
  | { grounded: false; reason: 'corpus_silent' | 'ungrounded_output' }
  | { error: string };

const SILENCE_COPY: Record<'corpus_silent' | 'ungrounded_output', string> = {
  corpus_silent:
    'The corpus is silent on this. No retrieved folio matched strongly enough to ground an answer — rephrase around a practice, pattern, or term the corpus teaches, or explore the archive directly.',
  ungrounded_output:
    'The archivist declined to answer. The synthesis could not be grounded in the retrieved folios with valid citations, so nothing is offered rather than something invented.',
};

export function AskForm() {
  const [query, setQuery] = useState('');
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<AskResponse | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 3 || pending) return;
    setPending(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = (await res.json()) as AskResponse;
      setResult(data);
    } catch {
      setResult({ error: 'The archivist is unreachable right now. Try again shortly.' });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-8">
      <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          maxLength={500}
          placeholder="e.g. What does the corpus teach about pranava japa?"
          aria-label="Your question for the corpus"
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-amber-500/50"
        />
        <button
          type="submit"
          disabled={pending || query.trim().length < 3}
          className="shrink-0 rounded-lg bg-amber-500/90 px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? 'Consulting…' : 'Ask'}
        </button>
      </form>

      {result && (
        <div className="mt-6" aria-live="polite">
          {'error' in result ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-5 text-sm text-rose-300">
              {result.error}
            </div>
          ) : result.grounded ? (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
              <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-200">
                {result.answer}
              </p>
              {result.citations.length > 0 && (
                <div className="mt-5 border-t border-zinc-800/60 pt-4">
                  <p className="text-[0.65rem] uppercase tracking-[0.25em] text-zinc-500">
                    Grounded in
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {result.citations.map((c) => (
                      <a
                        key={c.slug}
                        href={`/archive/${c.slug}`}
                        className="rounded-full border border-amber-500/25 bg-amber-500/5 px-3 py-1 text-xs text-amber-300 transition hover:border-amber-400/50 hover:text-amber-200"
                      >
                        {c.slug}
                        <span className="ml-1.5 text-[0.6rem] text-zinc-500">{c.section}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-4 text-[0.65rem] text-zinc-600">
                {result.cached ? 'Served from cache · ' : ''}
                {result.method === 'embedding' ? 'vector retrieval' : 'lexical retrieval'} ·
                model {result.model} · verify against the cited folios
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/20 p-6">
              <p className="text-sm leading-relaxed text-zinc-400">
                {SILENCE_COPY[result.reason]}
              </p>
              <a
                href="/archive"
                className="mt-3 inline-block text-xs text-amber-400 hover:text-amber-300"
              >
                Browse the folio archive →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
