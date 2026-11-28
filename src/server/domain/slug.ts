import { catalogLabel, GRADES, SUBJECTS } from "@/lib/catalog";
import type { TuitionPostingType } from "./types";

/** Converts arbitrary text into an ASCII lowercase kebab-case URL slug segment. */
export function slugifySegment(raw: string, maxLength = 70): string {
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

/**
 * Builds a descriptive, SEO-friendly, globally unique slug for a
 * TuitionRequest (home tuition or school vacancy), ending with its
 * immutable `tuitionUid` so collisions are impossible even if two
 * postings share the exact same grade, subject, and locality.
 */
export function buildTuitionSlug(params: {
  postingType: TuitionPostingType;
  gradeId: string;
  gradeIds?: string[];
  subjectIds: string[];
  institutionName?: string | null;
  tutorVisibleLocality: string;
  tuitionUid: string;
}): string {
  const gradesList = params.gradeIds && params.gradeIds.length > 0 ? params.gradeIds : [params.gradeId];
  const gradePart = gradesList
    .slice(0, 2)
    .map((g) => catalogLabel(GRADES, g))
    .join(" ");
  const subjectPart = params.subjectIds
    .slice(0, 2)
    .map((s) => catalogLabel(SUBJECTS, s))
    .join(" ");

  const parts =
    params.postingType === "SCHOOL"
      ? ["school-vacancy", params.institutionName ?? "", subjectPart, gradePart, params.tutorVisibleLocality]
      : ["home-tuition", gradePart, subjectPart, params.tutorVisibleLocality];

  const base = slugifySegment(parts.filter(Boolean).join(" "), 72);
  const uidPart = slugifySegment(params.tuitionUid, 24);
  return [base, uidPart].filter(Boolean).join("-") || uidPart || "tuition-vacancy";
}

/** Builds a clean SEO slug from a blog title. */
export function buildBlogSlug(rawTitleOrSlug: string): string {
  return slugifySegment(rawTitleOrSlug, 90) || "article";
}
