import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_CATEGORIES } from "@/server/domain/blog-schema";
import { getPublishedBlogs } from "@/server/queries/blogs";
import { currentCursor, parseCursorStack } from "@/server/domain/pagination";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { AdBanner } from "@/components/ads/AdBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { AD_SLOTS } from "@/lib/ads";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog & Learning Guides",
  description:
    "Study tips, parent hiring guides, tutor best practices, and education insights from Tuition Serve Nepal.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog & Learning Guides — Tuition Serve",
    description:
      "Study tips, parent hiring guides, tutor best practices, and education insights from Tuition Serve Nepal.",
    type: "website",
  },
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const BLOG_PAGE_SIZE = 9;

export default async function PublicBlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; cursors?: string }>;
}) {
  const params = await searchParams;
  const selectedCategory = BLOG_CATEGORIES.includes(params.category as (typeof BLOG_CATEGORIES)[number])
    ? params.category
    : undefined;
  const cursorStack = parseCursorStack(params.cursors);

  const page = await getPublishedBlogs({
    category: selectedCategory,
    cursor: currentCursor(cursorStack),
    pageSize: BLOG_PAGE_SIZE,
  });

  const isFirstUnfilteredPage = !selectedCategory && cursorStack.length === 0;
  const featuredPost = isFirstUnfilteredPage && page.items.length > 0 ? page.items[0]! : null;
  const gridPosts = featuredPost ? page.items.slice(1) : page.items;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <PublicHeader active="blog" />
      <main className="flex-1 w-full bg-surface">
        <section className="w-full px-margin-mobile md:px-margin-desktop pt-xl pb-lg max-w-max-width mx-auto">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary bg-primary-container/12 px-3 py-1 rounded-full mb-3">
              <MaterialIcon name="auto_stories" className="text-[16px]" />
              Tuition Serve Editorial
            </span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Insights, Study Guides &amp; Education Updates
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Practical resources for parents choosing home tutors, teachers growing their craft, and students
              preparing for board and entrance exams across Nepal.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mt-6">
            <Link
              href="/blog"
              className={`font-label-md text-label-md px-4 py-2 rounded-full border transition-colors ${
                !selectedCategory
                  ? "bg-primary-container text-on-primary border-primary-container"
                  : "bg-surface-container-lowest text-on-surface-variant border-surface-variant hover:border-primary-container"
              }`}
            >
              All Articles
            </Link>
            {BLOG_CATEGORIES.map((category) => {
              const active = selectedCategory === category;
              return (
                <Link
                  key={category}
                  href={`/blog?category=${encodeURIComponent(category)}`}
                  className={`font-label-md text-label-md px-4 py-2 rounded-full border transition-colors ${
                    active
                      ? "bg-primary-container text-on-primary border-primary-container"
                      : "bg-surface-container-lowest text-on-surface-variant border-surface-variant hover:border-primary-container"
                  }`}
                >
                  {category}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="w-full px-margin-mobile md:px-margin-desktop pb-xxl max-w-max-width mx-auto flex flex-col gap-xl">
          <AdBanner slotId={AD_SLOTS.blogTop} />
          {page.items.length === 0 ? (
            <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-xl text-center flex flex-col items-center gap-3">
              <MaterialIcon name="menu_book" className="text-4xl text-on-surface-variant" />
              <h2 className="font-headline-sm text-headline-sm text-on-surface">No articles published yet</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[30rem]">
                {selectedCategory
                  ? `There are no articles in "${selectedCategory}" yet. Try viewing all categories.`
                  : "Our editorial team is preparing helpful guides for parents and tutors. Check back soon."}
              </p>
              {selectedCategory && (
                <Link
                  href="/blog"
                  className="mt-1 font-label-md text-label-md bg-primary-container text-on-primary px-4 py-2 rounded-lg"
                >
                  View All Articles
                </Link>
              )}
            </div>
          ) : (
            <>
              {featuredPost && (
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group bg-surface-container-lowest border border-surface-variant rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 hover:border-primary-container hover:shadow-md transition-all"
                >
                  <div className="lg:col-span-6 bg-surface-container min-h-[15rem] lg:min-h-[21rem] flex items-center justify-center overflow-hidden">
                    {featuredPost.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={featuredPost.coverImageUrl}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-container/20 via-secondary-container/20 to-tertiary-container/20 flex items-center justify-center p-8">
                        <MaterialIcon name="article" className="text-6xl text-primary/60" />
                      </div>
                    )}
                  </div>
                  <div className="lg:col-span-6 p-xl flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-label-md text-[11px] bg-primary-container/15 text-primary px-2.5 py-0.5 rounded-full">
                          Featured
                        </span>
                        <span className="font-label-md text-[11px] bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full">
                          {featuredPost.category}
                        </span>
                      </div>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="font-body-md text-body-md text-on-surface-variant line-clamp-3">
                        {featuredPost.excerpt}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 pt-4 border-t border-surface-variant">
                      <div className="font-body-sm text-body-sm text-on-surface-variant">
                        <span className="font-medium text-on-surface">{featuredPost.authorName}</span>
                        {featuredPost.publishedAtIso && ` · ${formatDate(featuredPost.publishedAtIso)}`}
                        {` · ${featuredPost.readTimeMinutes} min read`}
                      </div>
                      <span className="font-label-md text-label-md text-primary-container inline-flex items-center gap-1 shrink-0">
                        Read article
                        <MaterialIcon name="arrow_forward" className="text-[16px]" />
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              {gridPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {gridPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group bg-surface-container-lowest border border-surface-variant rounded-2xl overflow-hidden flex flex-col hover:border-primary-container hover:shadow-md transition-all"
                    >
                      <div className="h-48 bg-surface-container overflow-hidden flex items-center justify-center">
                        {post.coverImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.coverImageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-container/15 to-secondary-container/25 flex items-center justify-center">
                            <MaterialIcon name="auto_stories" className="text-4xl text-primary/55" />
                          </div>
                        )}
                      </div>
                      <div className="p-lg flex-1 flex flex-col justify-between gap-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-label-md text-[11px] bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full">
                              {post.category}
                            </span>
                            <span className="font-body-sm text-xs text-on-surface-variant">
                              {post.readTimeMinutes} min read
                            </span>
                          </div>
                          <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-surface-variant flex items-center justify-between gap-2 text-xs text-on-surface-variant">
                          <span>{post.authorName}</span>
                          <span>{formatDate(post.publishedAtIso)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          <PaginationBar
            basePath="/blog"
            cursorParamName="cursors"
            cursorStack={cursorStack}
            nextCursor={page.nextCursor}
            hasNextPage={page.hasNextPage}
            itemsCount={page.items.length}
            totalCount={page.totalCount}
            pageSize={BLOG_PAGE_SIZE}
            extraParams={selectedCategory ? { category: selectedCategory } : undefined}
          />
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
