import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['swisseph'],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
