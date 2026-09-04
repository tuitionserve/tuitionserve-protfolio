import {
  parentsCollection,
  studentsCollection,
  tuitionRequestsCollection,
  tutorApplicationsCollection,
} from "@/server/domain/collections";
import type { AuthSession } from "@/server/auth/session";
import type { TuitionRequest } from "@/server/domain/types";
import { fetchPage, type PageResult } from "@/server/domain/pagination";

export interface TuitionRequestQueueRow {
  request: TuitionRequest;
  parentName: string | null;
  studentName: string | null;
}

async function withParentAndStudent(requests: TuitionRequest[]): Promise<TuitionRequestQueueRow[]> {
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

function statusQuery(session: AuthSession, status: "NEW" | "OPEN") {
  return session.role === "BRANCH_ADMIN"
    ? tuitionRequestsCollection().where("branchId", "==", session.branchId).where("status", "==", status)
    : tuitionRequestsCollection().where("status", "==", status);
}

/** Branch-scoped, paginated queue of NEW tuition requests. */
export async function getTuitionRequestQueue(
  session: AuthSession,
  cursor: string | null,
): Promise<PageResult<TuitionRequestQueueRow>> {
  const page = await fetchPage(statusQuery(session, "NEW"), "createdAt", cursor);
  return { ...page, items: await withParentAndStudent(page.items) };
}

/** Branch-scoped, paginated list of OPEN tuitions (confirmed, awaiting/reviewing applicants). */
export async function getOpenTuitionsQueue(
  session: AuthSession,
  cursor: string | null,
): Promise<PageResult<TuitionRequestQueueRow>> {
  const page = await fetchPage(statusQuery(session, "OPEN"), "createdAt", cursor);
  return { ...page, items: await withParentAndStudent(page.items) };
}

/** Cheap count-only versions for dashboard tiles — never fetch full documents just to read `.length`. */
export async function countTuitionRequestQueue(session: AuthSession): Promise<number> {
  return (await statusQuery(session, "NEW").count().get()).data().count;
}
export async function countOpenTuitionsQueue(session: AuthSession): Promise<number> {
  return (await statusQuery(session, "OPEN").count().get()).data().count;
}

/**
 * Count of OPEN tuitions that already have >=1 APPLIED applicant — an
 * admin decision is actually waiting ("ready to select a tutor"), not
 * just "opportunity is live and might still get zero applicants".
 * Backs the dashboard "Selections" tile. Capped at a bounded scan
 * (first 200 open tuitions) rather than pagination — this is a
 * dashboard summary number, not a browsable list, and TuitionRequests
 * doesn't denormalize an applicant count, so an exact total for
 * thousands of open tuitions would need one sub-query per tuition
 * regardless; 200 is a generous bound for a single branch's open queue.
 */
export async function countSelectionsReady(session: AuthSession): Promise<number> {
  const snap = await statusQuery(session, "OPEN").limit(200).get();
  const applicantSnaps = await Promise.all(
    snap.docs.map((d) =>
      tutorApplicationsCollection().where("tuitionId", "==", d.id).where("status", "==", "APPLIED").limit(1).get(),
    ),
  );
  return applicantSnaps.filter((s) => !s.empty).length;
}
