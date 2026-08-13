import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

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
      "font-src 'self' https://fonts.gstatic.com",
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
  typescript: { ignoreBuildErrors: true },

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
    ];
  },

  outputFileTracingIncludes: {
    "/api/**": ["./db/**/*"],
    "/api/health": ["./db/**/*"],
  },
};

// I4: Sentry wrapper — only active when SENTRY_DSN is set
export default withSentryConfig(nextConfig, {
  silent: true,
  hideSourceMaps: true,
  disableLogger: true,
  tunnelRoute: '/monitoring-tunnel',
});
