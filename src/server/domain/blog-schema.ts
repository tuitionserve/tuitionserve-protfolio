import { z } from "zod";

export const BLOG_CATEGORIES = [
  "Study Tips",
  "Parent Guide",
  "Tutor Guide",
  "Exam Prep",
  "Education News",
  "Announcements",
] as const;

export const blogPostSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters.").max(160, "Title must be 160 characters or fewer."),
  slug: z
    .string()
    .trim()
    .max(110, "Slug must be 110 characters or fewer.")
    .optional()
    .or(z.literal("")),
  excerpt: z
    .string()
    .trim()
    .min(20, "Summary/excerpt must be at least 20 characters.")
    .max(360, "Excerpt must be 360 characters or fewer."),
  content: z
    .string()
    .trim()
    .min(50, "Article content must be at least 50 characters.")
    .max(40_000, "Article content is too long."),
  category: z.enum(BLOG_CATEGORIES),
  tags: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
  coverImageUrl: z
    .string()
    .trim()
    .max(500)
    .refine(
      (v) => !v || v.startsWith("https://") || v.startsWith("/"),
      "Cover image URL must start with https:// or /.",
    )
    .nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type BlogPostInput = z.infer<typeof blogPostSchema>;

export function estimateReadTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
