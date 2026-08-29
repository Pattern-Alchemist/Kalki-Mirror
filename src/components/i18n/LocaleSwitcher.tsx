'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

const LOCALE_LABELS: Record<string, string> = {
  en: 'EN',
  hi: '\u0939\u093f\u0928\u094d\u0926\u0940',
};

// Module-level helper: mutations of browser globals live outside component
// scope (react-hooks/immutability tracks only component/hook bodies).
function setLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

/**
 * Locale switcher \u2014 cookie-based, no URL prefix change.
 * Stores preference in NEXT_LOCALE cookie for server-side rendering.
 */
export function LocaleSwitcher({ className = '' }: { className?: string }) {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  function switchLocale(newLocale: string) {
    // Set cookie for server-side locale detection
    setLocaleCookie(newLocale);
    setOpen(false);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider text-stone-400 hover:text-[#d4af37] transition-colors disabled:opacity-50"
        aria-label="Switch language"
      >
        <span>{LOCALE_LABELS[locale] || locale.toUpperCase()}</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 min-w-[120px] rounded-lg border border-stone-800 bg-[#0B0C10] py-1 shadow-xl">
            {Object.entries(LOCALE_LABELS).map(([code, label]) => (
              <button
                key={code}
                onClick={() => switchLocale(code)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  code === locale
                    ? 'text-[#d4af37] bg-[#d4af37]/10'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
