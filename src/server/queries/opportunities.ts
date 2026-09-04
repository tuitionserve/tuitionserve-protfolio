import { tuitionRequestsCollection } from "@/server/domain/collections";
import type { AvailabilitySlot, TuitionRequest } from "@/server/domain/types";
import { fetchPage, type PageResult } from "@/server/domain/pagination";

/**
 * Tutor-safe view of an open tuition opportunity (PRD section 15 /
 * location-privacy skill). Deliberately does NOT include `exactAddress`
 * or parent contact fields — this type only ever gets populated by
 * projecting a subset of TuitionRequest fields, so a future edit here
 * cannot accidentally leak a private field by adding it to
 * TuitionRequest and forgetting to exclude it there.
 */
export interface TutorOpportunityView {
  id: string;
  tuitionUid: string;
  subjectId: string;
  gradeId: string;
  tutorVisibleLocality: string;
  localGovernmentId: string | null;
  availability: AvailabilitySlot[];
  notes: string | null;
}

// NOTE: deliberately excludes Firestore Timestamp fields (e.g. createdAt)
// — this view is passed from Server Components to Client Components
// (OpportunityBrowser), and the RSC serialization boundary rejects
// non-plain-object values like Timestamp class instances. Sorting by
// createdAt happens server-side, before this projection.
function toTutorView(r: TuitionRequest): TutorOpportunityView {
  return {
    id: r.id,
    tuitionUid: r.tuitionUid,
    subjectId: r.subjectId,
    gradeId: r.gradeId,
    tutorVisibleLocality: r.tutorVisibleLocality,
    localGovernmentId: r.localGovernmentId,
    availability: r.availability,
    notes: r.notes,
  };
}

export interface OpportunityFilters {
  subjectId?: string;
  gradeId?: string;
  localGovernmentId?: string;
  dayOfWeek?: string;
}

/**
 * Open opportunities, tutor-safe projection only, paginated. Preferred
 * location is a filter, never a hard wall (tuition-workflow skill: "A
 * tutor based in Devichowk can still browse Janakpur-wide
 * opportunities") — callers choose whether to pass `localGovernmentId`
 * at all.
 *
 * Indexing scope: `status==OPEN` alone, and `status==OPEN +
 * localGovernmentId==` (the one filter combination with its own
 * composite index — location is the primary/most common filter per the
 * product docs), are both fully server-side paginated with an accurate
 * total. `subjectId`/`gradeId`/`dayOfWeek` — and localGovernmentId
 * combined with either of them — are applied in-memory within the
 * fetched page rather than adding a composite index per combination
 * (avoids a combinatorial explosion of indexes); in that case the page
 * may return fewer than `pageSize` matches and "of Z" reflects the
 * broader (pre-refinement) total, not the exact filtered count. This is
 * a deliberate scope trade-off, not an oversight.
 */
export async function getOpenOpportunities(
  filters: OpportunityFilters,
  cursor: string | null,
): Promise<PageResult<TutorOpportunityView>> {
  let base = tuitionRequestsCollection().where("status", "==", "OPEN") as FirebaseFirestore.Query<TuitionRequest>;
  if (filters.localGovernmentId) {
    base = base.where("localGovernmentId", "==", filters.localGovernmentId);
  }

  const page = await fetchPage(base, "createdAt", cursor);
  let items = page.items;

  if (filters.subjectId) items = items.filter((r) => r.subjectId === filters.subjectId);
  if (filters.gradeId) items = items.filter((r) => r.gradeId === filters.gradeId);
  if (filters.dayOfWeek) {
    items = items.filter((r) => r.availability.some((s) => s.dayOfWeek === filters.dayOfWeek));
  }

  return { ...page, items: items.map(toTutorView) };
}

export async function getOpenOpportunityById(id: string): Promise<TutorOpportunityView | null> {
  const snap = await tuitionRequestsCollection().doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  if (data.status !== "OPEN") return null;
  return toTutorView(data);
}
