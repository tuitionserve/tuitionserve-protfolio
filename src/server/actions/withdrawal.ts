"use server";

import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { assertBranchScope, requireActiveTutor, requireRole } from "@/server/auth/guards";
import { tuitionAssignmentsCollection, tuitionRequestsCollection } from "@/server/domain/collections";
import { writeAuditEvent } from "@/server/domain/audit";
import { createNotification, notifyAdminsForBranch } from "@/server/domain/notifications";

export type ActionResult = { ok: true } | { ok: false; error: string };

const reasonSchema = z.string().trim().min(1, "A reason is required.").max(1000, "Keep the reason under 1000 characters.");

/**
 * Tutor requests withdrawal from a post-assignment tuition (PRD section
 * 18, UX flow "20. Post-Assignment Withdrawal", role-authorization
 * skill: "A tutor cannot force a completed withdrawal transition by
 * changing their own status"). This only *flags* the assignment as
 * pending review — it deliberately does NOT change the assignment's
 * `status` (stays ACTIVE) or the tuition's status. An admin decision via
 * `reviewAssignmentWithdrawal` is required to actually release the
 * assignment.
 */
export async function requestAssignmentWithdrawal(assignmentId: string, reason: string): Promise<ActionResult> {
  const parsed = reasonSchema.safeParse(reason);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "A reason is required." };
  }

  const session = await requireActiveTutor();
  const ref = tuitionAssignmentsCollection().doc(assignmentId);
  const now = FieldValue.serverTimestamp();

  const result = await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const assignment = snap.data();
    if (!assignment || assignment.tutorId !== session.uid) {
      return { ok: false as const, error: "Assignment not found." };
    }
    if (assignment.status !== "ACTIVE") {
      return { ok: false as const, error: "This assignment is no longer active." };
    }
    if (assignment.withdrawalRequestedAt) {
      return { ok: false as const, error: "A withdrawal request is already pending review." };
    }

    tx.update(ref, {
      withdrawalRequestedAt: now,
      withdrawalReason: parsed.data,
      updatedAt: now,
    });

    return { ok: true as const, tuitionId: assignment.tuitionId };
  });

  if (!result.ok) return result;

  const tuitionSnap = await tuitionRequestsCollection().doc(result.tuitionId).get();
  const tuition = tuitionSnap.data();

  await writeAuditEvent({
    action: "ASSIGNMENT_WITHDRAWAL_REQUESTED",
    actorUserId: session.uid,
    actorRole: "TUTOR",
    targetType: "TuitionAssignment",
    targetId: assignmentId,
    metadata: { reason: parsed.data },
  });

  await notifyAdminsForBranch(tuition?.branchId ?? null, {
    type: "WITHDRAWAL_REQUESTED",
    title: "Withdrawal request",
    body: `A tutor requested withdrawal from tuition ${tuition?.tuitionUid ?? result.tuitionId}.`,
    relatedEntityType: "TuitionAssignment",
    relatedEntityId: assignmentId,
  });

  return { ok: true };
}

async function loadAssignmentForAdminReview(assignmentId: string) {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const assignmentSnap = await tuitionAssignmentsCollection().doc(assignmentId).get();
  if (!assignmentSnap.exists) return { ok: false as const, error: "Assignment not found." };
  const assignment = assignmentSnap.data()!;

  const tuitionSnap = await tuitionRequestsCollection().doc(assignment.tuitionId).get();
  if (!tuitionSnap.exists) return { ok: false as const, error: "Tuition not found." };
  const tuition = tuitionSnap.data()!;

  try {
    assertBranchScope(session, tuition.branchId);
  } catch {
    return { ok: false as const, error: "You are not authorized to act on this assignment." };
  }

  return { ok: true as const, session, tuition };
}

/**
 * Admin decides a pending post-assignment withdrawal request (PRD
 * section 18: "Admin can initiate/approve withdrawal and release the
 * assignment"; UX flow "20. Post-Assignment Withdrawal": "[Reject]
 * [Approve]"). Branch-scoped via the assignment's tuition (assignments
 * don't carry `branchId` directly). Re-verifies the pending-request
 * state *inside* the transaction so a duplicate/late decision cannot
 * double-apply (domain-data-integrity skill: "two approval decisions on
 * the same review").
 *
 * Judgment call on REJECT: the withdrawal request fields
 * (`withdrawalRequestedAt`/`withdrawalReason`) are cleared rather than
 * kept-but-marked-reviewed, so "does this assignment have a pending
 * request" stays a single truthy check
 * (`status === "ACTIVE" && withdrawalRequestedAt`) everywhere the UI/
 * queries need it. The decision itself is still fully recorded in the
 * audit event and via `withdrawalReviewedBy`/`withdrawalReviewedAt`
 * (kept on rejection as a "last reviewed" marker), so no history is
 * lost — only the *pending* markers are cleared.
 */
export async function reviewAssignmentWithdrawal(
  assignmentId: string,
  decision: "APPROVE" | "REJECT",
  reviewNote?: string,
): Promise<ActionResult> {
  if (decision !== "APPROVE" && decision !== "REJECT") {
    return { ok: false, error: "Invalid decision." };
  }

  const loaded = await loadAssignmentForAdminReview(assignmentId);
  if (!loaded.ok) return loaded;
  const { session, tuition } = loaded;

  const assignmentRef = tuitionAssignmentsCollection().doc(assignmentId);
  const now = FieldValue.serverTimestamp();

  const result = await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(assignmentRef);
    const assignment = snap.data();
    if (!assignment) return { ok: false as const, error: "Assignment not found." };
    if (assignment.status !== "ACTIVE" || !assignment.withdrawalRequestedAt) {
      return { ok: false as const, error: "There is no pending withdrawal request for this assignment." };
    }

    if (decision === "APPROVE") {
      tx.update(assignmentRef, {
        status: "RELEASED",
        endedAt: now,
        endReason: assignment.withdrawalReason,
        withdrawalReviewedBy: session.uid,
        withdrawalReviewedAt: now,
        updatedAt: now,
      });
    } else {
      tx.update(assignmentRef, {
        withdrawalRequestedAt: null,
        withdrawalReason: null,
        withdrawalReviewedBy: session.uid,
        withdrawalReviewedAt: now,
        updatedAt: now,
      });
    }

    return { ok: true as const, tutorId: assignment.tutorId };
  });

  if (!result.ok) return result;

  await writeAuditEvent({
    action: decision === "APPROVE" ? "ASSIGNMENT_WITHDRAWAL_APPROVED" : "ASSIGNMENT_WITHDRAWAL_REJECTED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "TuitionAssignment",
    targetId: assignmentId,
    metadata: reviewNote ? { reviewNote } : {},
  });

  const tuitionUid = tuition.tuitionUid;

  if (decision === "APPROVE") {
    await createNotification({
      recipientUserId: result.tutorId,
      type: "WITHDRAWAL_APPROVED",
      title: "Withdrawal approved",
      body: `Your withdrawal from tuition ${tuitionUid} has been approved. The assignment has ended.`,
      relatedEntityType: "TuitionAssignment",
      relatedEntityId: assignmentId,
    });
    // "Notify the tutor and the admin" (task scope) — fan out to the
    // branch admin group so anyone monitoring the branch sees the
    // tuition now needs an explicit reopen decision.
    await notifyAdminsForBranch(tuition.branchId, {
      type: "ASSIGNMENT_RELEASED",
      title: "Assignment released",
      body: `The assignment for tuition ${tuitionUid} was released after an approved withdrawal. It is awaiting a reopen decision.`,
      relatedEntityType: "TuitionAssignment",
      relatedEntityId: assignmentId,
    });
  } else {
    await createNotification({
      recipientUserId: result.tutorId,
      type: "WITHDRAWAL_REJECTED",
      title: "Withdrawal request rejected",
      body: `Your withdrawal request for tuition ${tuitionUid} was not approved. You remain assigned.`,
      relatedEntityType: "TuitionAssignment",
      relatedEntityId: assignmentId,
    });
  }

  return { ok: true };
}

/**
 * Admin reopens a tuition after an approved post-assignment withdrawal
 * (PRD section 18 "Reopen"; UX flow "21. Reopen": "This will make the
 * tuition available to new tutor applicants."). Only valid when the
 * tuition's most recent assignment is RELEASED — reopening only makes
 * sense after a withdrawal was approved, not for a tuition whose
 * assignment is still ACTIVE (tuition-workflow skill: "reopen the
 * tuition when the admin chooses to do so", scoped to the withdrawal
 * flow, not a generic "unassign" escape hatch).
 *
 * Judgment call (task scope, see prompt): `TuitionRequestStatus` has no
 * dedicated "released, awaiting reopen" value. Rather than extending the
 * shared enum (a bigger schema change touching every consumer of that
 * type), a released-but-not-yet-reopened tuition is represented as
 * `tuition.status === "ASSIGNED"` with its latest `TuitionAssignment`
 * `status === "RELEASED"` — the pair of fields *together* carry the
 * state. Every place that needs to distinguish "actively assigned" from
 * "released, needs a reopen decision" (this action, the admin detail
 * page) derives it that way rather than trusting `tuition.status` alone.
 *
 * Never touches the old (RELEASED) assignment or any prior applications
 * — full history survives untouched (domain-data-integrity skill:
 * "never delete a released assignment"). Does not notify every tutor
 * platform-wide; the reopened tuition simply becomes visible again to
 * anyone browsing OPEN opportunities.
 */
export async function reopenTuition(tuitionId: string): Promise<ActionResult> {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const tuitionRef = tuitionRequestsCollection().doc(tuitionId);
  const tuitionSnap = await tuitionRef.get();
  if (!tuitionSnap.exists) return { ok: false, error: "Tuition not found." };
  const tuition = tuitionSnap.data()!;

  try {
    assertBranchScope(session, tuition.branchId);
  } catch {
    return { ok: false, error: "You are not authorized to act on this tuition." };
  }

  if (tuition.status !== "ASSIGNED") {
    return { ok: false, error: "Only an assigned tuition can be reopened." };
  }

  const latestAssignmentSnap = await tuitionAssignmentsCollection()
    .where("tuitionId", "==", tuitionId)
    .orderBy("assignedAt", "desc")
    .limit(1)
    .get();
  const latestAssignment = latestAssignmentSnap.docs[0]?.data();
  if (!latestAssignment || latestAssignment.status !== "RELEASED") {
    return { ok: false, error: "This tuition has no released assignment to reopen from." };
  }

  const now = FieldValue.serverTimestamp();

  const result = await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(tuitionRef);
    const current = snap.data();
    if (!current || current.status !== "ASSIGNED") {
      return { ok: false as const, error: "This tuition can no longer be reopened." };
    }
    tx.update(tuitionRef, {
      status: "OPEN",
      assignedApplicationId: null,
      updatedAt: now,
    });
    return { ok: true as const };
  });

  if (!result.ok) return result;

  await writeAuditEvent({
    action: "TUITION_REOPENED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "TuitionRequest",
    targetId: tuitionId,
    metadata: { previousAssignmentId: latestAssignment.id },
  });

  return { ok: true };
}

/**
 * Admin closes out a tuition after an approved withdrawal, instead of
 * reopening it — the other half of the decision reopenTuition already
 * covers ("find a new tutor" vs. "the family doesn't need one
 * anymore"). Same eligibility rule: only valid when the tuition's most
 * recent assignment is RELEASED. Reuses `rejectionReason` to record why
 * (same "why this didn't proceed" field the NEW->REJECTED transition
 * already uses) rather than adding a parallel field for the same idea.
 * Never deletes anything — the tuition, its applications, and the
 * released assignment all survive with full history, just no longer
 * actionable (see the admin detail page's CANCELLED branch).
 */
export async function cancelTuition(tuitionId: string, reason: string): Promise<ActionResult> {
  const parsed = reasonSchema.safeParse(reason);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "A reason is required." };
  }

  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const tuitionRef = tuitionRequestsCollection().doc(tuitionId);
  const tuitionSnap = await tuitionRef.get();
  if (!tuitionSnap.exists) return { ok: false, error: "Tuition not found." };
  const tuition = tuitionSnap.data()!;

  try {
    assertBranchScope(session, tuition.branchId);
  } catch {
    return { ok: false, error: "You are not authorized to act on this tuition." };
  }

  if (tuition.status !== "ASSIGNED") {
    return { ok: false, error: "Only an assigned tuition can be cancelled this way." };
  }

  const latestAssignmentSnap = await tuitionAssignmentsCollection()
    .where("tuitionId", "==", tuitionId)
    .orderBy("assignedAt", "desc")
    .limit(1)
    .get();
  const latestAssignment = latestAssignmentSnap.docs[0]?.data();
  if (!latestAssignment || latestAssignment.status !== "RELEASED") {
    return { ok: false, error: "This tuition has no released assignment to cancel from." };
  }

  const now = FieldValue.serverTimestamp();

  const result = await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(tuitionRef);
    const current = snap.data();
    if (!current || current.status !== "ASSIGNED") {
      return { ok: false as const, error: "This tuition can no longer be cancelled." };
    }
    tx.update(tuitionRef, {
      status: "CANCELLED",
      rejectionReason: parsed.data,
      updatedAt: now,
    });
    return { ok: true as const };
  });

  if (!result.ok) return result;

  await writeAuditEvent({
    action: "TUITION_CANCELLED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "TuitionRequest",
    targetId: tuitionId,
    metadata: { previousAssignmentId: latestAssignment.id, reason: parsed.data },
  });

  return { ok: true };
}
