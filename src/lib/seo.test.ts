import { afterEach, describe, expect, it, vi } from "vitest";
import { absoluteUrl, blogPostingJsonLd, getSiteUrl, jobPostingJsonLd } from "./seo";

describe("SEO & JSON-LD helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults to https://tuitionserve.com when NEXT_PUBLIC_SITE_URL is unset", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    expect(getSiteUrl()).toBe("https://tuitionserve.com");
  });

  it("normalizes NEXT_PUBLIC_SITE_URL and builds absolute URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://tuitionserve.com///");
    expect(getSiteUrl()).toBe("https://tuitionserve.com");
    expect(absoluteUrl("vacancies/abc")).toBe("https://tuitionserve.com/vacancies/abc");
    expect(absoluteUrl("/blog/post")).toBe("https://tuitionserve.com/blog/post");
  });

  it("generates JobPosting JSON-LD with Nepal country code and absolute URL", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://tuitionserve.com");
    const schema = jobPostingJsonLd({
      title: "Class 10 Maths Home Tuition",
      description: "Need experienced tutor",
      identifier: "TS-REQ-000010",
      slug: "home-tuition-class-10-mathematics-kathmandu-ts-req-000010",
      hiringOrganizationName: "Tuition Serve",
      locality: "Baneshwor",
      city: "Kathmandu",
      datePostedIso: "2026-11-26T00:00:00.000Z",
    });

    expect(schema["@type"]).toBe("JobPosting");
    expect(schema.url).toBe(
      "https://tuitionserve.com/vacancies/home-tuition-class-10-mathematics-kathmandu-ts-req-000010",
    );
    expect(schema.jobLocation.address.addressCountry).toBe("NP");
  });

  it("generates BlogPosting JSON-LD with canonical mainEntityOfPage", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://tuitionserve.com");
    const schema = blogPostingJsonLd({
      title: "Exam Prep Guide",
      excerpt: "Study better for SEE exams.",
      slug: "exam-prep-guide",
      category: "Exam Prep",
      authorName: "Tuition Serve Team",
      publishedAtIso: "2026-11-26T00:00:00.000Z",
      updatedAtIso: "2026-11-26T00:00:00.000Z",
      coverImageUrl: "/api/media/blog-cover/123-abc.jpg",
      tags: ["SEE", "Exams"],
    });

    expect(schema["@type"]).toBe("BlogPosting");
    expect(schema.mainEntityOfPage["@id"]).toBe("https://tuitionserve.com/blog/exam-prep-guide");
    expect(schema.image[0]).toBe("https://tuitionserve.com/api/media/blog-cover/123-abc.jpg");
  });
});
