"use server";

import { FieldValue } from "firebase-admin/firestore";
import { requireRole } from "@/server/auth/guards";
import { tutorsCollection } from "@/server/domain/collections";

/**
 * Persists the one-time approval banner "seen" state on the Tutor record
 * so it never reappears — on refresh, on a new device, or after logout —
 * per PRD section 14 and the tutor-lifecycle skill. Deliberately not
 * derived from `verificationStatus === 'APPROVED'` alone.
 */
export async function acknowledgeApprovalBanner(): Promise<void> {
  const session = await requireRole(["TUTOR"]);
  if (!session.tutor || session.tutor.approvalBannerSeenAt) return;
  if (session.tutor.verificationStatus !== "APPROVED") return;

  await tutorsCollection().doc(session.uid).update({
    approvalBannerSeenAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}
