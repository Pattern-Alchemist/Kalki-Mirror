'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

/**
 * Vol. 2 #19 — locale switcher for the wizard surface (EN | हिं).
 *
 * Non-routing i18n: the locale lives in the NEXT_LOCALE cookie and is read
 * by src/i18n/request.ts on every server render. Switching sets the cookie
 * and refreshes the server tree — NextIntlClientProvider re-receives the
 * new messages without any URL change (SEO structure untouched).
 */
export function LocaleSwitcher() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const t = useTranslations('wizard.switcher');

  const current =
    typeof document !== 'undefined' && document.cookie.match(/(?:^|;\s*)NEXT_LOCALE=([^;]+)/)?.[1] === 'hi'
      ? 'hi'
      : 'en';

  const switchTo = (locale: 'en' | 'hi') => {
    if (locale === current) return;
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => router.refresh());
  };

  return (
    <div
      className="inline-flex items-center gap-1 text-[0.6875rem] tracking-[0.15em]"
      role="group"
      aria-label={t('label')}
    >
      <button
        type="button"
        onClick={() => switchTo('en')}
        aria-pressed={current === 'en'}
        className={`px-2.5 py-1 border transition-colors ${
          current === 'en'
            ? 'border-gold text-gold'
            : 'border-zinc-700/50 text-text-muted hover:border-gold/30 hover:text-text-secondary'
        }`}
      >
        {t('en')}
      </button>
      <button
        type="button"
        onClick={() => switchTo('hi')}
        aria-pressed={current === 'hi'}
        disabled={pending}
        className={`px-2.5 py-1 border transition-colors ${
          current === 'hi'
            ? 'border-gold text-gold'
            : 'border-zinc-700/50 text-text-muted hover:border-gold/30 hover:text-text-secondary'
        }`}
      >
        {t('hi')}
      </button>
    </div>
  );
}
