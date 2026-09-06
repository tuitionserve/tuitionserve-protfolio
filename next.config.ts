import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't auto-generate AGENTS.md/CLAUDE.md on every dev/build run.
  agentRules: false,
  // The dev-tools badge sits bottom-left, right on top of the sidebar's
  // Sign Out link on every admin/tutor page — turn it off locally.
  devIndicators: false,
  // firebase-admin's auth module pulls in jwks-rsa -> jose, which ships a
  // pure-ESM build; bundling it into the serverless function output (the
  // Turbopack production build default) breaks with "require() of ES
  // Module ... not supported" at runtime. Marking firebase-admin alone
  // external isn't enough — Turbopack still traces and bundles its
  // transitive deps unless they're listed too, so jwks-rsa (and its own
  // jose dependency) need to be external as well. Only surfaced on a
  // real Vercel deploy hitting adminAuth.verifyIdToken/verifySessionCookie
  // — local dev and `next build` alone don't exercise this path the same way.
  serverExternalPackages: ["firebase-admin", "jwks-rsa", "jose"],
  // Default Server Action body limit is 1MB, which the CV (up to 5MB)
  // and profile photo (up to 3MB) uploads in onboarding.ts exceed
  // before even reaching that code's own size validation.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
