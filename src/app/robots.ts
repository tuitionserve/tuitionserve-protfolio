import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/vacancies/", "/blog/", "/api/media/", "/ads.txt"],
        disallow: [
          "/tutor/",
          "/admin/",
          "/api/",
          "/login",
          "/register",
          "/suspended",
          "/access-denied",
          "/change-password-required",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
