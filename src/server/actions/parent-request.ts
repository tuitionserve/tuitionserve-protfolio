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

export type ActionResult =
  | { ok: true; tuitionUid: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function fieldErrorsFrom(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/**
 * Public submission — no authentication, parents never have accounts
 * (PRD: public form only). Reuses an existing Parent record by phone
 * number so repeat submissions don't create duplicate parents; always
 * creates a new Student (a parent may have multiple children, and a
 * request is a snapshot of who it's for at submission time).
 */
export async function submitTuitionRequest(formData: FormData): Promise<ActionResult> {
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
  const data = parsed.data;

  const locationSnap = await geographicLocationsCollection().doc(data.locationId).get();
  if (!locationSnap.exists || locationSnap.data()?.level !== "CITY") {
    return { ok: false, error: "Select a valid city.", fieldErrors: { locationId: "Select a valid city." } };
  }

  const now = FieldValue.serverTimestamp();

  // Parent record reuse by phone (the one stable identifying field we
  // collect for an account-less user).
  const existingParentSnap = await parentsCollection().where("phone", "==", data.parentPhone).limit(1).get();
  let parentId: string;
  if (!existingParentSnap.empty) {
    parentId = existingParentSnap.docs[0]!.id;
    await parentsCollection().doc(parentId).update({
      fullName: data.parentFullName,
      email: data.parentEmail || null,
      updatedAt: now,
    });
  } else {
    const parentRef = parentsCollection().doc();
    const parentUid = await generateSequentialUid("parent");
    await parentRef.set({
      id: parentRef.id,
      parentUid,
      fullName: data.parentFullName,
      phone: data.parentPhone,
      email: data.parentEmail || null,
      createdAt: now,
      updatedAt: now,
    });
    parentId = parentRef.id;
  }

  const studentRef = studentsCollection().doc();
  await studentRef.set({
    id: studentRef.id,
    parentId,
    fullName: data.studentFullName,
    gradeId: data.gradeId,
    schoolName: data.schoolName || null,
    createdAt: now,
  });

  const branchId = await resolveBranchIdForLocation(data.locationId);
  const tuitionUid = await generateSequentialUid("tuition");
  const requestRef = tuitionRequestsCollection().doc();
  await requestRef.set({
    id: requestRef.id,
    tuitionUid,
    branchId,
    parentId,
    studentId: studentRef.id,
    status: "NEW",
    subjectId: data.subjectId,
    gradeId: data.gradeId,
    exactAddress: data.exactAddress,
    locationId: data.locationId,
    tutorVisibleLocality: data.tutorVisibleLocality,
    availability: data.slots,
    notes: data.notes || null,
    rejectionReason: null,
    confirmedAt: null,
    rejectedAt: null,
    reviewedBy: null,
    createdAt: now,
    updatedAt: now,
  });

  await writeAuditEvent({
    action: "TUITION_REQUEST_SUBMITTED",
    actorUserId: null,
    actorRole: "SYSTEM",
    targetType: "TuitionRequest",
    targetId: requestRef.id,
    metadata: { tuitionUid, branchId },
  });

  await notifyAdminsForBranch(branchId, {
    type: "NEW_TUITION_REQUEST",
    title: "New tuition request",
    body: `${data.studentFullName}'s ${data.subjectId} request (${tuitionUid}) in ${data.tutorVisibleLocality} is awaiting review.`,
    relatedEntityType: "TuitionRequest",
    relatedEntityId: requestRef.id,
  });

  return { ok: true, tuitionUid };
}
