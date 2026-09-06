import { z } from "zod";

/** Public For Schools contact form — phone is mandatory here, unlike the general Contact Us form. */
export const schoolContactQuerySchema = z.object({
  institutionName: z.string().trim().min(2, "Enter your school/institution's name.").max(200),
  contactPersonName: z.string().trim().min(2, "Enter a contact person's name.").max(120),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid email address.")]).nullable(),
  phone: z.string().trim().regex(/^[0-9+][0-9+\-\s]{6,19}$/, "Enter a valid phone number."),
  location: z.string().trim().min(2, "Let us know your city/area.").max(200),
  message: z.string().trim().min(10, "Say a little more — at least 10 characters.").max(2000),
});

export type SchoolContactQueryInput = z.infer<typeof schoolContactQuerySchema>;
