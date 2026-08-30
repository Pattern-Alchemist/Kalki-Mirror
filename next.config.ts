import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.vercel-insights.com",
      "media-src 'self' blob: https://res.cloudinary.com",
      "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
      "connect-src 'self' https://res.cloudinary.com https://vitals.vercel-insights.com https://va.vercel-scripts.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
    ].join('; '),
  },
  {
    key: 'Access-Control-Allow-Origin',
    value: 'https://www.astrokalki.com',
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  reactStrictMode: true,
  // TypeScript errors now fail the build — the admin-dashboard type debt
  // that motivated this mask was fully repaid in this release.
  // typescript: { ignoreBuildErrors: true },
  poweredByHeader: false,

  // Security & performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Long-lived cache for immutable static assets
      {
        source: '/(.*)\\.(svg|ico|png|jpg|jpeg|webp|avif|woff2?|ttf|otf)$',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // HTML pages — short TTL with stale-while-revalidate for ISR/SSR freshness
      // Vercel CDN handles this natively, but explicit headers ensure correct
      // behavior on other CDNs and during local development.
      {
        source: '/((?!api|admin|_next|favicon|manifest|robots|sitemap|.*\\.).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
      // API routes — no store, always revalidate
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },

  async redirects() {
    return [
      { source: '/tantra', destination: '/practice', permanent: true },
      { source: '/consult', destination: '/consultations', permanent: true },
      { source: '/aghoiri-tantra', destination: '/aghori-tantra', permanent: true },
      // Canonicalization (GEO Phase 1): /deities and /archetypes previously
      // served duplicate pantheon content. Route-level permanent redirects emit
      // true HTTP 308s (edge-handled on Vercel) — rendering-level redirects are
      // unreliable here because the root loading.tsx Suspense boundary commits
      // a 200 shell before the page renders.
      { source: '/deities', destination: '/archetypes', permanent: true },
    ];
  },

  // Google Search Console HTML-file verification: expose the env-backed
  // verification file at /google<token>.html (docs/geo/search-console-us-
  // targeting.md). Path-param destination — Next 16 does not interpolate
  // params into query-string destinations. The route is fail-closed:
  // without GSC_VERIFICATION_TOKEN configured, every path 404s normally.
  async rewrites() {
    return [
      { source: '/google:token.html', destination: '/api/gsc-verification/:token' },
    ];
  },

  outputFileTracingIncludes: {
    "/api/**": ["./db/**/*"],
    "/api/health": ["./db/**/*"],
  },
};

// I4: Sentry wrapper — only active when SENTRY_DSN is set
export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  // hideSourceMaps renamed to hideSourceMaps in newer SDK versions.
  // Source maps are disabled via sourcemaps.disable above.
  disableLogger: true,
  tunnelRoute: '/monitoring-tunnel',

  // Webpack plugin configuration for production source map uploads & performance
  sourcemaps: {
    // Disable automatic source map uploads in development
    disable: process.env.NODE_ENV !== 'production',
  },

  // Webpack plugin configuration is handled by @sentry/nextjs automatically.
  // Custom webpack config removed to avoid type incompatibility with SentryBuildWebpackOptions.

  // Automatic instrumentation options
  automaticVercelMonitors: false,

  // Suppress duplicate warnings in dev
  // @ts-expect-error suppressErrors available at runtime but not in types
  suppressErrors: true as any,
});
