import { describe, expect, it } from "vitest";
import { BLOG_CATEGORIES, blogPostSchema, estimateReadTimeMinutes } from "./blog-schema";

describe("blogPostSchema & helpers", () => {
  const validPayload = {
    title: "How to Choose a Verified Home Tutor in Kathmandu",
    slug: "how-to-choose-a-verified-home-tutor-in-kathmandu",
    excerpt: "A step-by-step parent checklist covering safety, subject depth, and scheduling.",
    content: "Finding the right tutor starts with clear weekly learning objectives and consistent study habits.",
    category: BLOG_CATEGORIES[1],
    tags: ["Parents", "Home Tuition"],
    coverImageUrl: "/api/media/blog-cover/123-abc.jpg",
    status: "PUBLISHED" as const,
  };

  it("accepts a valid blog payload", () => {
    const parsed = blogPostSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it("rejects unsafe javascript: cover URLs", () => {
    const parsed = blogPostSchema.safeParse({
      ...validPayload,
      coverImageUrl: "javascript:alert(1)",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects overly short content", () => {
    const parsed = blogPostSchema.safeParse({
      ...validPayload,
      content: "Too short",
    });
    expect(parsed.success).toBe(false);
  });

  it("estimates reading time with a 1 minute floor", () => {
    expect(estimateReadTimeMinutes("Short note")).toBe(1);
    const words450 = Array.from({ length: 450 }, () => "word").join(" ");
    expect(estimateReadTimeMinutes(words450)).toBe(3);
  });
});
