/**
 * Typed analytics event tracker using Vercel Analytics.
 * Wraps the `track` function from @vercel/analytics.
 * Events appear in the Vercel Web Analytics dashboard.
 */

type AnalyticsEventName =
  | 'key_redeemed'
  | 'key_generated'
  | 'consultation_submitted'
  | 'practice_completed'
  | 'pattern_viewed'
  | 'siddhi_viewed'
  | 'ai_search_used'
  | 'breathwork_session'
  | 'japa_session'
  | 'quiz_completed';

export function trackEvent(name: AnalyticsEventName, properties?: Record<string, string | number>) {
  // Dynamic import to avoid bundling analytics in non-Vercel environments
  import('@vercel/analytics').then(({ track }) => {
    track(name, properties);
  }).catch(() => {
    // Analytics not available — fail silently
  });
}
