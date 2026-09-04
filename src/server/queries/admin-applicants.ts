import { tutorApplicationsCollection } from "@/server/domain/collections";
import type { TutorApplication, TutorApplicationSnapshot, TutorApplicationStatus } from "@/server/domain/types";

/**
 * Client-safe applicant view — excludes Firestore Timestamp fields
 * (appliedAt, snapshot.capturedAt, etc.). This gets passed from a
 * Server Component to a Client Component (ApplicantsList); the RSC
 * serialization boundary rejects Timestamp class instances, so strip
 * them here rather than at each call site.
 */
export interface AdminApplicantView {
  id: string;
  applicationUid: string;
  status: TutorApplicationStatus;
  snapshot: Omit<TutorApplicationSnapshot, "capturedAt">;
}

function toAdminView(a: TutorApplication): AdminApplicantView {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- discarding the Timestamp field via destructuring
  const { capturedAt, ...snapshotWithoutTimestamp } = a.snapshot;
  return {
    id: a.id,
    applicationUid: a.applicationUid,
    status: a.status,
    snapshot: snapshotWithoutTimestamp,
  };
}

/** Admin-side applicant list for one tuition — caller must already have verified branch scope on the tuition. */
export async function getApplicantsForTuition(tuitionId: string): Promise<AdminApplicantView[]> {
  const snap = await tutorApplicationsCollection().where("tuitionId", "==", tuitionId).get();
  return snap.docs
    .map((d) => d.data())
    .sort((a, b) => (a.appliedAt?.toMillis() ?? 0) - (b.appliedAt?.toMillis() ?? 0))
    .map(toAdminView);
}
