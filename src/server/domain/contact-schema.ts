import { z } from "zod";

/** Public Contact Us form — no auth, mirrors parent-request-schema.ts's shape/style. */
export const contactQuerySchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.union([z.literal(""), z.string().trim().regex(/^[0-9+][0-9+\-\s]{6,19}$/, "Enter a valid phone number.")]).nullable(),
  location: z.string().trim().min(2, "Let us know your city/area.").max(200),
  message: z.string().trim().min(10, "Say a little more — at least 10 characters.").max(2000),
});

export type ContactQueryInput = z.infer<typeof contactQuerySchema>;
