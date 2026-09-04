import { tutorProfilesCollection, tutorsCollection } from "@/server/domain/collections";
import type { AuthSession } from "@/server/auth/session";
import type { Tutor, TutorVerificationStatus } from "@/server/domain/types";

const REVIEWABLE_STATUSES: TutorVerificationStatus[] = ["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED"];

export interface TutorReviewQueueRow {
  tutor: Tutor;
  fullName: string | null;
}

/** Branch-scoped queue of tutors awaiting review — never leaks another branch's tutors to a Branch Admin. */
export async function getTutorReviewQueue(session: AuthSession): Promise<TutorReviewQueueRow[]> {
  // Branch Admin: filter by branchId (single-field equality, no composite
  // index needed) and narrow to reviewable statuses in memory. Super
  // Admin: filter by status via a single `in` clause on one field, which
  // also needs no composite index. Avoiding combining `in` + `==` +
  // `orderBy` in one query sidesteps needing a Firestore composite index
  // we haven't provisioned (performance-engineering skill: don't add
  // indexes blindly) — this queue is small enough that in-memory
  // filter/sort is the simpler, equally correct choice.
  const snap =
    session.role === "BRANCH_ADMIN"
      ? await tutorsCollection().where("branchId", "==", session.branchId).get()
      : await tutorsCollection().where("verificationStatus", "in", REVIEWABLE_STATUSES).get();

  const tutors = snap.docs
    .map((d) => d.data())
    .filter((t) => REVIEWABLE_STATUSES.includes(t.verificationStatus))
    .sort((a, b) => (b.submittedAt?.toMillis() ?? 0) - (a.submittedAt?.toMillis() ?? 0));

  const profiles = await Promise.all(
    tutors.map((t) => tutorProfilesCollection().doc(t.id).get()),
  );

  return tutors.map((tutor, i) => ({ tutor, fullName: profiles[i]?.data()?.fullName ?? null }));
}
