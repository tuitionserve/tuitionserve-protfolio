import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't auto-generate AGENTS.md/CLAUDE.md on every dev/build run.
  agentRules: false,
  // firebase-admin's auth module pulls in jwks-rsa -> jose, which ships a
  // pure-ESM build; bundling it into the serverless function output (the
  // Turbopack production build default) breaks with "require() of ES
  // Module ... not supported" at runtime. Keeping it external lets
  // Node's own module resolution (which handles ESM/CJS interop
  // correctly) load it instead of the bundler.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
