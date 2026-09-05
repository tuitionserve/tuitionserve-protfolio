import type { WizardProfileState } from "./types";

export const STEPS = ["personal", "education", "teaching", "location", "availability", "cv", "review"] as const;
export const STEP_LABELS = ["Personal", "Education", "Teaching", "Location", "Availability", "CV", "Review"];

export interface MissingRequirement {
  label: string;
  stepIndex: number;
}

/**
 * Client-side mirror of REQUIRED_PROFILE_FIELDS in
 * server/actions/onboarding.ts's submitTutorProfileForReview — kept in
 * sync by hand since one lives in a client component and the other in
 * a server action. Lets the Review step show what's missing (and let
 * the tutor jump straight to the step that needs it) before they even
 * attempt to submit, rather than only finding out from the server's
 * rejection message.
 */
export function getMissingRequirements(profile: WizardProfileState): MissingRequirement[] {
  const missing: MissingRequirement[] = [];

  if (!profile.fullName) missing.push({ label: "Full name", stepIndex: 0 });
  if (!profile.phone) missing.push({ label: "Phone", stepIndex: 0 });
  if (!profile.gender) missing.push({ label: "Gender", stepIndex: 0 });
  if (!profile.dateOfBirth) missing.push({ label: "Date of birth", stepIndex: 0 });
  if (!profile.address) missing.push({ label: "Address", stepIndex: 0 });

  if (!profile.highestQualification) missing.push({ label: "Highest qualification", stepIndex: 1 });
  if (!profile.institution) missing.push({ label: "Institution", stepIndex: 1 });
  if (!profile.graduationYear) missing.push({ label: "Graduation year", stepIndex: 1 });
  if (!profile.majorSubject) missing.push({ label: "Major / subject", stepIndex: 1 });

  if (profile.subjects.length === 0) missing.push({ label: "Subjects taught", stepIndex: 2 });
  if (profile.grades.length === 0) missing.push({ label: "Grades taught", stepIndex: 2 });
  if (!profile.expectedMonthlyFee) missing.push({ label: "Expected monthly fee", stepIndex: 2 });

  if (!profile.preferredLocationId) missing.push({ label: "Preferred location", stepIndex: 3 });
  if (!profile.preferredLocality) missing.push({ label: "Preferred locality / area", stepIndex: 3 });

  if (profile.availability.length === 0) missing.push({ label: "Availability", stepIndex: 4 });

  if (!profile.hasCv) missing.push({ label: "CV", stepIndex: 5 });

  return missing;
}
