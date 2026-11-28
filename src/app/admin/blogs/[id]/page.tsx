import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/guards";
import { getAdminBlogById } from "@/server/queries/blogs";
import { BackButton } from "@/components/shared/BackButton";
import { BlogEditorForm } from "@/components/admin/blogs/BlogEditorForm";
import { CopyLinkButton } from "@/components/shared/CopyLinkButton";

export default async function AdminEditBlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const { id } = await params;
  const { saved } = await searchParams;

  const post = await getAdminBlogById(id, session);
  if (!post) notFound();

  return (
    <div className="max-w-3xl flex flex-col gap-lg">
      <BackButton />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`font-label-md text-[11px] px-2.5 py-0.5 rounded-full ${
                post.status === "PUBLISHED"
                  ? "bg-primary-container/15 text-primary"
                  : "bg-secondary-container/50 text-on-secondary-container"
              }`}
            >
              {post.status === "PUBLISHED" ? "Published" : "Draft"}
            </span>
            <span className="font-mono text-xs text-on-surface-variant">{post.blogUid}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Edit Blog Post</h1>
        </div>
        {post.status === "PUBLISHED" && (
          <div className="flex flex-wrap items-center gap-2">
            <CopyLinkButton path={`/blog/${post.slug}`} label="Copy Share Link" />
            <Link
              href={`/blog/${post.slug}`}
              className="font-label-md text-label-md bg-primary-container text-on-primary px-3.5 py-2 rounded-lg"
            >
              View Public Post
            </Link>
          </div>
        )}
      </div>

      {saved && (
        <div className="bg-primary-container/12 border border-primary-container rounded-xl p-4 font-body-sm text-body-sm text-on-surface">
          {saved === "published" ? "Article published and now live on the Blog." : "Draft saved successfully."}
        </div>
      )}

      <BlogEditorForm initialPost={post} readOnly={!post.canEdit} />
    </div>
  );
}
