"use server";

import { requireRole } from "@/server/auth/guards";
import { schoolContactQuerySchema } from "@/server/domain/school-contact-schema";
import { createSchoolContactQueryFromParsedData, type ActionResult } from "@/server/actions/school-contact";
import { fieldErrorsFrom } from "@/server/actions/action-utils";

export type { ActionResult };

/**
 * Admin/Super Admin phone-intake equivalent of the public For Schools
 * contact form — for a school that called or emailed directly. Lands
 * in the same School Contact Queries inbox as a public submission.
 */
export async function submitSchoolContactQueryAsAdmin(formData: FormData): Promise<ActionResult> {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const parsed = schoolContactQuerySchema.safeParse({
    institutionName: formData.get("institutionName"),
    contactPersonName: formData.get("contactPersonName"),
    email: formData.get("email") || null,
    phone: formData.get("phone"),
    location: formData.get("location"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  return createSchoolContactQueryFromParsedData(parsed.data, {
    userId: session.uid,
    role: session.role as "SUPER_ADMIN" | "BRANCH_ADMIN",
  });
}
