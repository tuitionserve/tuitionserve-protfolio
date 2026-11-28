"use server";

import { requireRole } from "@/server/auth/guards";
import { geographicLocationsCollection } from "@/server/domain/collections";
import { resolveBranchIdForLocation } from "@/server/domain/branch-routing";
import { tuitionRequestSchema } from "@/server/domain/parent-request-schema";
import { createTuitionRequestFromParsedData, type ActionResult } from "@/server/actions/parent-request";
import { fieldErrorsFrom } from "@/server/actions/action-utils";

export type { ActionResult };

/**
 * Admin/Super Admin direct tuition posting — skips the parent-verification
 * NEW queue and publishes directly to OPEN so it appears immediately on
 * Open Tuitions, Tutor Opportunities, and the Public Vacancies board.
 */
export async function submitTuitionRequestAsAdmin(formData: FormData): Promise<ActionResult> {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  let slots: unknown;
  let students: unknown;
  try {
    slots = JSON.parse(String(formData.get("slotsJson") ?? "[]"));
    students = JSON.parse(String(formData.get("studentsJson") ?? "[]"));
  } catch {
    return { ok: false, error: "Invalid form data." };
  }

  const parsed = tuitionRequestSchema.safeParse({
    parentFullName: formData.get("parentFullName"),
    parentPhone: formData.get("parentPhone"),
    parentEmail: formData.get("parentEmail") || null,
    students,
    tutorGenderPreference: formData.get("tutorGenderPreference"),
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

  return createTuitionRequestFromParsedData(
    parsed.data,
    {
      userId: session.uid,
      role: session.role as "SUPER_ADMIN" | "BRANCH_ADMIN",
    },
    { initialStatus: "OPEN", reviewedBy: session.uid },
  );
}
