"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { assertBranchScope, requireRole } from "@/server/auth/guards";
import { tuitionRequestsCollection, tutorApplicationsCollection } from "@/server/domain/collections";
import { writeAuditEvent } from "@/server/domain/audit";
import { buildTuitionSlug } from "@/server/domain/slug";
import { createNotification } from "@/server/domain/notifications";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const rejectSchema = z.object({
  reason: z.string().trim().min(1, "A rejection reason is required.").max(1000),
});

async function loadRequestForAdminReview(requestId: string) {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const ref = tuitionRequestsCollection().doc(requestId);
  const snap = await ref.get();
  if (!snap.exists) throw new Error("Tuition request not found.");
  const request = snap.data()!;
  assertBranchScope(session, request.branchId);
  return { session, ref };
}

/**
 * Confirms a NEW request, transitioning it directly to OPEN — a
 * confirmed request *is* the open opportunity (implementation plan
 * Phase 7 acceptance: "Confirm transitions request to open"; domain
 * model: "A confirmed TuitionRequest becomes an opportunity through its
 * lifecycle rather than requiring a duplicate opportunity table"). The
 * CONFIRMED status value stays declared on TuitionRequestStatus for
 * schema completeness but is not used as a resting state here.
 */
export async function confirmTuitionRequest(requestId: string): Promise<ActionResult> {
  const { session, ref } = await loadRequestForAdminReview(requestId);

  const result = await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const request = snap.data();
    if (!request || request.status !== "NEW") return { ok: false as const };
    const slug =
      request.slug ||
      buildTuitionSlug({
        postingType: request.postingType,
        gradeId: request.gradeId,
        gradeIds: request.gradeIds,
        subjectIds: request.subjectIds,
        institutionName: request.institutionName,
        tutorVisibleLocality: request.tutorVisibleLocality,
        tuitionUid: request.tuitionUid,
      });
    tx.update(ref, {
      status: "OPEN",
      slug,
      confirmedAt: FieldValue.serverTimestamp(),
      reviewedBy: session.uid,
      rejectionReason: null,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true as const };
  });

  if (!result.ok) {
    return { ok: false, error: "This request is not currently pending review." };
  }

  await writeAuditEvent({
    action: "TUITION_CONFIRMED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "TuitionRequest",
    targetId: requestId,
    metadata: {},
  });

  revalidatePath("/vacancies");
  revalidatePath("/tutor/opportunities");
  revalidatePath("/admin/tuition-requests/open");
  revalidatePath("/admin/tuition-requests/new");

  revalidatePath("/vacancies");
  revalidatePath("/tutor/opportunities");
  revalidatePath("/admin/tuition-requests/open");

  return { ok: true };
}

export async function rejectTuitionRequest(requestId: string, reason: string): Promise<ActionResult> {
  const parsed = rejectSchema.safeParse({ reason });
  if (!parsed.success) {
    return { ok: false, error: "A rejection reason is required.", fieldErrors: { reason: "A rejection reason is required." } };
  }

  const { session, ref } = await loadRequestForAdminReview(requestId);

  const result = await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const request = snap.data();
    if (!request || request.status !== "NEW") return { ok: false as const };
    tx.update(ref, {
      status: "REJECTED",
      rejectionReason: parsed.data.reason,
      rejectedAt: FieldValue.serverTimestamp(),
      reviewedBy: session.uid,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true as const };
  });

  if (!result.ok) {
    return { ok: false, error: "This request is not currently pending review." };
  }

  await writeAuditEvent({
    action: "TUITION_REJECTED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "TuitionRequest",
    targetId: requestId,
    metadata: { reason: parsed.data.reason },
  });

  revalidatePath("/vacancies");
  revalidatePath("/tutor/opportunities");
  revalidatePath("/admin/tuition-requests/open");

  return { ok: true };
}

/**
 * Cancels an already-OPEN tuition before any tutor has been assigned.
 * Atomically transitions OPEN -> CANCELLED, flips any pending APPLIED
 * applications to REJECTED, and notifies affected applicants.
 */
export async function cancelOpenTuition(requestId: string, reason: string): Promise<ActionResult> {
  const parsed = rejectSchema.safeParse({ reason });
  if (!parsed.success) {
    return {
      ok: false,
      error: "A cancellation reason is required.",
      fieldErrors: { reason: "A cancellation reason is required." },
    };
  }

  const { session, ref } = await loadRequestForAdminReview(requestId);
  const now = FieldValue.serverTimestamp();

  const result = await adminFirestore.runTransaction(async (tx) => {
    const [snap, appliedSnap] = await Promise.all([
      tx.get(ref),
      tx.get(tutorApplicationsCollection().where("tuitionId", "==", requestId).where("status", "==", "APPLIED")),
    ]);
    const request = snap.data();
    if (!request || request.status !== "OPEN") {
      return { ok: false as const };
    }

    tx.update(ref, {
      status: "CANCELLED",
      rejectionReason: parsed.data.reason,
      updatedAt: now,
    });

    const affectedTutorIds: string[] = [];
    for (const doc of appliedSnap.docs) {
      tx.update(doc.ref, { status: "REJECTED", updatedAt: now });
      affectedTutorIds.push(doc.data().tutorId);
    }

    return { ok: true as const, tuitionUid: request.tuitionUid, affectedTutorIds };
  });

  if (!result.ok) {
    return { ok: false, error: "Only an open tuition can be cancelled here." };
  }

  await writeAuditEvent({
    action: "TUITION_CANCELLED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "TuitionRequest",
    targetId: requestId,
    metadata: { reason: parsed.data.reason, stage: "OPEN" },
  });

  await Promise.all(
    result.affectedTutorIds.map((tutorId) =>
      createNotification({
        recipientUserId: tutorId,
        type: "APPLICATION_NOT_SELECTED",
        title: "Tuition cancelled",
        body: `Tuition ${result.tuitionUid} was cancelled before a tutor was selected.`,
        relatedEntityType: "TuitionRequest",
        relatedEntityId: requestId,
      }),
    ),
  );

  revalidatePath("/vacancies");
  revalidatePath("/tutor/opportunities");
  revalidatePath("/admin/tuition-requests/open");

  return { ok: true };
}
