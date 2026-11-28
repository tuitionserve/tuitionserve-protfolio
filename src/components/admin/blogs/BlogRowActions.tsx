"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteBlogPost, toggleBlogPostStatus } from "@/server/actions/blogs";
import type { BlogPostStatus } from "@/server/domain/types";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function BlogRowActions({
  postId,
  slug,
  status,
  canEdit,
}: {
  postId: string;
  slug: string;
  status: BlogPostStatus;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    const nextStatus: BlogPostStatus = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    startTransition(async () => {
      const res = await toggleBlogPostStatus(postId, nextStatus);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  function handleDelete() {
    if (typeof window !== "undefined" && !window.confirm("Delete this blog post permanently?")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deleteBlogPost(postId);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center gap-2">
        {status === "PUBLISHED" && (
          <Link
            href={`/blog/${slug}`}
            className="font-label-md text-xs border border-outline-variant px-2.5 py-1.5 rounded-lg text-on-surface hover:border-primary-container inline-flex items-center gap-1"
          >
            <MaterialIcon name="open_in_new" className="text-[14px]" />
            View
          </Link>
        )}
        <Link
          href={`/admin/blogs/${postId}`}
          className="font-label-md text-xs border border-outline-variant px-2.5 py-1.5 rounded-lg text-on-surface hover:border-primary-container inline-flex items-center gap-1"
        >
          <MaterialIcon name={canEdit ? "edit" : "visibility"} className="text-[14px]" />
          {canEdit ? "Edit" : "Inspect"}
        </Link>
        {canEdit && (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={handleToggle}
              className="font-label-md text-xs border border-primary-container text-primary px-2.5 py-1.5 rounded-lg hover:bg-primary-container/10 disabled:opacity-50 cursor-pointer"
            >
              {status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={handleDelete}
              className="font-label-md text-xs border border-error/40 text-error px-2.5 py-1.5 rounded-lg hover:bg-error-container/20 disabled:opacity-50 cursor-pointer"
            >
              Delete
            </button>
          </>
        )}
      </div>
      {error && <p className="font-body-sm text-xs text-error">{error}</p>}
    </div>
  );
}
