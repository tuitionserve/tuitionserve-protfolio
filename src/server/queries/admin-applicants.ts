import { FieldValue } from "firebase-admin/firestore";
import { tuitionRequestsCollection, tutorApplicationsCollection } from "@/server/domain/collections";
import { fetchPage, type PageResult } from "@/server/domain/pagination";
import type { AuthSession } from "@/server/auth/session";
import type { TutorApplication, TutorApplicationSnapshot, TutorApplicationStatus } from "@/server/domain/types";
import { resolveBranchScope } from "@/server/domain/branch-scope";


/**
 * Client-safe applicant view — excludes Firestore Timestamp fields
 * (appliedAt, snapshot.capturedAt, etc.). This gets passed from a
 * Server Component to a Client Component (ApplicantsList); the RSC
 * serialization boundary rejects Timestamp class instances, so strip
 * them here rather than at each call site.
 */
export interface AdminApplicantView {
  id: string;
  applicationUid: string;
  status: TutorApplicationStatus;
  snapshot: Omit<TutorApplicationSnapshot, "capturedAt">;
  /** True the first time this application appears in an admin's list — like an unread email, it flips to false as soon as this page has been viewed once. */
  isNew: boolean;
}

function toAdminView(a: TutorApplication): AdminApplicantView {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- discarding the Timestamp field via destructuring
  const { capturedAt, ...snapshotWithoutTimestamp } = a.snapshot;
  return {
    id: a.id,
    applicationUid: a.applicationUid,
    status: a.status,
    snapshot: snapshotWithoutTimestamp,
    isNew: a.viewedByAdminAt === null,
  };
}

/**
 * Admin-side applicant list for one tuition, paginated — caller must
 * already have verified branch scope on the tuition. Marks whichever
 * applications land on this page as viewed (so they render bold/new
 * once here, then dim on the next visit), the same "flip after this
 * render" pattern as a mail client rather than an explicit mark-read
 * click, since applicants aren't individually click-through pages.
 */
export async function getApplicantsForTuition(
  tuitionId: string,
  cursor: string | null,
): Promise<PageResult<AdminApplicantView>> {
  const base = tutorApplicationsCollection().where("tuitionId", "==", tuitionId);
  const page = await fetchPage(base, "appliedAt", cursor);
  const items = page.items.map(toAdminView);

  const unviewedIds = page.items.filter((a) => a.viewedByAdminAt === null).map((a) => a.id);
  if (unviewedIds.length > 0) {
    const batch = tutorApplicationsCollection().firestore.batch();
    const now = FieldValue.serverTimestamp();
    for (const id of unviewedIds) {
      batch.update(tutorApplicationsCollection().doc(id), { viewedByAdminAt: now });
    }
    await batch.commit();
  }

  return { ...page, items };
}

/** Overview row for the branch-wide "All Applications" list — carries which tuition, unlike the per-tuition view above. */
export interface AllApplicationsRow {
  application: AdminApplicantView;
  tuitionUid: string;
  tuitionId: string;
}

/**
 * Every application across the branch (or platform, for Super Admin),
 * newest first — the per-tuition applicant list above is where an
 * admin actually acts on one; this is the bird's-eye view of
 * application activity. Uses TutorApplication.branchId, denormalized
 * from the tuition at apply-time specifically so this query doesn't
 * need to fan out per-tuition.
 */
export async function getAllApplications(
  session: AuthSession,
  cursor: string | null,
  branchFilter: string | null = null,
): Promise<PageResult<AllApplicationsRow>> {
  const scope = resolveBranchScope(session, branchFilter);
  const base = scope
    ? tutorApplicationsCollection().where("branchId", "==", scope)
    : tutorApplicationsCollection();
  const page = await fetchPage(base, "appliedAt", cursor);

  const tuitionSnaps = await Promise.all(page.items.map((a) => tuitionRequestsCollection().doc(a.tuitionId).get()));
  const items = page.items.map((a, i) => ({
    application: toAdminView(a),
    tuitionUid: tuitionSnaps[i]?.data()?.tuitionUid ?? "—",
    tuitionId: a.tuitionId,
  }));

  return { ...page, items };
}
