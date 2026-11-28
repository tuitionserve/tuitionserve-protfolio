"use server";

import { revalidatePath } from "next/cache";
import { FieldValue } from "firebase-admin/firestore";
import { requireRole } from "@/server/auth/guards";
import type { AuthSession } from "@/server/auth/session";
import { blogPostsCollection } from "@/server/domain/collections";
import { generateSequentialUid } from "@/server/domain/ids";
import { buildBlogSlug } from "@/server/domain/slug";
import { blogPostSchema, estimateReadTimeMinutes } from "@/server/domain/blog-schema";
import { deleteBlogCoverByUrl, InvalidDocumentError, uploadBlogCoverImage } from "@/server/domain/documents";
import { writeAuditEvent } from "@/server/domain/audit";
import { fieldErrorsFrom } from "@/server/actions/action-utils";
import type { BlogPost, BlogPostStatus } from "@/server/domain/types";

export type BlogActionResult =
  | { ok: true; id: string; slug: string; blogUid: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type BlogSimpleResult =
  | { ok: true }
  | { ok: false; error: string };

function canManageBlogPost(post: BlogPost, session: AuthSession): boolean {
  return session.role === "SUPER_ADMIN" || post.authorUserId === session.uid;
}

function parseTags(raw: FormDataEntryValue | null): string[] {
  const str = String(raw ?? "");
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of str.split(",")) {
    const clean = part.trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
    if (out.length >= 8) break;
  }
  return out;
}

async function resolveUniqueBlogSlug(rawTitleOrSlug: string, excludePostId?: string): Promise<string> {
  const base = buildBlogSlug(rawTitleOrSlug);
  const firstSnap = await blogPostsCollection().where("slug", "==", base).limit(1).get();
  if (firstSnap.empty || firstSnap.docs[0]!.id === excludePostId) {
    return base;
  }

  for (let suffix = 2; suffix <= 20; suffix++) {
    const candidate = `${base}-${suffix}`;
    const snap = await blogPostsCollection().where("slug", "==", candidate).limit(1).get();
    if (snap.empty || snap.docs[0]!.id === excludePostId) {
      return candidate;
    }
  }
  return `${base}-${Date.now().toString(36)}`;
}

async function resolveCoverImageFromForm(
  formData: FormData,
  existingCoverUrl: string | null,
): Promise<{ ok: true; url: string | null; replacedOldUrl: string | null } | { ok: false; error: string }> {
  const removeCover = String(formData.get("removeCover") ?? "") === "true";
  const coverFile = formData.get("coverFile");

  if (coverFile instanceof File && coverFile.size > 0) {
    try {
      const arrayBuffer = await coverFile.arrayBuffer();
      const uploadedUrl = await uploadBlogCoverImage({
        buffer: Buffer.from(arrayBuffer),
        mimeType: coverFile.type,
        originalFileName: coverFile.name,
      });
      return {
        ok: true,
        url: uploadedUrl,
        replacedOldUrl: existingCoverUrl,
      };
    } catch (err) {
      if (err instanceof InvalidDocumentError) {
        return { ok: false, error: err.message };
      }
      return { ok: false, error: "Could not upload the cover image right now." };
    }
  }

  if (removeCover) {
    return { ok: true, url: null, replacedOldUrl: existingCoverUrl };
  }

  const rawUrl = String(formData.get("coverImageUrl") ?? "").trim();
  if (!rawUrl) {
    return {
      ok: true,
      url: null,
      replacedOldUrl: existingCoverUrl && existingCoverUrl !== rawUrl ? existingCoverUrl : null,
    };
  }
  return {
    ok: true,
    url: rawUrl,
    replacedOldUrl: existingCoverUrl && existingCoverUrl !== rawUrl ? existingCoverUrl : null,
  };
}

export async function createBlogPost(formData: FormData): Promise<BlogActionResult> {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const parsed = blogPostSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || "",
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    category: formData.get("category"),
    tags: parseTags(formData.get("tags")),
    coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim() || null,
    status: formData.get("status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const coverResult = await resolveCoverImageFromForm(formData, null);
  if (!coverResult.ok) {
    return {
      ok: false,
      error: coverResult.error,
      fieldErrors: { coverFile: coverResult.error },
    };
  }

  const data = parsed.data;
  const blogUid = await generateSequentialUid("blog");
  const slug = await resolveUniqueBlogSlug(data.slug || data.title);
  const now = FieldValue.serverTimestamp();
  const isPublished = data.status === "PUBLISHED";
  const authorName = session.fullName?.trim() || session.email || "Tuition Serve Team";
  const readTimeMinutes = estimateReadTimeMinutes(data.content);

  const ref = blogPostsCollection().doc();
  await ref.set({
    id: ref.id,
    blogUid,
    title: data.title,
    slug,
    excerpt: data.excerpt,
    content: data.content,
    category: data.category,
    tags: data.tags,
    coverImageUrl: coverResult.url,
    status: data.status,
    authorUserId: session.uid,
    authorName,
    readTimeMinutes,
    publishedAt: isPublished ? now : null,
    createdAt: now,
    updatedAt: now,
  } as never);

  await writeAuditEvent({
    action: "BLOG_POST_CREATED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "BlogPost",
    targetId: ref.id,
    metadata: { blogUid, slug, status: data.status, category: data.category },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blogs");

  return { ok: true, id: ref.id, slug, blogUid };
}

export async function updateBlogPost(postId: string, formData: FormData): Promise<BlogActionResult> {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const ref = blogPostsCollection().doc(postId);
  const snap = await ref.get();
  if (!snap.exists) {
    return { ok: false, error: "Blog post not found." };
  }
  const existing = snap.data()!;
  if (!canManageBlogPost(existing, session)) {
    return { ok: false, error: "You can only edit blog posts that you created." };
  }

  const parsed = blogPostSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") || "",
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    category: formData.get("category"),
    tags: parseTags(formData.get("tags")),
    coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim() || null,
    status: formData.get("status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error),
    };
  }

  const coverResult = await resolveCoverImageFromForm(formData, existing.coverImageUrl ?? null);
  if (!coverResult.ok) {
    return {
      ok: false,
      error: coverResult.error,
      fieldErrors: { coverFile: coverResult.error },
    };
  }

  const data = parsed.data;
  const slug = await resolveUniqueBlogSlug(data.slug || data.title, postId);
  const readTimeMinutes = estimateReadTimeMinutes(data.content);
  const now = FieldValue.serverTimestamp();
  const nextPublishedAt =
    data.status === "PUBLISHED" ? (existing.publishedAt ?? now) : null;

  await ref.update({
    title: data.title,
    slug,
    excerpt: data.excerpt,
    content: data.content,
    category: data.category,
    tags: data.tags,
    coverImageUrl: coverResult.url,
    status: data.status,
    readTimeMinutes,
    publishedAt: nextPublishedAt,
    updatedAt: now,
  });

  if (coverResult.replacedOldUrl) {
    await deleteBlogCoverByUrl(coverResult.replacedOldUrl);
  }

  await writeAuditEvent({
    action: "BLOG_POST_UPDATED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "BlogPost",
    targetId: postId,
    metadata: { blogUid: existing.blogUid, slug, status: data.status },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/admin/blogs");
  revalidatePath(`/admin/blogs/${postId}`);

  return { ok: true, id: postId, slug, blogUid: existing.blogUid };
}

export async function toggleBlogPostStatus(
  postId: string,
  nextStatus: BlogPostStatus,
): Promise<BlogSimpleResult> {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const ref = blogPostsCollection().doc(postId);
  const snap = await ref.get();
  if (!snap.exists) {
    return { ok: false, error: "Blog post not found." };
  }
  const existing = snap.data()!;
  if (!canManageBlogPost(existing, session)) {
    return { ok: false, error: "You can only update blog posts that you created." };
  }

  const now = FieldValue.serverTimestamp();
  await ref.update({
    status: nextStatus,
    publishedAt: nextStatus === "PUBLISHED" ? (existing.publishedAt ?? now) : null,
    updatedAt: now,
  });

  await writeAuditEvent({
    action: "BLOG_POST_STATUS_CHANGED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "BlogPost",
    targetId: postId,
    metadata: { blogUid: existing.blogUid, status: nextStatus },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
  revalidatePath("/admin/blogs");
  revalidatePath(`/admin/blogs/${postId}`);

  return { ok: true };
}

export async function deleteBlogPost(postId: string): Promise<BlogSimpleResult> {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const ref = blogPostsCollection().doc(postId);
  const snap = await ref.get();
  if (!snap.exists) {
    return { ok: false, error: "Blog post not found." };
  }
  const existing = snap.data()!;
  if (!canManageBlogPost(existing, session)) {
    return { ok: false, error: "You can only delete blog posts that you created." };
  }

  await ref.delete();
  await deleteBlogCoverByUrl(existing.coverImageUrl ?? null);

  await writeAuditEvent({
    action: "BLOG_POST_DELETED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "BlogPost",
    targetId: postId,
    metadata: { blogUid: existing.blogUid, slug: existing.slug },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${existing.slug}`);
  revalidatePath("/admin/blogs");

  return { ok: true };
}
