import { z } from "zod";
import { DAYS_OF_WEEK, GENDERS, GRADES, QUALIFICATIONS, SUBJECTS } from "@/lib/catalog";
import type { AvailabilitySlot, Gender, HighestQualification } from "./types";

// Catalog ids are kept in sync with these domain literal unions by hand
// (catalog.ts is the single source for the *values*; these types are the
// single source for what Firestore/the domain layer accepts).
const SUBJECT_IDS = SUBJECTS.map((s) => s.id) as [string, ...string[]];
const GRADE_IDS = GRADES.map((g) => g.id) as [string, ...string[]];
const QUALIFICATION_IDS = QUALIFICATIONS.map((q) => q.id) as [HighestQualification, ...HighestQualification[]];
const GENDER_IDS = GENDERS.map((g) => g.id) as [Gender, ...Gender[]];
const DAY_IDS = DAYS_OF_WEEK.map((d) => d.id) as [
  AvailabilitySlot["dayOfWeek"],
  ...AvailabilitySlot["dayOfWeek"][],
];

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const currentYear = new Date().getFullYear();

export const personalStepSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+][0-9+\-\s]{6,19}$/, "Enter a valid phone number."),
  gender: z.enum(GENDER_IDS),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date.")
    .refine((value) => {
      const age = (Date.now() - new Date(value).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return age >= 16 && age <= 100;
    }, "Tutor must be between 16 and 100 years old."),
  address: z.string().trim().min(5, "Enter your address.").max(300),
});

export const educationStepSchema = z.object({
  highestQualification: z.enum(QUALIFICATION_IDS),
  institution: z.string().trim().min(2, "Enter your institution.").max(200),
  graduationYear: z.coerce
    .number()
    .int()
    .min(1950)
    .max(currentYear, "Graduation year cannot be in the future."),
  majorSubject: z.string().trim().min(2, "Enter your major/subject.").max(120),
});

export const teachingStepSchema = z.object({
  subjects: z.array(z.enum(SUBJECT_IDS)).min(1, "Select at least one subject."),
  grades: z.array(z.enum(GRADE_IDS)).min(1, "Select at least one grade."),
  teachingExperienceSummary: z.string().trim().max(1000).nullable(),
  expectedMonthlyFee: z.coerce.number().positive("Enter an expected monthly fee.").max(1_000_000),
});

export const locationStepSchema = z.object({
  preferredLocationId: z.string().min(1, "Select a city."),
  preferredLocality: z.string().trim().min(2, "Enter your preferred locality/area.").max(120),
});

const slotSchema = z
  .object({
    dayOfWeek: z.enum(DAY_IDS),
    startTime: z.string().regex(TIME_PATTERN, "Invalid start time."),
    endTime: z.string().regex(TIME_PATTERN, "Invalid end time."),
  })
  .refine((slot) => slot.startTime < slot.endTime, {
    message: "End time must be after start time.",
    path: ["endTime"],
  });

export const availabilityStepSchema = z.object({
  slots: z.array(slotSchema).min(1, "Add at least one availability slot."),
});

export const ONBOARDING_STEP_SCHEMAS = {
  personal: personalStepSchema,
  education: educationStepSchema,
  teaching: teachingStepSchema,
  location: locationStepSchema,
  availability: availabilityStepSchema,
} as const;

export type OnboardingStep = keyof typeof ONBOARDING_STEP_SCHEMAS;
export const ONBOARDING_STEPS: OnboardingStep[] = [
  "personal",
  "education",
  "teaching",
  "location",
  "availability",
];
