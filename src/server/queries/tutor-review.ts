import { tutorProfilesCollection, tutorsCollection } from "@/server/domain/collections";
import type { AuthSession } from "@/server/auth/session";
import type { Tutor, TutorVerificationStatus } from "@/server/domain/types";
import { fetchPage, type PageResult } from "@/server/domain/pagination";
import { resolveBranchScope } from "@/server/domain/branch-scope";

/**
 * Every status that still needs eventual action from an admin — not
 * just the ones actionable right this moment (SUBMITTED/UNDER_REVIEW/
 * RESUBMITTED, which is the narrower set approveTutor/rejectTutor
 * actually gate on). REJECTED belongs here too so a tutor waiting on
 * the applicant to resubmit doesn't disappear from view entirely.
 */
const IN_PROGRESS_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED", "REJECTED"] as const;

export interface TutorReviewQueueRow {
  tutor: Tutor;
  fullName: string | null;
}

/** Branch-scoped, paginated queue of tutors still in the review pipeline — never leaks another branch's tutors to a Branch Admin. */
export async function getTutorReviewQueue(
  session: AuthSession,
  cursor: string | null,
  branchFilter: string | null = null,
): Promise<PageResult<TutorReviewQueueRow>> {
  const scope = resolveBranchScope(session, branchFilter);
  const base = scope
    ? tutorsCollection().where("branchId", "==", scope).where("verificationStatus", "in", IN_PROGRESS_STATUSES)
    : tutorsCollection().where("verificationStatus", "in", IN_PROGRESS_STATUSES);

  const page = await fetchPage(base, "submittedAt", cursor);

  const profiles = await Promise.all(page.items.map((t) => tutorProfilesCollection().doc(t.id).get()));

  return {
    ...page,
    items: page.items.map((tutor, i) => ({ tutor, fullName: profiles[i]?.data()?.fullName ?? null })),
  };
}

/**
 * Branch-scoped, paginated list of tutors — defaults to APPROVED only
 * (a "verified roster" view); pass `statusFilter` to look at any other
 * status instead. The review queue above covers everyone still in
 * progress; this page is for browsing who's actually active.
 */
export async function getAllTutors(
  session: AuthSession,
  cursor: string | null,
  branchFilter: string | null = null,
  statusFilter: TutorVerificationStatus | null = "APPROVED",
): Promise<PageResult<TutorReviewQueueRow>> {
  const scope = resolveBranchScope(session, branchFilter);
  let base = scope ? tutorsCollection().where("branchId", "==", scope) : tutorsCollection();
  if (statusFilter) base = base.where("verificationStatus", "==", statusFilter);

  const page = await fetchPage(base, "createdAt", cursor);
  const profiles = await Promise.all(page.items.map((t) => tutorProfilesCollection().doc(t.id).get()));

  return {
    ...page,
    items: page.items.map((tutor, i) => ({ tutor, fullName: profiles[i]?.data()?.fullName ?? null })),
  };
}

/** Cheap count-only version for dashboard tiles — never fetches full documents just to read `.length`. */
export async function countTutorReviewQueue(session: AuthSession): Promise<number> {
  const scope = resolveBranchScope(session, null);
  const base = scope
    ? tutorsCollection().where("branchId", "==", scope).where("verificationStatus", "in", IN_PROGRESS_STATUSES)
    : tutorsCollection().where("verificationStatus", "in", IN_PROGRESS_STATUSES);
  const snap = await base.count().get();
  return snap.data().count;
}
