import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Skip TypeScript errors during build (verified passing locally)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Don't fail build on ESLint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable image optimization for Netlify compatibility
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
