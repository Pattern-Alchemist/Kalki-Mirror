import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,

  // ── Vercel serverless: force-include the baked corpus ──────────────
  // The Node File Tracer (nft) often misses non-code assets read via
  // dynamic paths.  static-db.ts resolves db/custom.db at runtime —
  // without this, the .db file vanishes from the deployment bundle
  // and getCorpusStats() returns 0 chunks on the deployed URL.
  outputFileTracingIncludes: {
    "/api/**": ["./db/**/*"],
    "/api/health": ["./db/**/*"],
  },
};

export default nextConfig;
