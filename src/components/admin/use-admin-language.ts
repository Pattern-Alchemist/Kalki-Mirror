'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// =============================================================
// VOL. 2 #19 — Admin language toggle
// -------------------------------------------------------------
// Persists the founder's preferred admin language in localStorage.
// Defaults to 'en'. The /hi/admin route redirects to /admin?lang=hi
// which this hook reads on first load, sets the language, then
// strips the query param from the URL.
// =============================================================

export type AdminLanguage = 'en' | 'hi';

const STORAGE_KEY = 'kalki-admin-lang';

export function useAdminLanguage(): {
  lang: AdminLanguage;
  setLang: (l: AdminLanguage) => void;
  toggle: () => void;
} {
  const [lang, setLangState] = useState<AdminLanguage>('en');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Check for ?lang=hi query param (set by /hi/admin redirect)
    const queryLang = searchParams?.get('lang');
    if (queryLang === 'hi' || queryLang === 'en') {
      setLangState(queryLang);
      try { localStorage.setItem(STORAGE_KEY, queryLang); } catch { /* ignore */ }
      // Strip the param from the URL so it doesn't linger
      const sp = new URLSearchParams(searchParams.toString());
      sp.delete('lang');
      const qs = sp.toString();
      router.replace(qs ? `/admin?${qs}` : '/admin');
      return;
    }
    // Otherwise read from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as AdminLanguage | null;
      if (stored === 'en' || stored === 'hi') {
        setLangState(stored);
      }
    } catch { /* ignore */ }
  }, [searchParams, router]);

  const setLang = useCallback((l: AdminLanguage) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => {
    setLangState(prev => {
      const next = prev === 'en' ? 'hi' : 'en';
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
      return next;
    });
  }, []);

  return { lang, setLang, toggle };
}
