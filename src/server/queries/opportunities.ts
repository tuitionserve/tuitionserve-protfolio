import { isTutorInBranchScope } from "@/server/auth/guards";
import {
  branchesCollection,
  fetchDocsByIds,
  parentsCollection,
  studentsCollection,
  tuitionRequestsCollection,
  tutorApplicationsCollection,
} from "@/server/domain/collections";
import type {
  AvailabilitySlot,
  TuitionPostingType,
  TuitionRequest,
  TuitionRequestStatus,
  TutorGenderPreference,
} from "@/server/domain/types";
import { DEFAULT_PAGE_SIZE, fetchPage, type PageResult } from "@/server/domain/pagination";

export interface TutorOpportunityStudentView {
  id: string;
  fullName: string;
  gradeId: string;
  schoolName: string | null;
  currentProgram: string | null;
  currentYearOrSemester: string | null;
}

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
  subjectIds: string[];
  gradeId: string;
  gradeIds?: string[];
  tutorVisibleLocality: string;
  tutorGenderPreference: TutorGenderPreference;
  branchCity: string | null;
  localGovernmentId: string | null;
  availability: AvailabilitySlot[];
  notes: string | null;
  // Populated on the detail view (both OPEN and ASSIGNED) via a Student
  // join — not on the list view, to avoid an N+1 join per row there.
  currentProgram: string | null;
  currentYearOrSemester: string | null;
  // Populated only once this tutor is the assigned tutor (status ASSIGNED).
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  studentName: string | null;
  schoolName: string | null;
  students?: TutorOpportunityStudentView[];
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
    subjectIds: r.subjectIds,
    gradeId: r.gradeId,
    gradeIds: r.gradeIds,
    tutorVisibleLocality: r.tutorVisibleLocality,
    tutorGenderPreference: r.tutorGenderPreference,
    branchCity: null,
    localGovernmentId: r.localGovernmentId,
    availability: r.availability,
    notes: r.notes,
    currentProgram: null,
    currentYearOrSemester: null,
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
  const branchMap = await fetchDocsByIds(
    branchesCollection(),
    requests.map((r) => r.branchId),
  );
  return views.map((v, i) => ({
    ...v,
    branchCity: requests[i]!.branchId ? (branchMap.get(requests[i]!.branchId!)?.city ?? null) : null,
  }));
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
function matchesOpportunityFilters(r: TuitionRequest, filters: OpportunityFilters): boolean {
  if (filters.subjectId) {
    if (!r.subjectIds.includes(filters.subjectId) && !r.subjectIds.includes("all-subjects")) {
      return false;
    }
  }
  if (filters.gradeId) {
    if (r.gradeId !== filters.gradeId && !(r.gradeIds && r.gradeIds.includes(filters.gradeId))) {
      return false;
    }
  }
  if (filters.dayOfWeek) {
    if (!r.availability.some((s) => s.dayOfWeek === filters.dayOfWeek)) {
      return false;
    }
  }
  return true;
}

const MAX_FILTER_SCAN_PAGES = 5;

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

  const hasAttributeFilters = Boolean(filters.subjectId || filters.gradeId || filters.dayOfWeek);
  if (!hasAttributeFilters) {
    const page = await fetchPage(base, "createdAt", cursor);
    const items = await attachBranchCities(page.items, page.items.map(toTutorView));
    return { ...page, items };
  }

  // Scan bounded batches until we collect a page of matching items or exhaust the collection,
  // avoiding empty page 1s when matching tuitions sit further down the unfiltered list.
  const matched: TuitionRequest[] = [];
  let currentCursorToken = cursor;
  let lastMatchedCursor: string | null = null;
  let hasMore = false;
  let lastPageTotal = 0;

  for (let scan = 0; scan < MAX_FILTER_SCAN_PAGES; scan++) {
    const page = await fetchPage(base, "createdAt", currentCursorToken, DEFAULT_PAGE_SIZE);
    lastPageTotal = page.totalCount;

    for (let i = 0; i < page.items.length; i++) {
      const req = page.items[i]!;
      if (!matchesOpportunityFilters(req, filters)) continue;

      matched.push(req);
      if (req.createdAt) {
        lastMatchedCursor = `${req.createdAt.toMillis()}_${req.id}`;
      }
      if (matched.length === DEFAULT_PAGE_SIZE) {
        // Exact cursor of the 20th matched item so the next page never skips
        // matching items that sat later in this same raw batch.
        hasMore = i < page.items.length - 1 || page.hasNextPage;
        break;
      }
    }

    if (matched.length >= DEFAULT_PAGE_SIZE) {
      break;
    }

    currentCursorToken = page.nextCursor;
    if (!page.hasNextPage || !page.nextCursor) {
      hasMore = false;
      break;
    }

    if (scan === MAX_FILTER_SCAN_PAGES - 1) {
      // Hit scan cap before filling a full page — resume from the end of the last scanned batch.
      lastMatchedCursor = page.nextCursor;
      hasMore = true;
    }
  }

  const items = await attachBranchCities(matched, matched.map(toTutorView));
  return {
    items,
    totalCount: !hasMore && cursor === null ? items.length : lastPageTotal,
    hasNextPage: hasMore,
    nextCursor: hasMore ? lastMatchedCursor : null,
    totalIsApproximate: hasMore || cursor !== null,
  };
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
export async function getOpportunityForTutor(
  id: string,
  tutorId: string,
  tutorBranchId: string | null = null,
): Promise<TutorOpportunityView | null> {
  const snap = await tuitionRequestsCollection().doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data()!;

  // "Currently studying" is non-sensitive (like grade/subject) — shown
  // on the detail view regardless of application status, unlike the
  // parent/exact-address block below which is assignment-gated.
  const studentIds: string[] =
    Array.isArray(data.studentIds) && data.studentIds.length > 0
      ? data.studentIds
      : (data as unknown as { studentId?: string | null }).studentId
        ? [(data as unknown as { studentId: string }).studentId]
        : [];

  const studentSnaps =
    studentIds.length > 0
      ? await Promise.all(studentIds.map((sid) => studentsCollection().doc(sid).get()))
      : [];
  const studentsList = studentSnaps
    .map((s) => s.data())
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const firstStudent = studentsList[0];
  const currentStudyingPatch = {
    currentProgram: firstStudent?.currentProgram ?? null,
    currentYearOrSemester: firstStudent?.currentYearOrSemester ?? null,
  };

  if (data.status === "OPEN") {
    if (!isTutorInBranchScope(tutorBranchId, data.branchId)) {
      return null;
    }
    const [view] = await attachBranchCities([data], [toTutorView(data)]);
    return { ...view!, ...currentStudyingPatch };
  }

  const applicationSnap = await tutorApplicationsCollection()
    .where("tuitionId", "==", id)
    .where("tutorId", "==", tutorId)
    .get();
  if (applicationSnap.empty) return null;

  const [view] = await attachBranchCities([data], [toTutorView(data)]);
  // A tuition reopened after withdrawal can yield multiple applications from
  // the same tutor across rounds — prefer an active SELECTED application.
  const applications = applicationSnap.docs.map((d) => d.data());
  const application =
    applications.find((a) => a.status === "SELECTED") ??
    applications.find((a) => a.status === "APPLIED") ??
    applications[0]!;

  if (data.status === "ASSIGNED" && application.status === "SELECTED") {
    const parentSnap = await parentsCollection().doc(data.parentId).get();
    const parent = parentSnap.data();
    return {
      ...view!,
      ...currentStudyingPatch,
      parentName: parent?.fullName ?? null,
      parentPhone: parent?.phone ?? null,
      parentEmail: parent?.email ?? null,
      studentName: studentsList.map((s) => s.fullName).join(", ") || null,
      schoolName: studentsList.map((s) => s.schoolName).filter(Boolean).join(", ") || null,
      students: studentsList.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        gradeId: s.gradeId,
        schoolName: s.schoolName,
        currentProgram: s.currentProgram,
        currentYearOrSemester: s.currentYearOrSemester,
      })),
      exactAddress: data.exactAddress,
    };
  }

  return { ...view!, ...currentStudyingPatch };
}
