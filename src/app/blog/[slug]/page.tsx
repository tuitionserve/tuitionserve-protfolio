import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedBlogBySlug, getRelatedPublishedBlogs } from "@/server/queries/blogs";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { CopyLinkButton } from "@/components/shared/CopyLinkButton";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { AdBanner } from "@/components/ads/AdBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { AD_SLOTS } from "@/lib/ads";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogBySlug(slug);
  if (!post) {
    return { title: "Article Not Found — Tuition Serve Blog" };
  }

  return {
    title: `${post.title} — Tuition Serve Blog`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAtIso ?? undefined,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  };
}

export default async function PublicBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPublishedBlogs(post.category, post.id, 3);

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />
      <JsonLd
        data={blogPostingJsonLd({
          title: post.title,
          excerpt: post.excerpt,
          slug: post.slug,
          category: post.category,
          authorName: post.authorName,
          publishedAtIso: post.publishedAtIso,
          updatedAtIso: post.updatedAtIso,
          coverImageUrl: post.coverImageUrl,
          tags: post.tags,
        })}
      />
      <PublicHeader active="blog" />
      <main className="flex-1 w-full bg-surface">
        <article className="w-full px-margin-mobile md:px-margin-desktop py-xl max-w-max-width mx-auto">
          <div className="max-w-3xl mx-auto flex flex-col gap-lg">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary"
              >
                <MaterialIcon name="arrow_back" className="text-[18px]" />
                Back to all articles
              </Link>
              <CopyLinkButton path={`/blog/${post.slug}`} label="Share article" />
            </div>

            <header className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/blog?category=${encodeURIComponent(post.category)}`}
                  className="font-label-md text-xs bg-primary-container/15 text-primary px-3 py-1 rounded-full hover:bg-primary-container/25 transition-colors"
                >
                  {post.category}
                </Link>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {post.readTimeMinutes} min read
                </span>
              </div>

              <h1 className="font-headline-lg text-headline-lg md:text-[2.25rem] md:leading-[1.2] text-on-surface">
                {post.title}
              </h1>

              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 text-on-surface-variant font-body-sm text-body-sm border-b border-surface-variant pb-4">
                <span className="inline-flex items-center gap-1.5 font-medium text-on-surface">
                  <MaterialIcon name="person" className="text-[18px] text-primary" />
                  {post.authorName}
                </span>
                {post.publishedAtIso && (
                  <>
                    <span>·</span>
                    <time dateTime={post.publishedAtIso}>{formatDate(post.publishedAtIso)}</time>
                  </>
                )}
              </div>
            </header>

            {post.coverImageUrl && (
              <div className="rounded-2xl overflow-hidden border border-surface-variant bg-surface-container max-h-[28rem]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.coverImageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-lg md:p-xl shadow-xs">
              <BlogContentRenderer content={post.content} />
            </div>

            <AdBanner slotId={AD_SLOTS.blogInArticle} layout="in-article" format="fluid" />

            {post.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="font-label-md text-xs text-on-surface-variant">Tags:</span>
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-body-sm text-xs bg-surface-container text-on-surface-variant px-3 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="bg-primary-container/10 border border-primary-container/30 rounded-2xl p-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Looking for personalized tuition or teaching opportunities?
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Request a vetted home tutor or explore verified teaching vacancies across Nepal.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <Link
                  href="/request-tutor"
                  className="font-label-md text-label-md bg-primary-container text-on-primary px-4 py-2.5 rounded-lg"
                >
                  Request a Tutor
                </Link>
                <Link
                  href="/vacancies"
                  className="font-label-md text-label-md border border-outline-variant bg-surface-container-lowest text-on-surface px-4 py-2.5 rounded-lg"
                >
                  Browse Vacancies
                </Link>
              </div>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="w-full px-margin-mobile md:px-margin-desktop pb-xxl max-w-max-width mx-auto">
            <div className="max-w-max-width border-t border-surface-variant pt-xl">
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-headline-md text-headline-md text-on-surface">More from Tuition Serve</h2>
                <Link href="/blog" className="font-label-md text-label-md text-primary hover:underline">
                  View all articles
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    href={`/blog/${item.slug}`}
                    className="group bg-surface-container-lowest border border-surface-variant rounded-2xl p-lg flex flex-col justify-between gap-3 hover:border-primary-container hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="self-start font-label-md text-[11px] bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full">
                        {item.category}
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        {item.excerpt}
                      </p>
                    </div>
                    <p className="font-body-sm text-xs text-on-surface-variant">
                      {item.readTimeMinutes} min read{item.publishedAtIso ? ` · ${formatDate(item.publishedAtIso)}` : ""}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <PublicFooter />
    </>
  );
}
