import { getAdSenseClientId, isAdUnitEnabled } from "./ads";

const DEFAULT_SITE_URL = "https://tuitionserve.com";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function organizationJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Tuition Serve",
    url: siteUrl,
    logo: absoluteUrl("/opengraph-image"),
    description:
      "Tuition Serve connects parents and schools across Nepal with verified home tutors and subject teachers.",
    email: "tuitionserve@gmail.com",
    telephone: "+977-9765269150",
    areaServed: {
      "@type": "Country",
      name: "Nepal",
    },
    sameAs: [
      process.env.NEXT_PUBLIC_FACEBOOK_URL,
      process.env.NEXT_PUBLIC_INSTAGRAM_URL,
    ].filter(Boolean),
  };
}

export function websiteJsonLd() {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Tuition Serve",
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/vacancies?subject={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqJsonLd(items: readonly { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function jobPostingJsonLd(params: {
  title: string;
  description: string;
  identifier: string;
  slug: string;
  hiringOrganizationName: string;
  locality: string;
  city: string | null;
  datePostedIso: string;
  employmentType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: params.title,
    description: params.description,
    datePosted: params.datePostedIso,
    employmentType: params.employmentType ?? "PART_TIME",
    identifier: {
      "@type": "PropertyValue",
      name: "Tuition Serve",
      value: params.identifier,
    },
    hiringOrganization: {
      "@type": "Organization",
      name: params.hiringOrganizationName,
      sameAs: getSiteUrl(),
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: params.locality,
        addressRegion: params.city ?? "Nepal",
        addressCountry: "NP",
      },
    },
    url: absoluteUrl(`/vacancies/${params.slug}`),
  };
}

export function blogPostingJsonLd(params: {
  title: string;
  excerpt: string;
  slug: string;
  category: string;
  authorName: string;
  publishedAtIso: string | null;
  updatedAtIso: string | null;
  coverImageUrl: string | null;
  tags: string[];
}) {
  const pageUrl = absoluteUrl(`/blog/${params.slug}`);
  const imageUrl = params.coverImageUrl
    ? params.coverImageUrl.startsWith("http")
      ? params.coverImageUrl
      : absoluteUrl(params.coverImageUrl)
    : absoluteUrl("/opengraph-image");

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: params.title,
    description: params.excerpt,
    articleSection: params.category,
    keywords: params.tags.join(", ") || undefined,
    image: [imageUrl],
    datePublished: params.publishedAtIso ?? params.updatedAtIso ?? undefined,
    dateModified: params.updatedAtIso ?? params.publishedAtIso ?? undefined,
    author: {
      "@type": "Person",
      name: params.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Tuition Serve",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/opengraph-image"),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl,
    },
  };
}

export { getAdSenseClientId, isAdUnitEnabled };
