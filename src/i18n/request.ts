import { getRequestConfig } from 'next-intl/server';

/**
 * next-intl server configuration.
 *
 * Routing strategy: NON-ROUTING (no [locale] URL prefix).
 * This preserves all existing routes and SEO structure.
 *
 * Supported locales: en, hi (extend as needed).
 * Default: en
 */
export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate the locale — fall back to 'en' if invalid
  const supportedLocales = ['en', 'hi'];
  if (!locale || !supportedLocales.includes(locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
