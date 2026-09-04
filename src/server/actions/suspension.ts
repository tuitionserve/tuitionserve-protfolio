"use server";

import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { assertBranchScope, requireRole } from "@/server/auth/guards";
import { tutorsCollection } from "@/server/domain/collections";
import { writeAuditEvent } from "@/server/domain/audit";
import { createNotification } from "@/server/domain/notifications";

/**
 * M12 gap-fill: suspend/reactivate was never built in M4 (which only
 * covered approve/reject) even though the Tutor schema has carried
 * `suspensionReason`/`suspendedAt`/`reactivatedAt` since M2, the role
 * matrix lists "Suspend tutor"/"Reactivate tutor" as branch-scoped admin
 * actions, and the notification event list explicitly includes "account
 * suspended/reactivated" — building M12's notification coverage surfaced
 * that gap, so it's filled here rather than notifying for an action that
 * couldn't happen (PRD section 13 / tutor-lifecycle skill: "Suspension
 * must not delete the tutor").
 */

export type ActionResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> };

const suspendSchema = z.object({
  reason: z.string().trim().min(1, "A suspension reason is required.").max(1000),
});

async function loadTutorForAdmin(tutorId: string) {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const tutorRef = tutorsCollection().doc(tutorId);
  const tutorSnap = await tutorRef.get();
  if (!tutorSnap.exists) throw new Error("Tutor not found.");
  const tutor = tutorSnap.data()!;
  assertBranchScope(session, tutor.branchId);
  return { session, tutorRef, tutor };
}

/**
 * Only a currently APPROVED (verified) tutor can be suspended — the
 * "blocked from normal tutor operations" state only means something for
 * a tutor who was otherwise allowed to operate. `requireActiveTutor()`
 * (src/server/auth/guards.ts, built in M2) already redirects any tutor
 * whose `verificationStatus === "SUSPENDED"` to /suspended on every
 * tutor-side page/action — this action only needs to flip that status.
 */
export async function suspendTutor(tutorId: string, reason: string): Promise<ActionResult> {
  const parsed = suspendSchema.safeParse({ reason });
  if (!parsed.success) {
    return { ok: false, error: "A suspension reason is required.", fieldErrors: { reason: "A suspension reason is required." } };
  }

  const { session, tutorRef } = await loadTutorForAdmin(tutorId);

  const result = await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(tutorRef);
    const tutor = snap.data();
    if (!tutor || tutor.verificationStatus !== "APPROVED") return { ok: false as const };
    tx.update(tutorRef, {
      verificationStatus: "SUSPENDED",
      suspensionReason: parsed.data.reason,
      suspendedAt: FieldValue.serverTimestamp(),
      reactivatedAt: null,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true as const, tutorUserId: tutor.userAccountId };
  });

  if (!result.ok) return { ok: false, error: "Only a currently verified tutor can be suspended." };

  await writeAuditEvent({
    action: "TUTOR_SUSPENDED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "Tutor",
    targetId: tutorId,
    metadata: { reason: parsed.data.reason },
  });

  await createNotification({
    recipientUserId: result.tutorUserId,
    type: "TUTOR_SUSPENDED",
    title: "Your account has been suspended",
    body: parsed.data.reason,
    relatedEntityType: "Tutor",
    relatedEntityId: tutorId,
  });

  return { ok: true };
}

/** Reverses a suspension without recreating the account (PRD: suspension is never deletion). */
export async function reactivateTutor(tutorId: string): Promise<ActionResult> {
  const { session, tutorRef } = await loadTutorForAdmin(tutorId);

  const result = await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(tutorRef);
    const tutor = snap.data();
    if (!tutor || tutor.verificationStatus !== "SUSPENDED") return { ok: false as const };
    tx.update(tutorRef, {
      verificationStatus: "APPROVED",
      suspensionReason: null,
      reactivatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true as const, tutorUserId: tutor.userAccountId };
  });

  if (!result.ok) return { ok: false, error: "Only a currently suspended tutor can be reactivated." };

  await writeAuditEvent({
    action: "TUTOR_REACTIVATED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "Tutor",
    targetId: tutorId,
    metadata: {},
  });

  await createNotification({
    recipientUserId: result.tutorUserId,
    type: "TUTOR_REACTIVATED",
    title: "Your account has been reactivated",
    body: "You can now sign in and resume normal tutor activity.",
    relatedEntityType: "Tutor",
    relatedEntityId: tutorId,
  });

  return { ok: true };
}
