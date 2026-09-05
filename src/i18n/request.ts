import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

/**
 * next-intl server configuration.
 *
 * Routing strategy: NON-ROUTING (no [locale] URL prefix).
 * This preserves all existing routes and SEO structure.
 *
 * Locale resolution order:
 *   1. requestLocale (next-intl plumbing, when present)
 *   2. NEXT_LOCALE cookie — set by LocaleSwitcher on /consultations
 *   3. 'en' default
 *
 * Supported locales: en, hi (extend as needed).
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale) {
    try {
      locale = (await cookies()).get('NEXT_LOCALE')?.value;
    } catch {
      // e.g. route contexts without cookie access — fall through to default
    }
  }

  const supportedLocales = ['en', 'hi'];
  if (!locale || !supportedLocales.includes(locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
