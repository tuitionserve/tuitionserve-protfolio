"use server";

import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminFirestore } from "@/lib/firebase/admin";
import { assertBranchScope, requireRole } from "@/server/auth/guards";
import { tuitionRequestsCollection } from "@/server/domain/collections";
import { writeAuditEvent } from "@/server/domain/audit";

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

export async function confirmTuitionRequest(requestId: string): Promise<ActionResult> {
  const { session, ref } = await loadRequestForAdminReview(requestId);

  const result = await adminFirestore.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const request = snap.data();
    if (!request || request.status !== "NEW") return { ok: false as const };
    tx.update(ref, {
      status: "CONFIRMED",
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

  return { ok: true };
}
