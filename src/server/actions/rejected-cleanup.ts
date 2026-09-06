"use server";

import { adminFirestore } from "@/lib/firebase/admin";
import { requireRole } from "@/server/auth/guards";
import { tuitionRequestsCollection } from "@/server/domain/collections";
import { resolveBranchScope } from "@/server/domain/branch-scope";
import { writeAuditEvent } from "@/server/domain/audit";

export type ClearRejectedResult = { ok: true; deletedCount: number } | { ok: false; error: string };

/**
 * Manual bulk-delete of REJECTED tuition requests, scoped the same way
 * the Rejected page itself is (a Branch Admin's own branch; a Super
 * Admin's current branch filter, or every branch if none is set).
 * REJECTED tuitions never accumulate applications (a request can only
 * be rejected while still NEW, before it's ever opened to applicants),
 * so deleting the request itself never orphans anything.
 */
export async function clearRejectedTuitions(branchFilter: string | null): Promise<ClearRejectedResult> {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const scope = resolveBranchScope(session, branchFilter);

  const base = scope
    ? tuitionRequestsCollection().where("branchId", "==", scope).where("status", "==", "REJECTED")
    : tuitionRequestsCollection().where("status", "==", "REJECTED");

  // Capped at 500 (a Firestore batch's own limit) per click — more than
  // enough for a manual "clear the clutter" action; a real backlog past
  // that would need repeated clicks, which is fine for something this
  // infrequent.
  const snap = await base.limit(500).get();
  if (snap.empty) return { ok: true, deletedCount: 0 };

  const batch = adminFirestore.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();

  await writeAuditEvent({
    action: "REJECTED_TUITIONS_CLEARED",
    actorUserId: session.uid,
    actorRole: session.role,
    targetType: "TuitionRequest",
    targetId: scope ?? "all-branches",
    metadata: { deletedCount: snap.size },
  });

  return { ok: true, deletedCount: snap.size };
}
