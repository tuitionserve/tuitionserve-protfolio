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
 * Admin-only: a school vacancy posted on a school's behalf after a
 * conversation with them (see school-contact.ts for the separate,
 * earlier-stage "we'd like to partner" enquiry — this is the later
 * step once there's an actual position to staff). Shaped like
 * tuitionRequestSchema (same location/availability/notes fields, same
 * downstream pipeline) but with a school + contact person instead of a
 * parent + student.
 */
export const schoolVacancySchema = z.object({
  institutionName: z.string().trim().min(2, "Enter the school's name.").max(200),
  contactPersonName: z.string().trim().min(2, "Enter a contact person's name.").max(120),
  contactPhone: z
    .string()
    .trim()
    .regex(/^[0-9+][0-9+\-\s]{6,19}$/, "Enter a valid phone number."),
  contactEmail: z.union([z.literal(""), z.string().trim().email("Enter a valid email.")]).nullable(),

  subjectId: z.enum(SUBJECT_IDS),
  gradeId: z.enum(GRADE_IDS),

  locationId: z.string().min(1, "Select a city."),
  tutorVisibleLocality: z.string().trim().min(2, "Enter the area/locality.").max(120),
  exactAddress: z.string().trim().min(5, "Enter the exact address.").max(300),

  slots: z.array(slotSchema).min(1, "Add at least one availability slot."),

  notes: z.string().trim().max(1000).nullable(),
});

export type SchoolVacancyInput = z.infer<typeof schoolVacancySchema>;
