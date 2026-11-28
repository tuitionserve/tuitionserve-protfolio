import {
  branchesCollection,
  tuitionRequestsCollection,
} from "@/server/domain/collections";
import { fetchDocsByIds } from "@/server/domain/collections";
import { buildTuitionSlug } from "@/server/domain/slug";
import { DEFAULT_PAGE_SIZE, fetchPage, type PageResult } from "@/server/domain/pagination";
import type {
  AvailabilitySlot,
  TuitionPostingType,
  TuitionRequest,
  TutorGenderPreference,
} from "@/server/domain/types";

export interface PublicVacancyView {
  id: string;
  tuitionUid: string;
  slug: string;
  status: TuitionRequest["status"];
  postingType: TuitionPostingType;
  institutionName: string | null;
  subjectIds: string[];
  gradeId: string;
  gradeIds?: string[];
  tutorVisibleLocality: string;
  tutorGenderPreference: TutorGenderPreference;
  branchId: string | null;
  branchCity: string | null;
  availability: AvailabilitySlot[];
  notes: string | null;
  createdAtIso: string | null;
  updatedAtIso: string | null;
}

export interface PublicVacancyFilters {
  subjectId?: string;
  gradeId?: string;
  postingType?: TuitionPostingType;
  dayOfWeek?: string;
  branchId?: string;
}

function effectiveSlug(r: TuitionRequest): string {
  return (
    r.slug ||
    buildTuitionSlug({
      postingType: r.postingType,
      gradeId: r.gradeId,
      gradeIds: r.gradeIds,
      subjectIds: r.subjectIds,
      institutionName: r.institutionName,
      tutorVisibleLocality: r.tutorVisibleLocality,
      tuitionUid: r.tuitionUid,
    })
  );
}

/**
 * Strictly public-safe projection: never includes parentId, parent contacts,
 * studentIds/student names, schoolName, or exactAddress.
 */
function toPublicView(r: TuitionRequest, branchCity: string | null): PublicVacancyView {
  return {
    id: r.id,
    tuitionUid: r.tuitionUid,
    slug: effectiveSlug(r),
    status: r.status,
    postingType: r.postingType,
    institutionName: r.postingType === "SCHOOL" ? r.institutionName : null,
    subjectIds: r.subjectIds,
    gradeId: r.gradeId,
    gradeIds: r.gradeIds,
    tutorVisibleLocality: r.tutorVisibleLocality,
    tutorGenderPreference: r.tutorGenderPreference,
    branchId: r.branchId,
    branchCity,
    availability: r.availability,
    notes: r.notes,
    createdAtIso: r.createdAt ? r.createdAt.toDate().toISOString() : null,
    updatedAtIso: r.updatedAt ? r.updatedAt.toDate().toISOString() : null,
  };
}

function matchesPublicFilters(r: TuitionRequest, filters: PublicVacancyFilters): boolean {
  if (filters.postingType && r.postingType !== filters.postingType) return false;
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
  if (filters.dayOfWeek && !r.availability.some((s) => s.dayOfWeek === filters.dayOfWeek)) {
    return false;
  }
  return true;
}

const MAX_FILTER_SCAN_PAGES = 5;

export async function getPublicOpenVacancies(
  filters: PublicVacancyFilters,
  cursor: string | null,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<PageResult<PublicVacancyView>> {
  let base = tuitionRequestsCollection().where("status", "==", "OPEN") as FirebaseFirestore.Query<TuitionRequest>;
  if (filters.branchId) {
    base = base.where("branchId", "==", filters.branchId);
  }

  const hasAttributeFilters = Boolean(
    filters.postingType || filters.subjectId || filters.gradeId || filters.dayOfWeek,
  );

  let rawRequests: TuitionRequest[] = [];
  let totalCount = 0;
  let hasNextPage = false;
  let nextCursor: string | null = null;
  let totalIsApproximate = false;

  if (!hasAttributeFilters) {
    const page = await fetchPage(base, "createdAt", cursor, pageSize);
    rawRequests = page.items;
    totalCount = page.totalCount;
    hasNextPage = page.hasNextPage;
    nextCursor = page.nextCursor;
    totalIsApproximate = Boolean(page.totalIsApproximate);
  } else {
    const matched: TuitionRequest[] = [];
    let currentToken = cursor;
    let lastMatchedCursor: string | null = null;
    let lastPageTotal = 0;

    for (let scan = 0; scan < MAX_FILTER_SCAN_PAGES; scan++) {
      const page = await fetchPage(base, "createdAt", currentToken, pageSize);
      lastPageTotal = page.totalCount;

      for (let i = 0; i < page.items.length; i++) {
        const req = page.items[i]!;
        if (!matchesPublicFilters(req, filters)) continue;

        matched.push(req);
        if (req.createdAt) {
          lastMatchedCursor = `${req.createdAt.toMillis()}_${req.id}`;
        }
        if (matched.length === pageSize) {
          hasNextPage = i < page.items.length - 1 || page.hasNextPage;
          break;
        }
      }

      if (matched.length >= pageSize) break;

      currentToken = page.nextCursor;
      if (!page.hasNextPage || !page.nextCursor) {
        hasNextPage = false;
        break;
      }
      if (scan === MAX_FILTER_SCAN_PAGES - 1) {
        lastMatchedCursor = page.nextCursor;
        hasNextPage = true;
      }
    }

    rawRequests = matched;
    totalCount = !hasNextPage && cursor === null ? matched.length : lastPageTotal;
    nextCursor = hasNextPage ? lastMatchedCursor : null;
    totalIsApproximate = hasNextPage || cursor !== null;
  }

  const branchMap = await fetchDocsByIds(
    branchesCollection(),
    rawRequests.map((r) => r.branchId),
  );

  const items = rawRequests.map((r) =>
    toPublicView(r, r.branchId ? (branchMap.get(r.branchId)?.city ?? null) : null),
  );

  return {
    items,
    totalCount,
    hasNextPage,
    nextCursor,
    totalIsApproximate,
  };
}

/**
 * Resolves a vacancy publicly by its SEO slug, or by document ID / tuitionUid
 * fallback (in case an older link omitted a persisted slug).
 * Unverified (`NEW`) and `REJECTED` requests are strictly hidden (`null`).
 */
export async function getPublicVacancyBySlugOrId(slugOrId: string): Promise<PublicVacancyView | null> {
  const bySlugSnap = await tuitionRequestsCollection().where("slug", "==", slugOrId).limit(1).get();
  let request: TuitionRequest | null = bySlugSnap.empty ? null : (bySlugSnap.docs[0]!.data() ?? null);

  if (!request) {
    const byDoc = await tuitionRequestsCollection().doc(slugOrId).get();
    if (byDoc.exists) {
      request = byDoc.data() ?? null;
    }
  }

  if (!request) {
    // Fallback: slugs always end with "-ts-req-000123" — try matching by trailing UID if missing persisted slug.
    const uidMatch = slugOrId.match(/(ts-req-[a-z0-9-]+)$/i);
    if (uidMatch) {
      const upperUid = uidMatch[1]!.toUpperCase();
      const byUidSnap = await tuitionRequestsCollection().where("tuitionUid", "==", upperUid).limit(1).get();
      if (!byUidSnap.empty) {
        request = byUidSnap.docs[0]!.data() ?? null;
      }
    }
  }

  if (!request) return null;
  // Never reveal unconfirmed NEW requests or REJECTED requests on the public board.
  if (request.status === "NEW" || request.status === "REJECTED") return null;

  let branchCity: string | null = null;
  if (request.branchId) {
    const branchSnap = await branchesCollection().doc(request.branchId).get();
    branchCity = branchSnap.data()?.city ?? null;
  }

  return toPublicView(request, branchCity);
}

export async function getPublicVacancyBranches(): Promise<{ id: string; name: string; city: string }[]> {
  const snap = await branchesCollection().orderBy("name", "asc").get();
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: data.id, name: data.name, city: data.city };
  });
}
