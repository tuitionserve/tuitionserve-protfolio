"use server";

import { FieldValue } from "firebase-admin/firestore";
import { requireRole } from "@/server/auth/guards";
import { geographicLocationsCollection } from "@/server/domain/collections";
import { resolveBranchIdForLocation } from "@/server/domain/branch-routing";
import { schoolVacancySchema } from "@/server/domain/school-vacancy-schema";
import { fieldErrorsFrom } from "@/server/actions/action-utils";
import { createPostingRecord, findOrCreateContact, type ActionResult } from "@/server/actions/parent-request";

export type { ActionResult };

/**
 * Admin-only: posts a school vacancy after talking to the school
 * directly — the later step after a School Contact enquiry (see
 * school-contact.ts), once there's an actual position to staff. Uses
 * the exact same TuitionRequest pipeline as a home tuition (NEW ->
 * OPEN -> tutors apply -> admin assigns), tagged postingType: "SCHOOL"
 * so tutors see it in the same Available Tuitions list with a
 * different badge instead of a second, parallel list to maintain.
 */
export async function submitSchoolVacancyAsAdmin(formData: FormData): Promise<ActionResult> {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  let slots: unknown;
  try {
    slots = JSON.parse(String(formData.get("slotsJson") ?? "[]"));
  } catch {
    return { ok: false, error: "Invalid availability data." };
  }

  const parsed = schoolVacancySchema.safeParse({
    institutionName: formData.get("institutionName"),
    contactPersonName: formData.get("contactPersonName"),
    contactPhone: formData.get("contactPhone"),
    contactEmail: formData.get("contactEmail") || null,
    subjectId: formData.get("subjectId"),
    gradeId: formData.get("gradeId"),
    locationId: formData.get("locationId"),
    tutorVisibleLocality: formData.get("tutorVisibleLocality"),
    exactAddress: formData.get("exactAddress"),
    slots,
    notes: formData.get("notes") || null,
  });

  if (!parsed.success) {
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: fieldErrorsFrom(parsed.error) };
  }
  const data = parsed.data;

  if (session.role === "BRANCH_ADMIN") {
    const locationSnap = await geographicLocationsCollection().doc(data.locationId).get();
    if (locationSnap.exists) {
      const branchId = await resolveBranchIdForLocation(data.locationId);
      if (branchId !== session.branchId) {
        return {
          ok: false,
          error: "This location falls outside your branch.",
          fieldErrors: { locationId: "This location falls outside your branch." },
        };
      }
    }
  }

  const now = FieldValue.serverTimestamp();
  const parentId = await findOrCreateContact(data.contactPersonName, data.contactPhone, data.contactEmail || null, now);

  return createPostingRecord({
    postingType: "SCHOOL",
    parentId,
    studentId: null,
    institutionName: data.institutionName,
    subjectId: data.subjectId,
    gradeId: data.gradeId,
    exactAddress: data.exactAddress,
    locationId: data.locationId,
    tutorVisibleLocality: data.tutorVisibleLocality,
    slots: data.slots,
    notes: data.notes || null,
    notifyTitle: "New school vacancy posted",
    notifyBody: `${data.institutionName}'s ${data.subjectId} vacancy in ${data.tutorVisibleLocality} is ready for tutors to apply.`,
    actor: { userId: session.uid, role: session.role as "SUPER_ADMIN" | "BRANCH_ADMIN" },
  });
}
