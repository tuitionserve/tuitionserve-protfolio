import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

// Only public, unauthenticated pages belong here — /tutor and /admin
// routes require a session and are excluded from robots.ts too.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/request-tutor`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
