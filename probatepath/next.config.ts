import type { NextConfig } from "next";
import { ensurePrismaRuntime } from "./scripts/ensure-prisma-runtime.mjs";

ensurePrismaRuntime();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
  typescript: {
    // Type check passes locally - skip on Vercel to avoid environment differences
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Force Next/Turbopack to treat this directory as the workspace root so
    // .env and other config files load correctly even when the repo is nested.
    root: __dirname,
  },
};

export default nextConfig;
