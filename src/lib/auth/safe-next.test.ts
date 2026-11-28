import { describe, expect, it } from "vitest";
import { resolveSafeNextPath } from "./safe-next";

describe("resolveSafeNextPath", () => {
  it("falls back to role home when nextParam is missing", () => {
    expect(resolveSafeNextPath(null, "TUTOR")).toBe("/tutor/dashboard");
    expect(resolveSafeNextPath("", "BRANCH_ADMIN")).toBe("/admin/dashboard");
  });

  it("allows tutor opportunity destinations for TUTOR role", () => {
    expect(resolveSafeNextPath("/tutor/opportunities/abc123", "TUTOR")).toBe(
      "/tutor/opportunities/abc123",
    );
    expect(resolveSafeNextPath("/vacancies/home-tuition-grade-10", "TUTOR")).toBe(
      "/vacancies/home-tuition-grade-10",
    );
  });

  it("blocks cross-role portal redirects", () => {
    expect(resolveSafeNextPath("/admin/dashboard", "TUTOR")).toBe("/tutor/dashboard");
    expect(resolveSafeNextPath("/tutor/opportunities/abc", "SUPER_ADMIN")).toBe("/admin/dashboard");
  });

  it("blocks open redirect attempts", () => {
    expect(resolveSafeNextPath("https://evil.com/phish", "TUTOR")).toBe("/tutor/dashboard");
    expect(resolveSafeNextPath("//evil.com/phish", "TUTOR")).toBe("/tutor/dashboard");
    expect(resolveSafeNextPath("/\\evil.com", "SUPER_ADMIN")).toBe("/admin/dashboard");
  });
});
