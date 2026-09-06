"use server";

import { FieldValue } from "firebase-admin/firestore";
import {
  geographicLocationsCollection,
  parentsCollection,
  studentsCollection,
  tuitionRequestsCollection,
} from "@/server/domain/collections";
import { generateSequentialUid } from "@/server/domain/ids";
import { resolveBranchIdForLocation } from "@/server/domain/branch-routing";
import { notifyAdminsForBranch } from "@/server/domain/notifications";
import { writeAuditEvent } from "@/server/domain/audit";
import { tuitionRequestSchema } from "@/server/domain/parent-request-schema";
import { getLocationAncestry } from "@/server/queries/location-hierarchy";
import { fieldErrorsFrom } from "@/server/actions/action-utils";
import type { AvailabilitySlot, TuitionPostingType, TutorGenderPreference } from "@/server/domain/types";

export type ActionResult =
  | { ok: true; tuitionUids: string[] }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

type Actor = { userId: string | null; role: "SYSTEM" | "SUPER_ADMIN" | "BRANCH_ADMIN" };

/**
 * Finds-or-creates the contact record behind a posting, by phone (the
 * one stable identifying field for an account-less contact) — reused
 * for both a parent (home tuition) and a school's designated contact
 * person (school vacancy); the Parent collection just means "primary
 * contact for this request," not literally a parent.
 */
async function findOrCreateContact(
  fullName: string,
  phone: string,
  email: string | null,
  now: FirebaseFirestore.FieldValue,
): Promise<string> {
  const existingSnap = await parentsCollection().where("phone", "==", phone).limit(1).get();
  if (!existingSnap.empty) {
    const parentId = existingSnap.docs[0]!.id;
    await parentsCollection().doc(parentId).update({ fullName, email, updatedAt: now });
    return parentId;
  }
  const parentRef = parentsCollection().doc();
  const parentUid = await generateSequentialUid("parent");
  await parentRef.set({
    id: parentRef.id,
    parentUid,
    fullName,
    phone,
    email,
    createdAt: now,
    updatedAt: now,
  });
  return parentRef.id;
}

interface PostingRecordInput {
  postingType: TuitionPostingType;
  parentId: string;
  studentId: string | null;
  institutionName: string | null;
  subjectId: string;
  gradeId: string;
  exactAddress: string;
  locationId: string;
  tutorVisibleLocality: string;
  tutorGenderPreference: TutorGenderPreference;
  slots: AvailabilitySlot[];
  notes: string | null;
  notifyTitle: string;
  notifyBody: string;
  actor: Actor;
}

export type PostingRecordResult =
  | { ok: true; tuitionUid: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Writes one TuitionRequest doc + audit event + admin notification — shared by both posting types below. */
async function createPostingRecord(input: PostingRecordInput): Promise<PostingRecordResult> {
  const locationSnap = await geographicLocationsCollection().doc(input.locationId).get();
  if (!locationSnap.exists || locationSnap.data()?.level !== "WARD") {
    return {
      ok: false,
      error: "Select your full location down to ward.",
      fieldErrors: { locationId: "Select your full location down to ward." },
    };
  }

  const now = FieldValue.serverTimestamp();
  const branchId = await resolveBranchIdForLocation(input.locationId);

  // Denormalize district/local-government ancestors so the opportunity
  // browser can filter "Janakpur-wide" without an ancestry walk per
  // candidate tuition (see TuitionRequest doc comment in types.ts).
  const ancestry = await getLocationAncestry(input.locationId); // [ward, localGovernment, district, province]
  const localGovernmentId = ancestry.find((l) => l.level === "LOCAL_GOVERNMENT")?.id ?? null;
  const districtId = ancestry.find((l) => l.level === "DISTRICT")?.id ?? null;

  const tuitionUid = await generateSequentialUid("tuition");
  const requestRef = tuitionRequestsCollection().doc();
  await requestRef.set({
    id: requestRef.id,
    tuitionUid,
    branchId,
    postingType: input.postingType,
    parentId: input.parentId,
    studentId: input.studentId,
    institutionName: input.institutionName,
    status: "NEW",
    subjectId: input.subjectId,
    gradeId: input.gradeId,
    exactAddress: input.exactAddress,
    locationId: input.locationId,
    districtId,
    localGovernmentId,
    tutorVisibleLocality: input.tutorVisibleLocality,
    tutorGenderPreference: input.tutorGenderPreference,
    availability: input.slots,
    notes: input.notes,
    rejectionReason: null,
    confirmedAt: null,
    rejectedAt: null,
    reviewedBy: null,
    assignedApplicationId: null,
    createdAt: now,
    updatedAt: now,
  } as never);

  await writeAuditEvent({
    action: "TUITION_REQUEST_SUBMITTED",
    actorUserId: input.actor.userId,
    actorRole: input.actor.role,
    targetType: "TuitionRequest",
    targetId: requestRef.id,
    metadata: { tuitionUid, branchId, postingType: input.postingType },
  });

  await notifyAdminsForBranch(branchId, {
    type: "NEW_TUITION_REQUEST",
    title: input.notifyTitle,
    body: input.notifyBody,
    relatedEntityType: "TuitionRequest",
    relatedEntityId: requestRef.id,
  });

  return { ok: true, tuitionUid };
}

/**
 * Shared by the public submission below and the admin-initiated
 * "post a tuition manually" action (phone-intake requests) — same
 * record shape and downstream pipeline either way, only who's
 * recorded as the actor differs.
 *
 * One submission can cover several children (the form's "Add Student"
 * button) — the parent contact, location, availability, and gender
 * preference are entered once and shared; each student block becomes
 * its own Student + TuitionRequest, all linked to the same parent.
 */
export async function createTuitionRequestFromParsedData(
  data: import("zod").infer<typeof tuitionRequestSchema>,
  actor: Actor,
): Promise<ActionResult> {
  const now = FieldValue.serverTimestamp();
  const parentId = await findOrCreateContact(data.parentFullName, data.parentPhone, data.parentEmail || null, now);

  const tuitionUids: string[] = [];
  for (const student of data.students) {
    const studentRef = studentsCollection().doc();
    await studentRef.set({
      id: studentRef.id,
      parentId,
      fullName: student.studentFullName,
      gradeId: student.gradeId,
      schoolName: student.schoolName || null,
      currentProgram: student.currentProgram || null,
      currentYearOrSemester: student.currentYearOrSemester || null,
      createdAt: now,
    });

    const result = await createPostingRecord({
      postingType: "HOME_TUITION",
      parentId,
      studentId: studentRef.id,
      institutionName: null,
      subjectId: student.subjectId,
      gradeId: student.gradeId,
      exactAddress: data.exactAddress,
      locationId: data.locationId,
      tutorVisibleLocality: data.tutorVisibleLocality,
      tutorGenderPreference: data.tutorGenderPreference,
      slots: data.slots,
      notes: data.notes || null,
      notifyTitle: "New tuition request",
      notifyBody: `${student.studentFullName}'s ${student.subjectId} request in ${data.tutorVisibleLocality} is awaiting review.`,
      actor,
    });
    if (!result.ok) return result;
    tuitionUids.push(result.tuitionUid);
  }

  return { ok: true, tuitionUids };
}

/**
 * Public submission — no authentication, parents never have accounts
 * (PRD: public form only).
 */
export async function submitTuitionRequest(formData: FormData): Promise<ActionResult> {
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

  return createTuitionRequestFromParsedData(parsed.data, { userId: null, role: "SYSTEM" });
}

export { createPostingRecord, findOrCreateContact };
