'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import Link from 'next/link';
import { fadeInUp } from '@/lib/motion/tokens';
import { AIIdleMessage } from '@/components/ui/AIIdleMessage';

interface SearchResult {
  slug: string;
  name: string;
  relevance: string;
}

type SearchState = 'idle' | 'searching' | 'results' | 'error' | 'unconfigured';

export function AISearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [state, setState] = useState<SearchState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = useNativeReducedMotion();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setState('idle'); setResults([]); return; }
    setState('searching');
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, limit: 6 }),
      });
      const data = await res.json();
      if (res.status === 503) { setState('unconfigured'); return; }
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setResults(data.results || []);
      setState('results');
    } catch (err) {
      setState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Search failed');
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(v), 600);
  }, [search]);

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  return (
    <div className="relative">
      <div className="relative">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Ask YANTRA: what siddhi helps with anxiety?"
          className="w-full bg-surface/50 border border-gold/15 rounded-sm pl-11 pr-10 py-3.5 text-foreground placeholder:text-text-muted/60 focus:outline-none focus:border-gold/30 font-body text-sm transition-colors duration-500"
          aria-label="AI-powered semantic search"
        />
        {state === 'searching' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {state === 'results' && results.length > 0 && (
          <motion.div
            initial={reduced ? { opacity: 1 } : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 glass-panel p-2 max-h-80 overflow-y-auto"
          >
            {results.map((r) => (
              <Link
                key={r.slug}
                href={`/archive/${r.slug}`}
                className="block p-3 rounded-sm hover:bg-surface/50 transition-colors group"
                onClick={() => { setState('idle'); setQuery(''); }}
              >
                <p className="text-sm text-foreground group-hover:text-gold transition-colors">{r.name}</p>
                <p className="text-xs text-text-muted mt-1 line-clamp-2">{r.relevance}</p>
              </Link>
            ))}
          </motion.div>
        )}
        {state === 'error' && (
          <motion.p initial={reduced ? { opacity: 1 } : fadeInUp.hidden} animate={fadeInUp.visible} className="mt-2 text-xs text-crimson">{errorMsg}</motion.p>
        )}
        {state === 'unconfigured' && <AIIdleMessage className="mt-2">AI engine calibrating. Use the filter search above.</AIIdleMessage>}
      </AnimatePresence>
    </div>
  );
}
