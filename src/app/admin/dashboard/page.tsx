import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { branchesCollection } from "@/server/domain/collections";
import { getTutorReviewQueue } from "@/server/queries/tutor-review";
import { getOpenTuitionsQueue, getSelectionsReadyQueue, getTuitionRequestQueue } from "@/server/queries/tuition-requests";
import { catalogLabel, SUBJECTS } from "@/lib/catalog";

export default async function AdminDashboardPage() {
  // Re-runs the guard rather than trusting the layout ran first — see the
  // same note in tutor/dashboard/page.tsx.
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const [branchName, tutorReviewQueue, tuitionRequestQueue, openTuitionsQueue, selectionsReadyQueue] =
    await Promise.all([
      session.branchId
        ? branchesCollection()
            .doc(session.branchId)
            .get()
            .then((snap) => snap.data()?.name ?? "Unknown branch")
        : Promise.resolve("All Branches"),
      getTutorReviewQueue(session),
      getTuitionRequestQueue(session),
      getOpenTuitionsQueue(session),
      getSelectionsReadyQueue(session),
    ]);

  const attentionItems = tutorReviewQueue.length + tuitionRequestQueue.length;

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{branchName}</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {session.role === "SUPER_ADMIN" ? "Platform-wide view" : "Branch operations"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        <QueueTile label="New Requests" value={tuitionRequestQueue.length} href="/admin/tuition-requests" />
        <QueueTile label="Tutor Reviews" value={tutorReviewQueue.length} href="/admin/tutors" />
        <QueueTile label="Open Tuitions" value={openTuitionsQueue.length} href="/admin/tuition-requests" />
        {/* "Ready for selection" = OPEN tuitions that already have >=1 applicant, i.e. an
            admin can act on them right now (see getSelectionsReadyQueue doc comment). */}
        <QueueTile label="Selections" value={selectionsReadyQueue.length} href="/admin/tuition-requests" />
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Needs Attention</h2>
        {attentionItems === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">Nothing needs your attention right now.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tutorReviewQueue.length > 0 && (
              <li className="font-body-sm text-body-sm text-on-surface-variant">
                {tutorReviewQueue.length} tutor application{tutorReviewQueue.length === 1 ? "" : "s"} awaiting review —{" "}
                <Link href="/admin/tutors" className="text-primary-container font-medium">
                  review now
                </Link>
                .
              </li>
            )}
            {tuitionRequestQueue.length > 0 && (
              <li className="font-body-sm text-body-sm text-on-surface-variant">
                {tuitionRequestQueue.length} tuition request{tuitionRequestQueue.length === 1 ? "" : "s"} awaiting review —{" "}
                <Link href="/admin/tuition-requests" className="text-primary-container font-medium">
                  review now
                </Link>
                .
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Recent Tuition Requests</h2>
        {tuitionRequestQueue.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">No tuition requests yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {tuitionRequestQueue.slice(0, 5).map(({ request, studentName }) => (
              <Link
                key={request.id}
                href={`/admin/tuition-requests/${request.id}`}
                className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary-container transition-colors"
              >
                {studentName ?? "Unnamed student"} — {catalogLabel(SUBJECTS, request.subjectId)} ({request.tuitionUid})
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QueueTile({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg text-center h-full">
      <p className="font-display-lg text-headline-lg text-on-surface">{value}</p>
      <p className="font-label-md text-label-md text-on-surface-variant mt-1">{label}</p>
    </div>
  );
  return href ? (
    <Link href={href} className="hover:shadow-md transition-all rounded-xl block">
      {content}
    </Link>
  ) : (
    content
  );
}
