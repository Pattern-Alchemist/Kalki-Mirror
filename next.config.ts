import type { NextConfig } from "next";

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
      // Long-lived cache for immutable static assets (fonts, SVGs, icons)
      {
        source: '/(.*)\\.(svg|ico|png|jpg|jpeg|webp|avif|woff2?|ttf|otf)$',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      // Next.js static chunks — versioned, immutable
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // Clean up dead-end navigation links
  async redirects() {
    return [
      { source: '/tantra', destination: '/practice', permanent: true },
      { source: '/consult', destination: '/consultations', permanent: true },
      { source: '/aghoiri-tantra', destination: '/aghori-tantra', permanent: true },
    ];
  },

  // Vercel serverless: force-include the baked corpus
  outputFileTracingIncludes: {
    "/api/**": ["./db/**/*"],
    "/api/health": ["./db/**/*"],
  },
};

export default nextConfig;
