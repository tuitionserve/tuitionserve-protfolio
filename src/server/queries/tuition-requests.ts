import {
  fetchDocsByIds,
  parentsCollection,
  studentsCollection,
  tuitionRequestsCollection,
  tutorApplicationsCollection,
} from "@/server/domain/collections";
import type { AuthSession } from "@/server/auth/session";
import type { TuitionRequest } from "@/server/domain/types";
import { fetchPage, type PageResult } from "@/server/domain/pagination";
import { resolveBranchScope } from "@/server/domain/branch-scope";

export interface TuitionRequestQueueRow {
  request: TuitionRequest;
  parentName: string | null;
  studentName: string | null;
}

function requestStudentIds(r: TuitionRequest): string[] {
  if (Array.isArray(r.studentIds) && r.studentIds.length > 0) return r.studentIds;
  const legacyId = (r as unknown as { studentId?: string | null }).studentId;
  return legacyId ? [legacyId] : [];
}

async function withParentAndStudent(requests: TuitionRequest[]): Promise<TuitionRequestQueueRow[]> {
  if (requests.length === 0) return [];
  const allStudentIds = requests.flatMap(requestStudentIds);
  const [parentMap, studentMap] = await Promise.all([
    fetchDocsByIds(parentsCollection(), requests.map((r) => r.parentId)),
    fetchDocsByIds(studentsCollection(), allStudentIds),
  ]);

  return requests.map((request) => {
    const names = requestStudentIds(request)
      .map((id) => studentMap.get(id)?.fullName)
      .filter((n): n is string => Boolean(n));
    return {
      request,
      parentName: parentMap.get(request.parentId)?.fullName ?? null,
      studentName: names.length > 0 ? names.join(", ") : null,
    };
  });
}

function statusQuery(
  session: AuthSession,
  status: "NEW" | "OPEN" | "ASSIGNED" | "REJECTED" | "CANCELLED",
  branchFilter: string | null = null,
) {
  const scope = resolveBranchScope(session, branchFilter);
  return scope
    ? tuitionRequestsCollection().where("branchId", "==", scope).where("status", "==", status)
    : tuitionRequestsCollection().where("status", "==", status);
}

/** Branch-scoped, paginated queue of NEW tuition requests. `branchFilter` only narrows a Super Admin's view — a Branch Admin stays locked to their own branch regardless. */
export async function getTuitionRequestQueue(
  session: AuthSession,
  cursor: string | null,
  branchFilter: string | null = null,
): Promise<PageResult<TuitionRequestQueueRow>> {
  const page = await fetchPage(statusQuery(session, "NEW", branchFilter), "createdAt", cursor);
  return { ...page, items: await withParentAndStudent(page.items) };
}

/** Branch-scoped, paginated list of OPEN tuitions (confirmed, awaiting/reviewing applicants). */
export async function getOpenTuitionsQueue(
  session: AuthSession,
  cursor: string | null,
  branchFilter: string | null = null,
): Promise<PageResult<TuitionRequestQueueRow>> {
  const page = await fetchPage(statusQuery(session, "OPEN", branchFilter), "createdAt", cursor);
  return { ...page, items: await withParentAndStudent(page.items) };
}

/** Branch-scoped, paginated list of ASSIGNED tuitions (a tutor has been selected). */
export async function getAssignedTuitionsQueue(
  session: AuthSession,
  cursor: string | null,
  branchFilter: string | null = null,
): Promise<PageResult<TuitionRequestQueueRow>> {
  const page = await fetchPage(statusQuery(session, "ASSIGNED", branchFilter), "createdAt", cursor);
  return { ...page, items: await withParentAndStudent(page.items) };
}

/** Branch-scoped, paginated list of REJECTED tuition requests. */
export async function getRejectedTuitionsQueue(
  session: AuthSession,
  cursor: string | null,
  branchFilter: string | null = null,
): Promise<PageResult<TuitionRequestQueueRow>> {
  const page = await fetchPage(statusQuery(session, "REJECTED", branchFilter), "createdAt", cursor);
  return { ...page, items: await withParentAndStudent(page.items) };
}

/** Branch-scoped, paginated list of CANCELLED tuitions — closed out after a tutor's withdrawal was approved and the admin chose not to reopen it (see server/actions/withdrawal.ts's cancelTuition). */
export async function getCancelledTuitionsQueue(
  session: AuthSession,
  cursor: string | null,
  branchFilter: string | null = null,
): Promise<PageResult<TuitionRequestQueueRow>> {
  const page = await fetchPage(statusQuery(session, "CANCELLED", branchFilter), "createdAt", cursor);
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
 * admin decision is actually waiting ("ready to select a tutor"). Uses
 * two lightweight `.select()` queries (open tuition IDs + applied
 * applications' tuitionId) instead of an N+1 per-tuition sub-query.
 */
export async function countSelectionsReady(session: AuthSession): Promise<number> {
  const openSnap = await statusQuery(session, "OPEN").select().limit(200).get();
  if (openSnap.empty) return 0;

  const openIds = new Set(openSnap.docs.map((d) => d.id));
  const scope = resolveBranchScope(session, null);
  const appliedBase = scope
    ? tutorApplicationsCollection().where("branchId", "==", scope).where("status", "==", "APPLIED")
    : tutorApplicationsCollection().where("status", "==", "APPLIED");
  const appliedSnap = await appliedBase.select("tuitionId").limit(1000).get();

  const readyTuitionIds = new Set<string>();
  for (const doc of appliedSnap.docs) {
    const tuitionId = doc.get("tuitionId") as string | undefined;
    if (tuitionId && openIds.has(tuitionId)) {
      readyTuitionIds.add(tuitionId);
    }
  }
  return readyTuitionIds.size;
}
