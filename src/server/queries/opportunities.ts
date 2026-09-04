import { tuitionRequestsCollection } from "@/server/domain/collections";
import type { AvailabilitySlot, TuitionRequest } from "@/server/domain/types";

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
 * Open opportunities, tutor-safe projection only. Preferred location is
 * a filter, never a hard wall (tuition-workflow skill: "A tutor based
 * in Devichowk can still browse Janakpur-wide opportunities") — callers
 * choose whether to pass `localGovernmentId` at all.
 */
export async function getOpenOpportunities(filters: OpportunityFilters): Promise<TutorOpportunityView[]> {
  let query = tuitionRequestsCollection().where("status", "==", "OPEN") as FirebaseFirestore.Query<TuitionRequest>;
  if (filters.subjectId) query = query.where("subjectId", "==", filters.subjectId);
  if (filters.gradeId) query = query.where("gradeId", "==", filters.gradeId);
  if (filters.localGovernmentId) query = query.where("localGovernmentId", "==", filters.localGovernmentId);

  const snap = await query.get();
  let results = snap.docs.map((d) => d.data());

  // Day-of-week filtering happens in memory: AvailabilitySlot is an
  // array of objects, which Firestore cannot query "does any element
  // have dayOfWeek == X" over without a denormalized field we don't
  // have yet — fine at this data volume (performance-engineering skill:
  // don't add infrastructure without a demonstrated need).
  if (filters.dayOfWeek) {
    results = results.filter((r) => r.availability.some((s) => s.dayOfWeek === filters.dayOfWeek));
  }

  return results
    .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))
    .map(toTutorView);
}

export async function getOpenOpportunityById(id: string): Promise<TutorOpportunityView | null> {
  const snap = await tuitionRequestsCollection().doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  if (data.status !== "OPEN") return null;
  return toTutorView(data);
}
