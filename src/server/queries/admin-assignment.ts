import { tuitionAssignmentsCollection, tutorApplicationsCollection } from "@/server/domain/collections";
import type { TuitionAssignmentStatus } from "@/server/domain/types";

/**
 * Client-safe assignment view for the admin tuition detail page —
 * excludes Firestore Timestamp fields (assignedAt, endedAt, etc.), same
 * reasoning as AdminApplicantView (admin-applicants.ts): this crosses
 * the Server -> Client Component boundary and Timestamp instances don't
 * survive RSC serialization.
 */
export interface AdminAssignmentView {
  id: string;
  assignmentUid: string;
  status: TuitionAssignmentStatus;
  tutorUid: string;
  tutorName: string | null;
  hasPendingWithdrawal: boolean;
  withdrawalReason: string | null;
}

/**
 * The most recent assignment for a tuition (by `assignedAt`) — the one
 * relevant to an ASSIGNED tuition's admin detail view, whether it's
 * still ACTIVE (with or without a pending withdrawal request) or
 * RELEASED (approved withdrawal, awaiting an explicit reopen decision).
 * Caller must already have verified branch scope on the tuition.
 *
 * Tutor identity is read from the originating application's frozen
 * `snapshot` (same source ApplicantsList/admin-applicants.ts use)
 * rather than a fresh Tutor/TutorProfile lookup — consistent with the
 * snapshot principle and avoids an extra collection dependency here.
 */
export async function getLatestAssignmentForTuition(tuitionId: string): Promise<AdminAssignmentView | null> {
  const snap = await tuitionAssignmentsCollection()
    .where("tuitionId", "==", tuitionId)
    .orderBy("assignedAt", "desc")
    .limit(1)
    .get();
  const doc = snap.docs[0];
  if (!doc) return null;
  const assignment = doc.data();

  const applicationSnap = await tutorApplicationsCollection().doc(assignment.applicationId).get();
  const application = applicationSnap.data();

  return {
    id: assignment.id,
    assignmentUid: assignment.assignmentUid,
    status: assignment.status,
    tutorUid: application?.snapshot.tutorUid ?? "Unknown tutor",
    tutorName: application?.snapshot.fullName ?? null,
    hasPendingWithdrawal: assignment.status === "ACTIVE" && !!assignment.withdrawalRequestedAt,
    withdrawalReason: assignment.withdrawalReason,
  };
}
