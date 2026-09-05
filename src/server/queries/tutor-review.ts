import { tutorProfilesCollection, tutorsCollection } from "@/server/domain/collections";
import type { AuthSession } from "@/server/auth/session";
import type { Tutor } from "@/server/domain/types";
import { fetchPage, type PageResult } from "@/server/domain/pagination";

const REVIEWABLE_STATUSES = ["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED"] as const;

export interface TutorReviewQueueRow {
  tutor: Tutor;
  fullName: string | null;
}

/** Branch-scoped, paginated queue of tutors awaiting review — never leaks another branch's tutors to a Branch Admin. */
export async function getTutorReviewQueue(
  session: AuthSession,
  cursor: string | null,
): Promise<PageResult<TutorReviewQueueRow>> {
  const base =
    session.role === "BRANCH_ADMIN"
      ? tutorsCollection()
          .where("branchId", "==", session.branchId)
          .where("verificationStatus", "in", REVIEWABLE_STATUSES)
      : tutorsCollection().where("verificationStatus", "in", REVIEWABLE_STATUSES);

  const page = await fetchPage(base, "submittedAt", cursor);

  const profiles = await Promise.all(page.items.map((t) => tutorProfilesCollection().doc(t.id).get()));

  return {
    ...page,
    items: page.items.map((tutor, i) => ({ tutor, fullName: profiles[i]?.data()?.fullName ?? null })),
  };
}

/** Branch-scoped, paginated list of every tutor regardless of status — the review queue above only shows those awaiting a decision. */
export async function getAllTutors(
  session: AuthSession,
  cursor: string | null,
): Promise<PageResult<TutorReviewQueueRow>> {
  const base =
    session.role === "BRANCH_ADMIN"
      ? tutorsCollection().where("branchId", "==", session.branchId)
      : tutorsCollection();

  const page = await fetchPage(base, "createdAt", cursor);
  const profiles = await Promise.all(page.items.map((t) => tutorProfilesCollection().doc(t.id).get()));

  return {
    ...page,
    items: page.items.map((tutor, i) => ({ tutor, fullName: profiles[i]?.data()?.fullName ?? null })),
  };
}

/** Cheap count-only version for dashboard tiles — never fetches full documents just to read `.length`. */
export async function countTutorReviewQueue(session: AuthSession): Promise<number> {
  const base =
    session.role === "BRANCH_ADMIN"
      ? tutorsCollection()
          .where("branchId", "==", session.branchId)
          .where("verificationStatus", "in", REVIEWABLE_STATUSES)
      : tutorsCollection().where("verificationStatus", "in", REVIEWABLE_STATUSES);
  const snap = await base.count().get();
  return snap.data().count;
}
