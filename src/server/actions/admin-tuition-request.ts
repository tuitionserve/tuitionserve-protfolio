"use server";

import { requireRole } from "@/server/auth/guards";
import { geographicLocationsCollection } from "@/server/domain/collections";
import { resolveBranchIdForLocation } from "@/server/domain/branch-routing";
import { tuitionRequestSchema } from "@/server/domain/parent-request-schema";
import { createTuitionRequestFromParsedData, type ActionResult } from "@/server/actions/parent-request";
import { fieldErrorsFrom } from "@/server/actions/action-utils";

export type { ActionResult };

/**
 * Admin/Super Admin phone-intake equivalent of the public tuition
 * request form — for a parent who called or messaged directly instead
 * of using the website. Lands as a NEW request in the same review
 * queue as a public submission (see parent-request.ts), so the
 * existing confirm/reject flow applies unchanged.
 */
export async function submitTuitionRequestAsAdmin(formData: FormData): Promise<ActionResult> {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  let slots: unknown;
  try {
    slots = JSON.parse(String(formData.get("slotsJson") ?? "[]"));
  } catch {
    return { ok: false, error: "Invalid availability data." };
  }

  const parsed = tuitionRequestSchema.safeParse({
    parentFullName: formData.get("parentFullName"),
    parentPhone: formData.get("parentPhone"),
    parentEmail: formData.get("parentEmail") || null,
    studentFullName: formData.get("studentFullName"),
    gradeId: formData.get("gradeId"),
    schoolName: formData.get("schoolName") || null,
    subjectId: formData.get("subjectId"),
    locationId: formData.get("locationId"),
    tutorVisibleLocality: formData.get("tutorVisibleLocality"),
    exactAddress: formData.get("exactAddress"),
    slots,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  if (session.role === "BRANCH_ADMIN") {
    const locationSnap = await geographicLocationsCollection().doc(parsed.data.locationId).get();
    if (locationSnap.exists) {
      const branchId = await resolveBranchIdForLocation(parsed.data.locationId);
      if (branchId !== session.branchId) {
        return {
          ok: false,
          error: "This location falls outside your branch.",
          fieldErrors: { locationId: "This location falls outside your branch." },
        };
      }
    }
  }

  return createTuitionRequestFromParsedData(parsed.data, {
    userId: session.uid,
    role: session.role as "SUPER_ADMIN" | "BRANCH_ADMIN",
  });
}
