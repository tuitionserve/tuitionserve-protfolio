import type { Metadata } from "next";
import Link from "next/link";
import { catalogLabel, GRADES, SUBJECTS } from "@/lib/catalog";
import { getPublicOpenVacancies } from "@/server/queries/public-vacancies";
import { getPublishedBlogs } from "@/server/queries/blogs";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sitemap",
  description:
    "Browse all pages, open home tuition and school teaching vacancies, and published education articles on Tuition Serve.",
  alternates: { canonical: "/sitemap" },
};

const CORE_PAGES = [
  { label: "Home", href: "/", description: "Overview of Tuition Serve home tuition services" },
  { label: "Open Vacancies", href: "/vacancies", description: "Live home tuition and school teaching openings" },
  { label: "Blog & Study Guides", href: "/blog", description: "Parent guides, study tips, and exam prep articles" },
  { label: "Request a Tutor", href: "/request-tutor", description: "Submit a home tuition requirement (no login needed)" },
  { label: "For Schools", href: "/for-schools", description: "Teacher recruitment partnerships for schools" },
  { label: "Home Tuition Rate List", href: "/price", description: "Estimated monthly tuition rates across Nepal (NPR)" },
  { label: "Courses", href: "/courses", description: "Structured courses roadmap" },
  { label: "About Us", href: "/about", description: "How Tuition Serve verifies tutors and matches requests" },
  { label: "Contact Us", href: "/contact", description: "Questions, support, and WhatsApp contact" },
  { label: "Privacy Policy", href: "/privacy-policy", description: "Data privacy, Firebase security, and advertising cookies" },
  { label: "Terms of Service", href: "/terms-of-service", description: "Platform terms and usage rules" },
  { label: "XML Sitemap", href: "/sitemap.xml", description: "Machine-readable XML sitemap for search engines" },
];

export default async function HtmlSitemapPage() {
  let vacancies: Awaited<ReturnType<typeof getPublicOpenVacancies>>["items"] = [];
  let blogs: Awaited<ReturnType<typeof getPublishedBlogs>>["items"] = [];

  try {
    const [vacPage, blogPage] = await Promise.all([
      getPublicOpenVacancies({}, null, 50),
      getPublishedBlogs({ pageSize: 50 }),
    ]);
    vacancies = vacPage.items;
    blogs = blogPage.items;
  } catch {
    // Keep rendering core navigation links gracefully even if Firestore isn't reachable.
  }

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Sitemap", path: "/sitemap" },
        ])}
      />
      <PublicHeader />
      <main className="flex-1 w-full bg-surface px-margin-mobile md:px-margin-desktop py-xl max-w-max-width mx-auto">
        <div className="max-w-4xl mx-auto flex flex-col gap-xl">
          <div>
            <span className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary bg-primary-container/12 px-3 py-1 rounded-full mb-3">
              <MaterialIcon name="account_tree" className="text-[16px]" />
              Directory
            </span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Tuition Serve Sitemap</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Quick links to every public section, active teaching vacancy, and published guide on{" "}
              <span className="text-on-surface font-medium">tuitionserve.com</span>.
            </p>
          </div>

          <section className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Main Pages</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {CORE_PAGES.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded-xl border border-surface-variant p-3.5 hover:border-primary-container transition-colors"
                  >
                    <div className="font-label-md text-label-md text-primary">{item.label}</div>
                    <div className="font-body-sm text-xs text-on-surface-variant mt-0.5">{item.description}</div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-lg">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Open Vacancies ({vacancies.length})
              </h2>
              <Link href="/vacancies" className="font-label-md text-xs text-primary hover:underline">
                View all vacancies
              </Link>
            </div>
            {vacancies.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                No open vacancies listed right now. Visit{" "}
                <Link href="/vacancies" className="text-primary underline">
                  /vacancies
                </Link>{" "}
                for live updates.
              </p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {vacancies.map((v) => {
                  const gradeText = (v.gradeIds && v.gradeIds.length > 0 ? v.gradeIds : [v.gradeId])
                    .map((g) => catalogLabel(GRADES, g))
                    .join(", ");
                  const subjectText = v.subjectIds.map((s) => catalogLabel(SUBJECTS, s)).join(", ");
                  return (
                    <li key={v.id}>
                      <Link
                        href={`/vacancies/${v.slug}`}
                        className="block rounded-lg px-3 py-2 border border-surface-variant hover:border-primary-container font-body-sm text-body-sm text-on-surface"
                      >
                        <span className="text-primary font-medium">
                          {v.postingType === "SCHOOL" && v.institutionName
                            ? `${v.institutionName} — ${subjectText}`
                            : `${gradeText} ${subjectText}`}
                        </span>
                        <span className="block text-xs text-on-surface-variant">
                          {v.tuitionUid} · {v.tutorVisibleLocality}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-lg">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Blog Articles ({blogs.length})
              </h2>
              <Link href="/blog" className="font-label-md text-xs text-primary hover:underline">
                View all articles
              </Link>
            </div>
            {blogs.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                No articles published yet. Visit{" "}
                <Link href="/blog" className="text-primary underline">
                  /blog
                </Link>{" "}
                soon.
              </p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {blogs.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="block rounded-lg px-3 py-2 border border-surface-variant hover:border-primary-container font-body-sm text-body-sm text-on-surface"
                    >
                      <span className="text-primary font-medium">{post.title}</span>
                      <span className="block text-xs text-on-surface-variant">
                        {post.category} · {post.readTimeMinutes} min read
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
