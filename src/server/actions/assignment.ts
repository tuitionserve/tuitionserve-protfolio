"use server";

import { FieldValue } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { assertBranchScope, requireRole } from "@/server/auth/guards";
import {
  tuitionAssignmentsCollection,
  tuitionRequestsCollection,
  tutorApplicationsCollection,
} from "@/server/domain/collections";
import { generateSequentialUid } from "@/server/domain/ids";
import { writeAuditEvent } from "@/server/domain/audit";
import { createNotification } from "@/server/domain/notifications";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Admin selects one applicant and assigns them to a tuition (PRD section
 * 17, UX flow "18. Assignment", tuition-workflow skill: "One Active
 * Assignment Rule"). Fully re-verified *inside* the transaction — not
 * just before it — so two admins clicking Assign on the same tuition
 * concurrently cannot both succeed (implementation plan Phase 11
 * acceptance: "Concurrent assignment attempts cannot create two active
 * assignments"; domain-data-integrity skill: "At most one active
 * assignment exists").
 *
 * On success, atomically:
 * - creates the TuitionAssignment (ACTIVE)
 * - closes the tuition (OPEN -> ASSIGNED) and records assignedApplicationId
 * - marks the chosen application SELECTED
 * - flips every other still-APPLIED application on the same tuition to
 *   REJECTED ("Other applicants receive the appropriate non-selected
 *   state")
 *
 * UID generation and notifications happen after the transaction commits,
 * mirroring applyToOpportunity's pattern (generateSequentialUid runs its
 * own transaction and can't be nested inside this one; a failed
 * notification must never roll back the assignment).
 */
export async function assignTutor(tuitionId: string, applicationId: string): Promise<ActionResult> {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const tuitionRef = tuitionRequestsCollection().doc(tuitionId);
  const applicationRef = tutorApplicationsCollection().doc(applicationId);
  const assignmentRef = tuitionAssignmentsCollection().doc();
  const now = FieldValue.serverTimestamp();

  const result = await adminFirestore.runTransaction(async (tx) => {
    const [tuitionSnap, applicationSnap, otherApplicantsSnap] = await Promise.all([
      tx.get(tuitionRef),
      tx.get(applicationRef),
      tx.get(
        tutorApplicationsCollection().where("tuitionId", "==", tuitionId).where("status", "==", "APPLIED"),
      ),
    ]);

    const tuition = tuitionSnap.data();
    if (!tuition) return { ok: false as const, error: "Tuition not found." };

    try {
      assertBranchScope(session, tuition.branchId);
    } catch {
      return { ok: false as const, error: "You are not authorized to act on this tuition." };
    }

    if (tuition.status !== "OPEN") {
      return { ok: false as const, error: "This tuition is no longer open for assignment." };
    }

    const application = applicationSnap.data();
    if (!application || application.tuitionId !== tuitionId) {
      return { ok: false as const, error: "Application not found for this tuition." };
    }
    if (application.status !== "APPLIED") {
      return { ok: false as const, error: "This application is no longer available for assignment." };
    }

    tx.set(assignmentRef, {
      id: assignmentRef.id,
      assignmentUid: "", // filled in after the transaction (UID generation is its own transaction)
      tuitionId,
      tutorId: application.tutorId,
      applicationId,
      assignedByUserId: session.uid,
      assignedAt: now,
      status: "ACTIVE",
      withdrawalRequestedAt: null,
      withdrawalReason: null,
      withdrawalReviewedBy: null,
      withdrawalReviewedAt: null,
      endedAt: null,
      endReason: null,
      createdAt: now,
      updatedAt: now,
    });

    tx.update(tuitionRef, {
      status: "ASSIGNED",
      assignedApplicationId: applicationId,
      updatedAt: now,
    });

    tx.update(applicationRef, {
      status: "SELECTED",
      selectedAt: now,
      updatedAt: now,
    });

    const nonSelectedTutorIds: string[] = [];
    for (const doc of otherApplicantsSnap.docs) {
      if (doc.id === applicationId) continue;
      tx.update(doc.ref, { status: "REJECTED", updatedAt: now });
      nonSelectedTutorIds.push(doc.data().tutorId);
    }

    return {
      ok: true as const,
      tutorId: application.tutorId,
      tuitionUid: tuition.tuitionUid,
      nonSelectedTutorIds,
    };
  });

  if (!result.ok) return result;

  const assignmentUid = await generateSequentialUid("assignment");
  await assignmentRef.update({ assignmentUid });

  await writeAuditEvent({
    action: "ASSIGNMENT_CREATED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "TuitionAssignment",
    targetId: assignmentRef.id,
    metadata: { tuitionId, applicationId, assignmentUid },
  });

  // Notification failures must never roll back an already-committed
  // assignment (notifications.ts doc comment) — best-effort, fire after commit.
  await createNotification({
    recipientUserId: result.tutorId,
    type: "ASSIGNMENT_CREATED",
    title: "You've been selected",
    body: `You have been assigned to tuition ${result.tuitionUid}.`,
    relatedEntityType: "TuitionAssignment",
    relatedEntityId: assignmentRef.id,
  });

  await Promise.all(
    result.nonSelectedTutorIds.map((tutorId) =>
      createNotification({
        recipientUserId: tutorId,
        type: "APPLICATION_NOT_SELECTED",
        title: "Application update",
        body: `Your application for tuition ${result.tuitionUid} was not selected.`,
        relatedEntityType: "TuitionRequest",
        relatedEntityId: tuitionId,
      }),
    ),
  );

  return { ok: true };
}
