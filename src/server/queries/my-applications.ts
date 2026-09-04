import { tuitionAssignmentsCollection, tuitionRequestsCollection, tutorApplicationsCollection } from "@/server/domain/collections";
import type {
  TutorApplication,
  TuitionAssignmentStatus,
  TuitionRequest,
  TutorApplicationStatus,
} from "@/server/domain/types";
import { fetchPage, type PageResult } from "@/server/domain/pagination";

/**
 * Client-safe assignment summary for a SELECTED application (no
 * Firestore Timestamp fields — same reasoning as AdminApplicantView).
 * `hasPendingWithdrawal` is true only while the assignment is still
 * ACTIVE with an unreviewed withdrawal request; once approved the
 * assignment flips to RELEASED (see withdrawal.ts's reviewAssignmentWithdrawal).
 */
export interface MyAssignmentSummary {
  id: string;
  status: TuitionAssignmentStatus;
  hasPendingWithdrawal: boolean;
}

export interface MyApplicationRow {
  application: TutorApplication;
  tuition: TuitionRequest | null; // tutor-safe fields are read from here by the page, never exactAddress
  /** Only populated for a SELECTED application — a tutor only has an assignment once selected. */
  assignment: MyAssignmentSummary | null;
}

async function withTuitionsAndAssignments(applications: TutorApplication[]): Promise<MyApplicationRow[]> {
  const [tuitionSnaps, assignmentSnaps] = await Promise.all([
    Promise.all(applications.map((a) => tuitionRequestsCollection().doc(a.tuitionId).get())),
    Promise.all(
      applications.map((a) =>
        a.status === "SELECTED"
          ? tuitionAssignmentsCollection().where("applicationId", "==", a.id).limit(1).get()
          : null,
      ),
    ),
  ]);

  return applications.map((application, i) => {
    const assignmentSnap = assignmentSnaps[i];
    const assignmentDoc = assignmentSnap && !assignmentSnap.empty ? assignmentSnap.docs[0]!.data() : null;
    return {
      application,
      tuition: tuitionSnaps[i]?.exists ? tuitionSnaps[i]!.data()! : null,
      assignment: assignmentDoc
        ? {
            id: assignmentDoc.id,
            status: assignmentDoc.status,
            hasPendingWithdrawal: assignmentDoc.status === "ACTIVE" && !!assignmentDoc.withdrawalRequestedAt,
          }
        : null,
    };
  });
}

export async function getMyApplications(
  tutorId: string,
  cursor: string | null,
): Promise<PageResult<MyApplicationRow>> {
  const base = tutorApplicationsCollection().where("tutorId", "==", tutorId);
  const page = await fetchPage(base, "appliedAt", cursor);
  return { ...page, items: await withTuitionsAndAssignments(page.items) };
}

/**
 * Cheap, unpaginated summary for the tutor dashboard tiles — counts by
 * status via `.count()` aggregation (no document reads), rather than
 * fetching every application just to filter/count in memory.
 */
export async function getMyApplicationStatusCounts(
  tutorId: string,
): Promise<Record<TutorApplicationStatus, number>> {
  const statuses: TutorApplicationStatus[] = ["APPLIED", "WITHDRAWN", "SELECTED", "REJECTED"];
  const counts = await Promise.all(
    statuses.map((status) =>
      tutorApplicationsCollection()
        .where("tutorId", "==", tutorId)
        .where("status", "==", status)
        .count()
        .get()
        .then((s) => s.data().count),
    ),
  );
  return Object.fromEntries(statuses.map((status, i) => [status, counts[i]])) as Record<
    TutorApplicationStatus,
    number
  >;
}
