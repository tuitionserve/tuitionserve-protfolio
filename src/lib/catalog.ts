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
  { id: "primary-1-5", label: "Primary (1-5)" },
  { id: "lower-secondary-6-8", label: "Lower Secondary (6-8)" },
  { id: "secondary-9-10", label: "Secondary (9-10)" },
  { id: "higher-secondary-11-12", label: "Higher Secondary (11-12)" },
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
