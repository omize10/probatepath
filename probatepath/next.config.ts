import type { NextConfig } from "next";
import { ensurePrismaRuntime } from "./scripts/ensure-prisma-runtime.mjs";

ensurePrismaRuntime();

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    // Force Next/Turbopack to treat this directory as the workspace root so
    // .env and other config files load correctly even when the repo is nested.
    root: __dirname,
  },
};

export default nextConfig;
