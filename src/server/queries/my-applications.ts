import { tuitionRequestsCollection, tutorApplicationsCollection } from "@/server/domain/collections";
import type { TutorApplication, TuitionRequest, TutorApplicationStatus } from "@/server/domain/types";
import { fetchPage, type PageResult } from "@/server/domain/pagination";

export interface MyApplicationRow {
  application: TutorApplication;
  tuition: TuitionRequest | null; // tutor-safe fields are read from here by the page, never exactAddress
}

async function withTuitions(applications: TutorApplication[]): Promise<MyApplicationRow[]> {
  const tuitions = await Promise.all(applications.map((a) => tuitionRequestsCollection().doc(a.tuitionId).get()));
  return applications.map((application, i) => ({
    application,
    tuition: tuitions[i]?.exists ? tuitions[i]!.data()! : null,
  }));
}

export async function getMyApplications(
  tutorId: string,
  cursor: string | null,
): Promise<PageResult<MyApplicationRow>> {
  const base = tutorApplicationsCollection().where("tutorId", "==", tutorId);
  const page = await fetchPage(base, "appliedAt", cursor);
  return { ...page, items: await withTuitions(page.items) };
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
