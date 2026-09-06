/**
 * Static reference lists for the tutor onboarding wizard. These are plain
 * enumerable domain vocabulary (school subjects/grades, standard Nepali
 * qualification levels) — not geographic data, so no external-sourcing
 * concern applies (contrast with GeographicLocation, which is provisional
 * pending the M6 data-engineering pass). Shared between client and server.
 */

export const SUBJECTS = [
  { id: "mathematics", label: "Mathematics" },
  { id: "science", label: "Science" },
  { id: "english", label: "English" },
  { id: "nepali", label: "Nepali" },
  { id: "social-studies", label: "Social Studies" },
  { id: "computer-science", label: "Computer Science" },
  { id: "accountancy", label: "Accountancy" },
  { id: "economics", label: "Economics" },
  { id: "physics", label: "Physics" },
  { id: "chemistry", label: "Chemistry" },
  { id: "biology", label: "Biology" },
] as const;

export const GRADES = [
  { id: "pg", label: "Play Group (PG)" },
  { id: "nursery", label: "Nursery" },
  { id: "lkg", label: "LKG" },
  { id: "ukg", label: "UKG" },
  { id: "grade-1", label: "Grade 1" },
  { id: "grade-2", label: "Grade 2" },
  { id: "grade-3", label: "Grade 3" },
  { id: "grade-4", label: "Grade 4" },
  { id: "grade-5", label: "Grade 5" },
  { id: "grade-6", label: "Grade 6" },
  { id: "grade-7", label: "Grade 7" },
  { id: "grade-8", label: "Grade 8" },
  { id: "grade-9", label: "Grade 9" },
  { id: "grade-10", label: "Grade 10" },
  { id: "grade-11", label: "Grade 11" },
  { id: "grade-12", label: "Grade 12" },
  { id: "bachelor-level", label: "Bachelor Level" },
] as const;

export const QUALIFICATIONS = [
  { id: "SEE_SLC", label: "SEE / SLC" },
  { id: "PLUS_TWO", label: "+2 / Intermediate" },
  { id: "BACHELORS", label: "Bachelor's Degree" },
  { id: "MASTERS", label: "Master's Degree" },
  { id: "MPHIL_PHD", label: "M.Phil / PhD" },
  { id: "OTHER", label: "Other" },
] as const;

export const GENDERS = [
  { id: "MALE", label: "Male" },
  { id: "FEMALE", label: "Female" },
] as const;

export const DAYS_OF_WEEK = [
  { id: "SUN", label: "Sunday" },
  { id: "MON", label: "Monday" },
  { id: "TUE", label: "Tuesday" },
  { id: "WED", label: "Wednesday" },
  { id: "THU", label: "Thursday" },
  { id: "FRI", label: "Friday" },
  { id: "SAT", label: "Saturday" },
] as const;

export function catalogLabel(list: readonly { id: string; label: string }[], id: string): string {
  return list.find((item) => item.id === id)?.label ?? id;
}
