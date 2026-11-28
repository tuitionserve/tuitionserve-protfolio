import type { MetadataRoute } from "next";
import { getPublicOpenVacancies } from "@/server/queries/public-vacancies";
import { getPublishedBlogs } from "@/server/queries/blogs";
import { getSiteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

// Only public, unauthenticated pages belong here — /tutor and /admin
// routes require a session and are excluded from robots.ts too.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/vacancies`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/request-tutor`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteUrl}/for-schools`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/courses`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/price`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/sitemap`, lastModified: new Date(), changeFrequency: "daily", priority: 0.5 },
    { url: `${siteUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}/terms-of-service`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const [vacanciesPage, blogsPage] = await Promise.all([
      getPublicOpenVacancies({}, null, 200),
      getPublishedBlogs({ pageSize: 200 }),
    ]);

    const vacancyEntries: MetadataRoute.Sitemap = vacanciesPage.items.map((v) => ({
      url: `${siteUrl}/vacancies/${v.slug}`,
      lastModified: v.updatedAtIso
        ? new Date(v.updatedAtIso)
        : v.createdAtIso
          ? new Date(v.createdAtIso)
          : new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    const blogEntries: MetadataRoute.Sitemap = blogsPage.items.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: post.updatedAtIso
        ? new Date(post.updatedAtIso)
        : post.publishedAtIso
          ? new Date(post.publishedAtIso)
          : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticEntries, ...vacancyEntries, ...blogEntries];
  } catch {
    return staticEntries;
  }
}
