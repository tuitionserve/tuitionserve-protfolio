"use server";

import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { assertBranchScope, requireRole } from "@/server/auth/guards";
import {
  tutorDocumentsCollection,
  tutorProfilesCollection,
  tutorsCollection,
} from "@/server/domain/collections";
import { getSignedDownloadUrl } from "@/server/domain/documents";
import { writeAuditEvent } from "@/server/domain/audit";
import { createNotification } from "@/server/domain/notifications";
import type { TutorVerificationStatus } from "@/server/domain/types";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const REVIEWABLE_STATUSES: TutorVerificationStatus[] = ["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED"];

const rejectSchema = z.object({
  reason: z.string().trim().min(1, "A rejection reason is required.").max(1000),
});

/**
 * Loads the tutor and enforces admin role + branch scope. Throws (caller
 * should let it propagate to an error boundary / redirect) if the caller
 * isn't authorized for this specific tutor's branch — never trust a
 * client-supplied tutorId's branch, always re-derive it from the record.
 */
async function loadTutorForAdminReview(tutorId: string) {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const tutorRef = tutorsCollection().doc(tutorId);
  const tutorSnap = await tutorRef.get();
  if (!tutorSnap.exists) throw new Error("Tutor not found.");
  const tutor = tutorSnap.data()!;
  assertBranchScope(session, tutor.branchId);
  return { session, tutorRef, tutor };
}

export async function approveTutor(tutorId: string): Promise<ActionResult> {
  const { session, tutorRef } = await loadTutorForAdminReview(tutorId);

  const result = await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(tutorRef);
    const tutor = snap.data();
    if (!tutor || !REVIEWABLE_STATUSES.includes(tutor.verificationStatus)) {
      return { ok: false as const };
    }
    tx.update(tutorRef, {
      verificationStatus: "APPROVED",
      approvedAt: FieldValue.serverTimestamp(),
      reviewedBy: session.uid,
      rejectionReason: null,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true as const };
  });

  if (!result.ok) {
    return { ok: false, error: "This tutor is not currently awaiting review (already decided, or reloaded stale data)." };
  }

  await writeAuditEvent({
    action: "TUTOR_APPROVED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "Tutor",
    targetId: tutorId,
    metadata: {},
  });

  await createNotification({
    recipientUserId: tutorId,
    type: "TUTOR_APPROVED",
    title: "Your tutor profile has been approved",
    body: "Your profile has been verified. You can now browse and apply to tuitions.",
    relatedEntityType: "Tutor",
    relatedEntityId: tutorId,
  });

  return { ok: true };
}

export async function rejectTutor(tutorId: string, reason: string): Promise<ActionResult> {
  const parsed = rejectSchema.safeParse({ reason });
  if (!parsed.success) {
    return { ok: false, error: "A rejection reason is required.", fieldErrors: { reason: "A rejection reason is required." } };
  }

  const { session, tutorRef } = await loadTutorForAdminReview(tutorId);

  const result = await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(tutorRef);
    const tutor = snap.data();
    if (!tutor || !REVIEWABLE_STATUSES.includes(tutor.verificationStatus)) {
      return { ok: false as const };
    }
    tx.update(tutorRef, {
      verificationStatus: "REJECTED",
      rejectionReason: parsed.data.reason,
      reviewedBy: session.uid,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true as const };
  });

  if (!result.ok) {
    return { ok: false, error: "This tutor is not currently awaiting review (already decided, or reloaded stale data)." };
  }

  await writeAuditEvent({
    action: "TUTOR_REJECTED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "Tutor",
    targetId: tutorId,
    metadata: { reason: parsed.data.reason },
  });

  await createNotification({
    recipientUserId: tutorId,
    type: "TUTOR_REJECTED",
    title: "Changes required on your tutor profile",
    body: parsed.data.reason,
    relatedEntityType: "Tutor",
    relatedEntityId: tutorId,
  });

  return { ok: true };
}

/** Re-checks authorization before minting a short-lived CV download link. */
export async function getTutorCvUrl(tutorId: string): Promise<{ url: string } | { error: string }> {
  const { tutor } = await loadTutorForAdminReview(tutorId);
  const profileSnap = await tutorProfilesCollection().doc(tutorId).get();
  const cvDocumentId = profileSnap.data()?.cvDocumentId;
  if (!cvDocumentId) return { error: "No CV on file." };

  const docSnap = await tutorDocumentsCollection().doc(cvDocumentId).get();
  if (!docSnap.exists || docSnap.data()?.tutorId !== tutor.id) {
    return { error: "CV not found." };
  }

  const url = await getSignedDownloadUrl(docSnap.data()!.storagePath);
  return { url };
}
