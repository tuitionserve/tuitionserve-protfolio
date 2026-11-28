import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { getAdminBlogs } from "@/server/queries/blogs";
import { currentCursor, DEFAULT_PAGE_SIZE, parseCursorStack } from "@/server/domain/pagination";
import type { BlogPostStatus } from "@/server/domain/types";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { BlogRowActions } from "@/components/admin/blogs/BlogRowActions";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

function formatDate(iso: string | null): string {
  if (!iso) return "Not published yet";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminBlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; cursors?: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const params = await searchParams;
  const statusFilter: BlogPostStatus | undefined =
    params.status === "DRAFT" || params.status === "PUBLISHED" ? params.status : undefined;
  const cursorStack = parseCursorStack(params.cursors);

  const page = await getAdminBlogs(session, {
    status: statusFilter,
    cursor: currentCursor(cursorStack),
  });

  const tabs: { label: string; value?: BlogPostStatus; href: string }[] = [
    { label: "All Posts", href: "/admin/blogs" },
    { label: "Published", value: "PUBLISHED", href: "/admin/blogs?status=PUBLISHED" },
    { label: "Drafts", value: "DRAFT", href: "/admin/blogs?status=DRAFT" },
  ];

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Blog Posts</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Publish study tips, parent guides, exam advice, and announcements on the public{" "}
            <Link href="/blog" className="text-primary underline">
              /blog
            </Link>{" "}
            section.
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary font-label-md text-label-md px-4 py-2.5 rounded-lg shadow-xs hover:shadow-md transition-all"
        >
          <MaterialIcon name="add" className="text-[18px]" />
          Write Blog Post
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const active = statusFilter === tab.value;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`font-label-md text-label-md px-3.5 py-1.5 rounded-full border transition-colors ${
                active
                  ? "bg-primary-container text-on-primary border-primary-container"
                  : "bg-surface-container-lowest text-on-surface-variant border-surface-variant hover:border-primary-container"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {page.items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-xl text-center flex flex-col items-center gap-3">
          <MaterialIcon name="article" className="text-4xl text-on-surface-variant" />
          <h2 className="font-headline-sm text-headline-sm text-on-surface">No blog posts found</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[28rem]">
            Start writing your first study guide, parent resource, or Tuition Serve update.
          </p>
          <Link
            href="/admin/blogs/new"
            className="mt-1 font-label-md text-label-md bg-primary-container text-on-primary px-4 py-2 rounded-lg"
          >
            Create First Post
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {page.items.map((post) => (
            <div
              key={post.id}
              className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span
                    className={`font-label-md text-[11px] px-2.5 py-0.5 rounded-full ${
                      post.status === "PUBLISHED"
                        ? "bg-primary-container/15 text-primary"
                        : "bg-secondary-container/50 text-on-secondary-container"
                    }`}
                  >
                    {post.status === "PUBLISHED" ? "Published" : "Draft"}
                  </span>
                  <span className="font-label-md text-[11px] bg-surface-container px-2.5 py-0.5 rounded-full text-on-surface-variant">
                    {post.category}
                  </span>
                  <span className="font-mono text-xs text-on-surface-variant">{post.blogUid}</span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">{post.title}</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                  {post.excerpt}
                </p>
                <p className="font-body-sm text-xs text-on-surface-variant mt-2">
                  By {post.authorName} · {post.readTimeMinutes} min read ·{" "}
                  {post.status === "PUBLISHED" ? `Published ${formatDate(post.publishedAtIso)}` : `Updated ${formatDate(post.updatedAtIso)}`}
                </p>
              </div>
              <div className="shrink-0">
                <BlogRowActions
                  postId={post.id}
                  slug={post.slug}
                  status={post.status}
                  canEdit={post.canEdit}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <PaginationBar
        basePath="/admin/blogs"
        cursorParamName="cursors"
        cursorStack={cursorStack}
        nextCursor={page.nextCursor}
        hasNextPage={page.hasNextPage}
        itemsCount={page.items.length}
        totalCount={page.totalCount}
        pageSize={DEFAULT_PAGE_SIZE}
        extraParams={statusFilter ? { status: statusFilter } : undefined}
      />
    </div>
  );
}
