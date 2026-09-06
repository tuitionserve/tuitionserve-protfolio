import {
  branchesCollection,
  parentsCollection,
  studentsCollection,
  tuitionRequestsCollection,
  tutorApplicationsCollection,
} from "@/server/domain/collections";
import type { AvailabilitySlot, TuitionPostingType, TuitionRequest, TuitionRequestStatus } from "@/server/domain/types";
import { fetchPage, type PageResult } from "@/server/domain/pagination";

/**
 * Tutor-safe view of an open tuition opportunity (PRD section 15 /
 * location-privacy skill). The parent/student/exactAddress fields stay
 * null for everyone except the tutor actually ASSIGNED to this specific
 * tuition (see getOpportunityForTutor) — once assigned, a tutor needs
 * the same contact details an admin has to actually go teach there.
 */
export interface TutorOpportunityView {
  id: string;
  tuitionUid: string;
  status: TuitionRequestStatus;
  postingType: TuitionPostingType;
  institutionName: string | null; // SCHOOL postings only — the school's name, always tutor-visible (unlike parent/student below)
  subjectId: string;
  gradeId: string;
  tutorVisibleLocality: string;
  branchCity: string | null;
  localGovernmentId: string | null;
  availability: AvailabilitySlot[];
  notes: string | null;
  // Populated only once this tutor is the assigned tutor (status ASSIGNED).
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  studentName: string | null;
  schoolName: string | null;
  exactAddress: string | null;
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
    status: r.status,
    postingType: r.postingType,
    institutionName: r.institutionName,
    subjectId: r.subjectId,
    gradeId: r.gradeId,
    tutorVisibleLocality: r.tutorVisibleLocality,
    branchCity: null,
    localGovernmentId: r.localGovernmentId,
    availability: r.availability,
    notes: r.notes,
    parentName: null,
    parentPhone: null,
    parentEmail: null,
    studentName: null,
    schoolName: null,
    exactAddress: null,
  };
}

async function attachBranchCities(
  requests: TuitionRequest[],
  views: TutorOpportunityView[],
): Promise<TutorOpportunityView[]> {
  const branchIds = [...new Set(requests.map((r) => r.branchId).filter((id): id is string => Boolean(id)))];
  const branchSnaps = await Promise.all(branchIds.map((id) => branchesCollection().doc(id).get()));
  const cityByBranchId = new Map(branchSnaps.map((s) => [s.id, s.exists ? s.data()!.city : null]));
  return views.map((v, i) => ({ ...v, branchCity: requests[i]!.branchId ? cityByBranchId.get(requests[i]!.branchId!) ?? null : null }));
}

export interface OpportunityFilters {
  subjectId?: string;
  gradeId?: string;
  localGovernmentId?: string;
  dayOfWeek?: string;
}

/**
 * Open opportunities, tutor-safe projection only, paginated, hard-scoped
 * to the calling tutor's own branch (their city) — a tutor never sees
 * another branch's opportunities. `localGovernmentId` narrows further
 * *within* that branch; it is not a way to reach other cities.
 *
 * An unrouted tutor (branchId null — their preferred location didn't
 * resolve to any branch) sees everything, same as before this branch
 * scoping was added: restricting them to "branchId == null" would only
 * show other unrouted requests, which is not the useful fallback.
 *
 * Indexing scope: `branchId==X + status==OPEN` uses its own composite
 * index (the common case now that this is the default scope).
 * `localGovernmentId`/`subjectId`/`gradeId`/`dayOfWeek` are applied
 * in-memory within the fetched page rather than adding a composite
 * index per combination — see the historical version of this doc
 * comment in git blame for the original reasoning, unchanged here.
 */
export async function getOpenOpportunities(
  tutorBranchId: string | null,
  filters: OpportunityFilters,
  cursor: string | null,
): Promise<PageResult<TutorOpportunityView>> {
  let base = tuitionRequestsCollection().where("status", "==", "OPEN") as FirebaseFirestore.Query<TuitionRequest>;
  if (tutorBranchId) {
    base = base.where("branchId", "==", tutorBranchId);
  }
  if (filters.localGovernmentId) {
    base = base.where("localGovernmentId", "==", filters.localGovernmentId);
  }

  const page = await fetchPage(base, "createdAt", cursor);
  let requests = page.items;

  if (filters.subjectId) requests = requests.filter((r) => r.subjectId === filters.subjectId);
  if (filters.gradeId) requests = requests.filter((r) => r.gradeId === filters.gradeId);
  if (filters.dayOfWeek) {
    requests = requests.filter((r) => r.availability.some((s) => s.dayOfWeek === filters.dayOfWeek));
  }

  const items = await attachBranchCities(requests, requests.map(toTutorView));
  return { ...page, items };
}

/**
 * A tutor may view a tuition's detail page either while it's still OPEN
 * (browsing to apply) or afterward if they actually applied to it (so
 * "My Applications" rows can link back here even once the tuition has
 * moved to ASSIGNED/etc.) — never for an arbitrary tuition they have no
 * relationship to. Once ASSIGNED, the tutor holding the SELECTED
 * application for it sees the same parent/student/address detail an
 * admin sees — they need it to actually go teach there. This is
 * self-cleaning: if the tuition is later reopened for reassignment, its
 * status is no longer ASSIGNED, so this detail stops being attached.
 */
export async function getOpportunityForTutor(id: string, tutorId: string): Promise<TutorOpportunityView | null> {
  const snap = await tuitionRequestsCollection().doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data()!;
  if (data.status === "OPEN") {
    const [view] = await attachBranchCities([data], [toTutorView(data)]);
    return view!;
  }

  const applicationSnap = await tutorApplicationsCollection()
    .where("tuitionId", "==", id)
    .where("tutorId", "==", tutorId)
    .limit(1)
    .get();
  if (applicationSnap.empty) return null;

  const [view] = await attachBranchCities([data], [toTutorView(data)]);
  const application = applicationSnap.docs[0]!.data();

  if (data.status === "ASSIGNED" && application.status === "SELECTED") {
    const [parentSnap, studentSnap] = await Promise.all([
      parentsCollection().doc(data.parentId).get(),
      data.studentId ? studentsCollection().doc(data.studentId).get() : Promise.resolve(null),
    ]);
    const parent = parentSnap.data();
    const student = studentSnap?.data();
    return {
      ...view!,
      parentName: parent?.fullName ?? null,
      parentPhone: parent?.phone ?? null,
      parentEmail: parent?.email ?? null,
      studentName: student?.fullName ?? null,
      schoolName: student?.schoolName ?? null,
      exactAddress: data.exactAddress,
    };
  }

  return view!;
}
