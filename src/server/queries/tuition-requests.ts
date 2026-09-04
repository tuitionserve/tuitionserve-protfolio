import {
  parentsCollection,
  studentsCollection,
  tuitionRequestsCollection,
  tutorApplicationsCollection,
} from "@/server/domain/collections";
import type { AuthSession } from "@/server/auth/session";
import type { TuitionRequest } from "@/server/domain/types";

export interface TuitionRequestQueueRow {
  request: TuitionRequest;
  parentName: string | null;
  studentName: string | null;
}

/** Branch-scoped queue of NEW tuition requests — never leaks another branch's requests to a Branch Admin. */
export async function getTuitionRequestQueue(session: AuthSession): Promise<TuitionRequestQueueRow[]> {
  const snap =
    session.role === "BRANCH_ADMIN"
      ? await tuitionRequestsCollection().where("branchId", "==", session.branchId).get()
      : await tuitionRequestsCollection().where("status", "==", "NEW").get();

  const requests = snap.docs
    .map((d) => d.data())
    .filter((r) => r.status === "NEW")
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));

  const [parents, students] = await Promise.all([
    Promise.all(requests.map((r) => parentsCollection().doc(r.parentId).get())),
    Promise.all(requests.map((r) => studentsCollection().doc(r.studentId).get())),
  ]);

  return requests.map((request, i) => ({
    request,
    parentName: parents[i]?.data()?.fullName ?? null,
    studentName: students[i]?.data()?.fullName ?? null,
  }));
}

/**
 * Branch-scoped list of OPEN tuitions that already have at least one
 * APPLIED applicant — i.e. an admin decision is actually waiting
 * ("ready to select a tutor"), not just "opportunity is live and might
 * still get zero applicants". Backs the dashboard "Selections" tile:
 * counting *tuitions* (not raw application rows) so the number reads as
 * "N assignment decisions waiting on you".
 */
export async function getSelectionsReadyQueue(session: AuthSession): Promise<TuitionRequestQueueRow[]> {
  const openRows = await getOpenTuitionsQueue(session);
  if (openRows.length === 0) return [];

  const applicantSnaps = await Promise.all(
    openRows.map((row) =>
      tutorApplicationsCollection()
        .where("tuitionId", "==", row.request.id)
        .where("status", "==", "APPLIED")
        .limit(1)
        .get(),
    ),
  );

  return openRows.filter((_, i) => !applicantSnaps[i].empty);
}

/** Branch-scoped list of OPEN tuitions (confirmed, awaiting/reviewing applicants). */
export async function getOpenTuitionsQueue(session: AuthSession): Promise<TuitionRequestQueueRow[]> {
  const snap =
    session.role === "BRANCH_ADMIN"
      ? await tuitionRequestsCollection().where("branchId", "==", session.branchId).get()
      : await tuitionRequestsCollection().where("status", "==", "OPEN").get();

  const requests = snap.docs
    .map((d) => d.data())
    .filter((r) => r.status === "OPEN")
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));

  const [parents, students] = await Promise.all([
    Promise.all(requests.map((r) => parentsCollection().doc(r.parentId).get())),
    Promise.all(requests.map((r) => studentsCollection().doc(r.studentId).get())),
  ]);

  return requests.map((request, i) => ({
    request,
    parentName: parents[i]?.data()?.fullName ?? null,
    studentName: students[i]?.data()?.fullName ?? null,
  }));
}
