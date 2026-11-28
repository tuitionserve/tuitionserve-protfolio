import { describe, expect, it } from "vitest";
import { buildBlogSlug, buildTuitionSlug, slugifySegment } from "./slug";

describe("slug helpers", () => {
  it("slugifies mixed text cleanly", () => {
    expect(slugifySegment("  Class 10 — Math & Science! (Kathmandu) ")).toBe(
      "class-10-math-science-kathmandu",
    );
  });

  it("builds unique SEO-friendly home tuition slugs", () => {
    expect(
      buildTuitionSlug({
        postingType: "HOME_TUITION",
        gradeId: "grade-10",
        subjectIds: ["mathematics", "science"],
        tutorVisibleLocality: "New Baneshwor",
        tuitionUid: "TS-TU-00012",
      }),
    ).toBe("home-tuition-grade-10-mathematics-science-new-baneshwor-ts-tu-00012");
  });

  it("builds descriptive school vacancy slugs", () => {
    expect(
      buildTuitionSlug({
        postingType: "SCHOOL",
        gradeId: "grade-9",
        subjectIds: ["english"],
        institutionName: "St. Xavier School",
        tutorVisibleLocality: "Jawalakhel",
        tuitionUid: "TS-TU-00015",
      }),
    ).toBe("school-vacancy-st-xavier-school-english-grade-9-jawalakhel-ts-tu-00015");
  });

  it("builds fallback blog slug when input has no ASCII letters", () => {
    expect(buildBlogSlug("How to Pick a Tutor in Nepal?")).toBe("how-to-pick-a-tutor-in-nepal");
    expect(buildBlogSlug("???")).toBe("article");
  });
});
