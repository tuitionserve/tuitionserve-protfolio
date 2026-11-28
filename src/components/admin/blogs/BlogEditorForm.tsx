"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BLOG_CATEGORIES } from "@/server/domain/blog-schema";
import { createBlogPost, updateBlogPost } from "@/server/actions/blogs";
import type { BlogPostAdminView } from "@/server/queries/blogs";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { CopyLinkButton } from "@/components/shared/CopyLinkButton";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import {
  errorTextClass,
  fieldWrapClass,
  inputClass,
  labelClass,
  sectionClass,
} from "@/components/public/tuition-request/formStyles";

function clientSlugify(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

export function BlogEditorForm({
  initialPost,
  readOnly = false,
}: {
  initialPost?: BlogPostAdminView;
  readOnly?: boolean;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialPost);

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialPost?.slug));
  const [category, setCategory] = useState<string>(initialPost?.category ?? BLOG_CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [tags, setTags] = useState((initialPost?.tags ?? []).join(", "));
  const [coverImageUrl, setCoverImageUrl] = useState(initialPost?.coverImageUrl ?? "");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [removeCover, setRemoveCover] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedInfo, setSavedInfo] = useState<{ slug: string; status: "DRAFT" | "PUBLISHED" } | null>(null);
  const [pending, startTransition] = useTransition();

  function handleTitleChange(val: string) {
    setTitle(val);
    if (!slugManuallyEdited) {
      setSlug(clientSlugify(val));
    }
  }

  function submitWithStatus(targetStatus: "DRAFT" | "PUBLISHED", e?: FormEvent) {
    if (e) e.preventDefault();
    if (readOnly) return;

    setError(null);
    setFieldErrors({});
    setSavedInfo(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug);
    formData.set("category", category);
    formData.set("excerpt", excerpt);
    formData.set("content", content);
    formData.set("tags", tags);
    formData.set("coverImageUrl", coverImageUrl);
    formData.set("status", targetStatus);
    if (removeCover) formData.set("removeCover", "true");
    if (coverFile) formData.set("coverFile", coverFile);

    startTransition(async () => {
      const result = initialPost
        ? await updateBlogPost(initialPost.id, formData)
        : await createBlogPost(formData);

      if (!result.ok) {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      if (!isEditing) {
        router.push(`/admin/blogs/${result.id}?saved=${targetStatus.toLowerCase()}`);
        router.refresh();
      } else {
        setSlug(result.slug);
        setCoverFile(null);
        setRemoveCover(false);
        setSavedInfo({ slug: result.slug, status: targetStatus });
        router.refresh();
      }
    });
  }

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const estMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <form onSubmit={(e) => submitWithStatus("PUBLISHED", e)} className="flex flex-col gap-6">
      {readOnly && (
        <div className="bg-surface-container border border-outline-variant rounded-xl p-4 font-body-sm text-body-sm text-on-surface-variant">
          This article was authored by <strong>{initialPost?.authorName}</strong>. Only the author or a Super
          Admin can modify or delete it.
        </div>
      )}

      {savedInfo && (
        <div className="bg-primary-container/12 border border-primary-container rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-on-surface">
            <MaterialIcon name="check_circle" filled className="text-primary-container text-xl" />
            <span className="font-body-sm text-body-sm">
              {savedInfo.status === "PUBLISHED" ? "Article published cleanly." : "Draft saved."}
            </span>
          </div>
          {savedInfo.status === "PUBLISHED" && (
            <div className="flex items-center gap-2">
              <CopyLinkButton path={`/blog/${savedInfo.slug}`} label="Copy Blog Link" />
              <Link
                href={`/blog/${savedInfo.slug}`}
                className="font-label-md text-label-md text-primary-container hover:underline px-2"
              >
                Read Live Post
              </Link>
            </div>
          )}
        </div>
      )}

      <div className={sectionClass}>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Article Details</h2>

        <div className={fieldWrapClass}>
          <label className={labelClass} htmlFor="blog-title">Headline / Title</label>
          <input
            id="blog-title"
            className={inputClass}
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="e.g., How to Choose the Right Home Tutor in Kathmandu"
            disabled={readOnly}
            required
          />
          {fieldErrors.title && <p className={errorTextClass}>{fieldErrors.title}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="blog-slug">URL Slug (SEO)</label>
            <input
              id="blog-slug"
              className={`${inputClass} font-mono text-xs`}
              value={slug}
              onChange={(e) => {
                setSlugManuallyEdited(true);
                setSlug(clientSlugify(e.target.value));
              }}
              placeholder="auto-generated-from-title"
              disabled={readOnly}
            />
            <span className="font-body-sm text-xs text-on-surface-variant">
              Public URL: /blog/{slug || "your-article-slug"}
            </span>
            {fieldErrors.slug && <p className={errorTextClass}>{fieldErrors.slug}</p>}
          </div>

          <div className={fieldWrapClass}>
            <label className={labelClass} htmlFor="blog-category">Category</label>
            <select
              id="blog-category"
              className={inputClass}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={readOnly}
            >
              {BLOG_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {fieldErrors.category && <p className={errorTextClass}>{fieldErrors.category}</p>}
          </div>
        </div>

        <div className={fieldWrapClass}>
          <label className={labelClass} htmlFor="blog-excerpt">Short Summary / Excerpt</label>
          <textarea
            id="blog-excerpt"
            rows={2}
            className={inputClass}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="A compelling 1–2 sentence summary shown on the blog index cards and search previews."
            disabled={readOnly}
            required
          />
          {fieldErrors.excerpt && <p className={errorTextClass}>{fieldErrors.excerpt}</p>}
        </div>

        <div className={fieldWrapClass}>
          <label className={labelClass} htmlFor="blog-tags">Tags (comma-separated, optional)</label>
          <input
            id="blog-tags"
            className={inputClass}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., SEE Prep, Mathematics, Parents, Kathmandu"
            disabled={readOnly}
          />
        </div>
      </div>

      <div className={sectionClass}>
        <h2 className="font-headline-sm text-headline-sm text-on-surface">Cover Image (optional)</h2>
        {initialPost?.coverImageUrl && !removeCover && (
          <div className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={initialPost.coverImageUrl}
              alt="Current blog cover"
              className="w-full max-h-56 object-cover rounded-xl border border-surface-variant"
            />
            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  setRemoveCover(true);
                  setCoverImageUrl("");
                }}
                className="self-start font-label-md text-label-md text-error hover:underline"
              >
                Remove cover image
              </button>
            )}
          </div>
        )}

        {!readOnly && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={fieldWrapClass}>
              <label className={labelClass} htmlFor="blog-cover-file">Upload image (PNG, JPG, WebP · max 3MB)</label>
              <input
                id="blog-cover-file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="font-body-sm text-body-sm text-on-surface-variant"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setCoverFile(file);
                  if (file) setRemoveCover(false);
                }}
              />
              {fieldErrors.coverFile && <p className={errorTextClass}>{fieldErrors.coverFile}</p>}
            </div>

            <div className={fieldWrapClass}>
              <label className={labelClass} htmlFor="blog-cover-url">Or paste HTTPS image URL</label>
              <input
                id="blog-cover-url"
                className={inputClass}
                value={coverImageUrl}
                onChange={(e) => {
                  setCoverImageUrl(e.target.value);
                  setRemoveCover(false);
                }}
                placeholder="https://..."
              />
              {fieldErrors.coverImageUrl && <p className={errorTextClass}>{fieldErrors.coverImageUrl}</p>}
            </div>
          </div>
        )}
      </div>

      <div className={sectionClass}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Article Content</h2>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              Supports headings (<code>##</code>, <code>###</code>), <code>**bold**</code>,{" "}
              <code>*italic*</code>, lists (<code>- item</code> / <code>1. item</code>), quotes (<code>&gt;</code>),
              and links (<code>[label](https://...)</code>). ~{estMinutes} min read ({wordCount} words).
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            className="inline-flex items-center gap-1.5 font-label-md text-label-md border border-outline-variant px-3 py-1.5 rounded-lg text-on-surface hover:border-primary-container"
          >
            <MaterialIcon name={showPreview ? "edit" : "visibility"} className="text-[16px]" />
            {showPreview ? "Edit Markdown" : "Preview Article"}
          </button>
        </div>

        {showPreview ? (
          <div className="border border-surface-variant rounded-xl p-lg bg-surface min-h-[16rem]">
            {content.trim() ? (
              <BlogContentRenderer content={content} />
            ) : (
              <p className="font-body-sm text-body-sm text-on-surface-variant italic">Nothing to preview yet.</p>
            )}
          </div>
        ) : (
          <div className={fieldWrapClass}>
            <textarea
              id="blog-content"
              rows={14}
              className={`${inputClass} font-mono text-sm leading-relaxed`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={"## Why Personalized Home Tuition Works\n\nStart writing your article here..."}
              disabled={readOnly}
              required
            />
            {fieldErrors.content && <p className={errorTextClass}>{fieldErrors.content}</p>}
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="font-body-sm text-body-sm text-error">
          {error}
        </p>
      )}

      {!readOnly && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={() => submitWithStatus("DRAFT")}
              className="border border-outline-variant bg-surface-container-lowest text-on-surface font-label-md text-label-md px-5 py-3 rounded-lg hover:border-primary-container disabled:opacity-60 cursor-pointer"
            >
              {pending ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="bg-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60 cursor-pointer"
            >
              {pending ? "Publishing..." : isEditing && initialPost?.status === "PUBLISHED" ? "Update Published Post" : "Publish Blog Post"}
            </button>
          </div>
          <Link href="/admin/blogs" className="font-label-md text-label-md text-on-surface-variant hover:text-primary">
            Back to all posts
          </Link>
        </div>
      )}
    </form>
  );
}
