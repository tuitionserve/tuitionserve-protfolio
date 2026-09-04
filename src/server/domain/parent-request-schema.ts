import { z } from "zod";
import { GRADES, SUBJECTS, DAYS_OF_WEEK } from "@/lib/catalog";
import type { AvailabilitySlot } from "./types";

const GRADE_IDS = GRADES.map((g) => g.id) as [string, ...string[]];
const SUBJECT_IDS = SUBJECTS.map((s) => s.id) as [string, ...string[]];
const DAY_IDS = DAYS_OF_WEEK.map((d) => d.id) as [
  AvailabilitySlot["dayOfWeek"],
  ...AvailabilitySlot["dayOfWeek"][],
];
const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

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

/**
 * Full parent tuition request submission — single-page form (UX flow doc
 * allows single-page or staged; a single page fits this one better than
 * the tutor onboarding wizard did). No auth: parents never have accounts.
 */
export const tuitionRequestSchema = z.object({
  // Parent
  parentFullName: z.string().trim().min(2, "Enter the parent's full name.").max(120),
  parentPhone: z
    .string()
    .trim()
    .regex(/^[0-9+][0-9+\-\s]{6,19}$/, "Enter a valid phone number."),
  parentEmail: z.union([z.literal(""), z.string().trim().email("Enter a valid email.")]).nullable(),

  // Student
  studentFullName: z.string().trim().min(2, "Enter the student's name.").max(120),
  gradeId: z.enum(GRADE_IDS),
  schoolName: z.string().trim().max(200).nullable(),

  // Tuition
  subjectId: z.enum(SUBJECT_IDS),

  // Location
  locationId: z.string().min(1, "Select a city."),
  tutorVisibleLocality: z.string().trim().min(2, "Enter the area/locality.").max(120),
  exactAddress: z.string().trim().min(5, "Enter the exact address.").max(300),

  // Availability
  slots: z.array(slotSchema).min(1, "Add at least one availability slot."),

  notes: z.string().trim().max(1000).nullable(),
});

export type TuitionRequestInput = z.infer<typeof tuitionRequestSchema>;
