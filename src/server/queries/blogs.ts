import { blogPostsCollection } from "@/server/domain/collections";
import { DEFAULT_PAGE_SIZE, fetchPage, type PageResult } from "@/server/domain/pagination";
import type { BlogPost, BlogPostStatus } from "@/server/domain/types";
import type { AuthSession } from "@/server/auth/session";

export interface BlogPostPublicView {
  id: string;
  blogUid: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  coverImageUrl: string | null;
  authorName: string;
  readTimeMinutes: number;
  publishedAtIso: string | null;
  updatedAtIso: string | null;
}

export interface BlogPostAdminView extends BlogPostPublicView {
  status: BlogPostStatus;
  authorUserId: string;
  createdAtIso: string | null;
  canEdit: boolean;
}

function toPublicView(doc: BlogPost): BlogPostPublicView {
  return {
    id: doc.id,
    blogUid: doc.blogUid,
    title: doc.title,
    slug: doc.slug,
    excerpt: doc.excerpt,
    content: doc.content,
    category: doc.category,
    tags: doc.tags ?? [],
    coverImageUrl: doc.coverImageUrl ?? null,
    authorName: doc.authorName,
    readTimeMinutes: doc.readTimeMinutes,
    publishedAtIso: doc.publishedAt ? doc.publishedAt.toDate().toISOString() : null,
    updatedAtIso: doc.updatedAt ? doc.updatedAt.toDate().toISOString() : null,
  };
}

function toAdminView(doc: BlogPost, session: AuthSession): BlogPostAdminView {
  return {
    ...toPublicView(doc),
    status: doc.status,
    authorUserId: doc.authorUserId,
    createdAtIso: doc.createdAt ? doc.createdAt.toDate().toISOString() : null,
    canEdit: session.role === "SUPER_ADMIN" || doc.authorUserId === session.uid,
  };
}

export async function getPublishedBlogs({
  category,
  cursor = null,
  pageSize = 9,
}: {
  category?: string;
  cursor?: string | null;
  pageSize?: number;
} = {}): Promise<PageResult<BlogPostPublicView>> {
  let base = blogPostsCollection().where("status", "==", "PUBLISHED") as FirebaseFirestore.Query<BlogPost>;
  if (category) {
    base = base.where("category", "==", category);
  }
  const page = await fetchPage(base, "publishedAt", cursor, pageSize);
  return {
    ...page,
    items: page.items.map(toPublicView),
  };
}

export async function getPublishedBlogBySlug(slug: string): Promise<BlogPostPublicView | null> {
  const snap = await blogPostsCollection().where("slug", "==", slug).limit(1).get();
  if (snap.empty) return null;
  const post = snap.docs[0]!.data();
  if (!post || post.status !== "PUBLISHED") return null;
  return toPublicView(post);
}

export async function getRelatedPublishedBlogs(
  category: string,
  excludeId: string,
  limit = 3,
): Promise<BlogPostPublicView[]> {
  const snap = await blogPostsCollection()
    .where("status", "==", "PUBLISHED")
    .orderBy("publishedAt", "desc")
    .limit(12)
    .get();

  const candidates = snap.docs.map((d) => d.data()).filter((p) => p.id !== excludeId);
  const sameCategory = candidates.filter((p) => p.category === category);
  const others = candidates.filter((p) => p.category !== category);
  return [...sameCategory, ...others].slice(0, limit).map(toPublicView);
}

const MAX_ADMIN_SCAN_PAGES = 5;

export async function getAdminBlogs(
  session: AuthSession,
  {
    status,
    cursor = null,
  }: {
    status?: BlogPostStatus;
    cursor?: string | null;
  } = {},
): Promise<PageResult<BlogPostAdminView>> {
  const base = blogPostsCollection() as FirebaseFirestore.Query<BlogPost>;
  if (!status) {
    const page = await fetchPage(base, "updatedAt", cursor, DEFAULT_PAGE_SIZE);
    return {
      ...page,
      items: page.items.map((p) => toAdminView(p, session)),
    };
  }

  // Bounded scan by updatedAt desc so status filtering works without an extra composite index.
  const matched: BlogPost[] = [];
  let currentToken = cursor;
  let lastMatchedCursor: string | null = null;
  let hasNextPage = false;
  let lastPageTotal = 0;

  for (let scan = 0; scan < MAX_ADMIN_SCAN_PAGES; scan++) {
    const page = await fetchPage(base, "updatedAt", currentToken, DEFAULT_PAGE_SIZE);
    lastPageTotal = page.totalCount;

    for (let i = 0; i < page.items.length; i++) {
      const post = page.items[i]!;
      if (post.status !== status) continue;

      matched.push(post);
      if (post.updatedAt) {
        lastMatchedCursor = `${post.updatedAt.toMillis()}_${post.id}`;
      }
      if (matched.length === DEFAULT_PAGE_SIZE) {
        hasNextPage = i < page.items.length - 1 || page.hasNextPage;
        break;
      }
    }

    if (matched.length >= DEFAULT_PAGE_SIZE) break;

    currentToken = page.nextCursor;
    if (!page.hasNextPage || !page.nextCursor) {
      hasNextPage = false;
      break;
    }
    if (scan === MAX_ADMIN_SCAN_PAGES - 1) {
      lastMatchedCursor = page.nextCursor;
      hasNextPage = true;
    }
  }

  return {
    items: matched.map((p) => toAdminView(p, session)),
    totalCount: !hasNextPage && cursor === null ? matched.length : lastPageTotal,
    hasNextPage,
    nextCursor: hasNextPage ? lastMatchedCursor : null,
    totalIsApproximate: hasNextPage || cursor !== null,
  };
}

export async function getAdminBlogById(
  id: string,
  session: AuthSession,
): Promise<BlogPostAdminView | null> {
  const snap = await blogPostsCollection().doc(id).get();
  if (!snap.exists) return null;
  return toAdminView(snap.data()!, session);
}
