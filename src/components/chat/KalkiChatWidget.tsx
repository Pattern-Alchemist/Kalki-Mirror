'use client';

import { useState, useCallback, useRef, useEffect, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useNativeReducedMotion } from '@/hooks/useNativeReducedMotion';
import { whatsappUrl } from '@/lib/utils/whatsapp';
import { track } from '@/lib/analytics/track';

// =============================================================
// KALKI — Chat Widget (Vol. 7 ops + custom build)
// -------------------------------------------------------------
// A floating chat bubble that opens a panel with three paths:
//   1. "Ask the Archivist" — inline AI Q&A grounded in the corpus
//      (posts to /api/ai/ask, shows citations, honors honest silence)
//   2. "Talk to Kaustubh" — opens WhatsApp via existing helper
//   3. "Get the 10 Doors" — inline email capture (posts to /api/subscribe)
//
// Zero new dependencies. Uses the existing /ask AI, the existing
// WhatsApp routing, the existing email subscriber system.
// Excluded on /admin/* (gated) and /ask (redundant — /ask IS the AI).
// =============================================================

type Tab = 'ai' | 'whatsapp' | 'email';
type ChatState = 'idle' | 'loading' | 'grounded' | 'silence' | 'error';

interface AIMessage {
  role: 'user' | 'assistant';
  text: string;
  citations?: { slug: string; label: string }[];
  cached?: boolean;
  silence?: boolean;
}

const WHATSAPP_MSG = 'Hello Kaustubh, I have a question — I reached out from the KALKI chat widget.';

export function KalkiChatWidget() {
  const reduced = useNativeReducedMotion();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('ai');
  const [hasInteracted, setHasInteracted] = useState(false);

  // Vol. 8 fix: auto-open after 3s delay, but ONLY once per session
  // (the screenshots showed the widget was appearing immediately, blocking content)
  useEffect(() => {
    const seen = sessionStorage.getItem('kalki_chat_seen');
    if (!seen) {
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem('kalki_chat_seen', '1');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Exclude the widget on /admin/* (gated) and /ask (redundant — /ask IS the AI surface)
  const isAdmin = pathname?.startsWith('/admin');
  const isAskPage = pathname === '/ask';
  if (isAdmin || isAskPage) return null;

  // AI chat state
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      role: 'assistant',
      text: 'Namaste — I am the KALKI archivist. Ask me about mantras, patterns, pranayama, or any term in the corpus. I answer only from the tradition, never from the internet.',
    },
  ]);
  const [input, setInput] = useState('');
  const [chatState, setChatState] = useState<ChatState>('idle');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Email state
  const [emailInput, setEmailInput] = useState('');
  const [emailState, setEmailState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatState]);

  const handleAsk = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || chatState === 'loading') return;

    setHasInteracted(true);
    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setInput('');
    setChatState('loading');

    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setMessages((prev) => [...prev, {
          role: 'assistant',
          text: 'The archivist is taking a breath. Too many questions at once — please wait a moment and ask again.',
          silence: true,
        }]);
        setChatState('idle');
        return;
      }

      const data = await res.json();

      if (data.grounded === true) {
        const citations = (data.citations ?? []).map((c: { slug: string; section?: string }) => ({
          slug: c.slug,
          label: c.slug.replace(/-/g, ' '),
        }));
        setMessages((prev) => [...prev, {
          role: 'assistant',
          text: data.answer,
          citations,
          cached: data.cached,
        }]);
        setChatState('grounded');
        track('chat_widget_ask_grounded', { slug: citations[0]?.slug });
      } else {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          text: 'The corpus is silent on this. I will not improvise an answer — the tradition is specific about what it knows and what it does not. Try a different question, or reach out to Kaustubh directly.',
          silence: true,
        }]);
        setChatState('silence');
        track('chat_widget_ask_silence', {});
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: 'The archivist is momentarily unavailable. Please try again in a moment.',
        silence: true,
      }]);
      setChatState('error');
    }
  }, [input, chatState]);

  const handleEmail = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes('@') || emailState === 'loading') return;

    setHasInteracted(true);
    setEmailState('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setEmailState('success');
        track('chat_widget_subscribe', {});
      } else {
        setEmailState('error');
      }
    } catch {
      setEmailState('error');
    }
  }, [emailInput, emailState]);

  return (
    <>
      {/* Floating Bubble */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="bubble"
            initial={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-gold/90 to-amber-600/80 shadow-lg shadow-gold/20 flex items-center justify-center group hover:shadow-gold/40 transition-shadow"
            aria-label="Open KALKI chat"
          >
            <svg className="w-6 h-6 text-deep-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
            {!hasInteracted && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <>
          {/* Backdrop overlay — dims the background so text doesn't bleed through */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            key="panel"
            initial={reduced ? { opacity: 0 } : { y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 20, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-6 right-6 z-[60] w-[calc(100vw-3rem)] max-w-[400px] h-[520px] max-h-[calc(100vh-3rem)] bg-deep-black/95 backdrop-blur-xl rounded-2xl flex flex-col overflow-hidden border border-gold/15 shadow-2xl shadow-black/80"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gold/10 bg-deep-black/80">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gold rounded-full bindu-pulse" />
                <span className="font-mono text-xs tracking-[0.15em] uppercase text-gold-dim">KALKI ARCHIVIST</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-text-muted hover:text-foreground transition-colors"
                aria-label="Close chat"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tab Selector */}
            <div className="flex border-b border-gold/10 bg-deep-black/50">
              {([
                { id: 'ai' as const, label: 'Ask', icon: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
                { id: 'whatsapp' as const, label: 'WhatsApp', icon: 'M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21' },
                { id: 'email' as const, label: '10 Doors', icon: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' },
              ]).map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTab(t.id); setHasInteracted(true); }}
                  aria-label={t.id === 'ai' ? 'Ask the Archivist — AI Q&A grounded in the corpus' : t.id === 'whatsapp' ? 'Talk to Kaustubh on WhatsApp' : 'Get the 10 Doors email course'}
                  aria-selected={tab === t.id}
                  role="tab"
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                    tab === t.id
                      ? 'text-gold border-b-2 border-gold/50 bg-gold/5'
                      : 'text-text-muted hover:text-text-secondary border-b-2 border-transparent'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={t.icon} />
                  </svg>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {/* AI Chat Tab */}
              {tab === 'ai' && (
                <div className="flex flex-col h-full">
                  <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3" role="log" aria-label="Archivist conversation" aria-live="polite">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-gold/15 text-foreground border border-gold/20'
                              : msg.silence
                                ? 'bg-zinc-800/40 text-text-muted border border-zinc-700/30 italic'
                                : 'bg-zinc-800/60 text-text-secondary'
                          }`}
                        >
                          {msg.text}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {msg.citations.map((c, ci) => (
                                <a
                                  key={ci}
                                  href={`/archive/${c.slug}`}
                                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-gold/10 text-gold-dim hover:text-gold hover:bg-gold/20 transition-colors"
                                >
                                  <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 18l6-6-6-6" />
                                  </svg>
                                  {c.label}
                                </a>
                              ))}
                            </div>
                          )}
                          {msg.cached && (
                            <span className="block mt-1 text-[10px] text-text-muted/50">cached</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {chatState === 'loading' && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-800/60 rounded-lg px-3 py-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-gold/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="border-t border-gold/10 p-2">
                    <form onSubmit={handleAsk} className="flex gap-2">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about a mantra, pattern, or practice..."
                        className="flex-1 bg-zinc-900/80 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder-text-muted focus:border-gold/40 focus:outline-none transition-colors"
                        disabled={chatState === 'loading'}
                      />
                      <button
                        type="submit"
                        disabled={chatState === 'loading' || !input.trim()}
                        aria-label="Send question to the Archivist"
                        className="bg-gold/90 text-deep-black rounded-lg px-3 py-2 text-sm font-medium hover:bg-gold disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* WhatsApp Tab */}
              {tab === 'whatsapp' && (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-16 h-16 mb-4 rounded-full bg-[#25D366]/10 flex items-center justify-center border border-[#25D366]/20">
                    <svg className="w-8 h-8 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg text-foreground mb-2">Talk to Kaustubh</h3>
                  <p className="text-sm text-text-secondary mb-6 leading-relaxed">
                    Have a personal question? Reach out directly on WhatsApp — Kaustubh reads every message himself.
                  </p>
                  <a
                    href={whatsappUrl(WHATSAPP_MSG, { page: typeof window !== 'undefined' ? window.location.pathname : '/' })}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track('chat_widget_whatsapp_click', {})}
                    className="bg-[#25D366] text-white rounded-lg px-6 py-3 text-sm font-medium hover:bg-[#20bd5a] transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Open WhatsApp
                  </a>
                </div>
              )}

              {/* Email Tab */}
              {tab === 'email' && (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-16 h-16 mb-4 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                    <svg className="w-8 h-8 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <path d="M22 6l-10 7L2 6" />
                    </svg>
                  </div>
                  {emailState !== 'success' ? (
                    <>
                      <h3 className="font-display text-lg text-foreground mb-2">The 10 Doors</h3>
                      <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                        A free 10-day email course. One door each morning — a mantra, a pattern, a practice.
                      </p>
                      <form onSubmit={handleEmail} className="w-full max-w-[280px]">
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="your@email.com"
                          className="w-full bg-zinc-900/80 border border-zinc-700/50 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder-text-muted focus:border-gold/40 focus:outline-none transition-colors mb-3"
                          disabled={emailState === 'loading'}
                        />
                        <button
                          type="submit"
                          disabled={emailState === 'loading' || !emailInput.trim()}
                          className="w-full gold-cta text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {emailState === 'loading' ? 'Sending...' : 'Begin the Course'}
                        </button>
                        {emailState === 'error' && (
                          <p className="mt-2 text-xs text-red-400">Something went wrong. Please try again.</p>
                        )}
                      </form>
                    </>
                  ) : (
                    <motion.div
                      initial={reduced ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center"
                    >
                      <div className="w-12 h-12 mb-3 rounded-full bg-gold/15 flex items-center justify-center border border-gold/30">
                        <svg className="w-6 h-6 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                          <path d="M9 12l2 2 4-4" />
                          <circle cx="12" cy="12" r="10" />
                        </svg>
                      </div>
                      <h3 className="font-display text-lg text-foreground mb-2">Door 1 opens tomorrow</h3>
                      <p className="text-sm text-text-secondary">Check your inbox — the first door arrives with the morning light.</p>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
