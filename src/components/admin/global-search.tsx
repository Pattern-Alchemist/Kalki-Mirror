"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// A13: Global search across all admin entities.
// Queries the server action which searches members, keys, content, consultations.

interface SearchResult {
  type: 'member' | 'key' | 'content' | 'consultation';
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Cmd/Ctrl+Shift+F to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
        setQuery("");
        setResults([]);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Search debounce
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch { /* ignore */ }
      setLoading(false);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const typeColors: Record<string, string> = {
    member: 'text-amber-400 bg-amber-500/10',
    key: 'text-emerald-400 bg-emerald-500/10',
    content: 'text-blue-400 bg-blue-500/10',
    consultation: 'text-violet-400 bg-violet-500/10',
  };

  const navigate = (href: string) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(href);
  };

  return (
    <>
      {/* Trigger button in the dashboard layout */}
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
        className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-xs text-zinc-500 transition hover:border-zinc-700 hover:text-zinc-300"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <span className="hidden sm:inline">Search entities…</span>
        <kbd className="ml-auto hidden sm:inline rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-[10px] font-mono">Ctrl Shift F</kbd>
      </button>

      {/* Search modal */}
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
          onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center border-b border-zinc-800 px-4 py-3 gap-3">
              <svg className="h-4 w-4 text-zinc-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search members, keys, content, consultations…"
                className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 outline-none"
                autoFocus
              />
              {loading && (
                <svg className="h-4 w-4 animate-spin text-zinc-500" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto py-2">
              {query && !loading && results.length === 0 && (
                <div className="px-4 py-8 text-center text-xs text-zinc-600">No results for &quot;{query}&quot;</div>
              )}
              {results.map(r => (
                <button
                  key={`${r.type}-${r.id}`}
                  onClick={() => navigate(r.href)}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition hover:bg-zinc-800"
                >
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${typeColors[r.type] || 'text-zinc-500'}`}>
                    {r.type}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-200 truncate">{r.title}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{r.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="border-t border-zinc-800 px-4 py-2 flex items-center justify-between text-[10px] text-zinc-600">
              <span>
                <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5">Esc</kbd> close
              </span>
              <span>
                <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5">Enter</kbd> open result
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
