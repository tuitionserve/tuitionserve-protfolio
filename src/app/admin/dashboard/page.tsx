import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { branchesCollection } from "@/server/domain/collections";
import { countTutorReviewQueue } from "@/server/queries/tutor-review";
import {
  countOpenTuitionsQueue,
  countSelectionsReady,
  getTuitionRequestQueue,
} from "@/server/queries/tuition-requests";
import { catalogLabel, SUBJECTS } from "@/lib/catalog";
import { getNotifications } from "@/server/queries/my-notifications";

export default async function AdminDashboardPage() {
  // Re-runs the guard rather than trusting the layout ran first — see the
  // same note in tutor/dashboard/page.tsx.
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  // "Recent Tuition Requests" and the "New Requests" tile/attention-list
  // all derive from one bounded page fetch (first 20 NEW requests) — the
  // tile/attention counts use `.totalCount` (a cheap aggregation), the
  // list below just slices the same page. Everything else on this
  // dashboard is a count-only tile, so it uses `.count()` aggregations
  // rather than fetching full queues just to read `.length`
  // (performance-engineering skill).
  const [branchName, newRequestsPage, tutorReviewCount, openTuitionsCount, selectionsReadyCount, recentNotifications] =
    await Promise.all([
      session.branchId
        ? branchesCollection()
            .doc(session.branchId)
            .get()
            .then((snap) => snap.data()?.name ?? "Unknown branch")
        : Promise.resolve("All Branches"),
      getTuitionRequestQueue(session, null),
      countTutorReviewQueue(session),
      countOpenTuitionsQueue(session),
      countSelectionsReady(session),
      getNotifications(session.uid, null),
    ]);

  const attentionItems = tutorReviewCount + newRequestsPage.totalCount;

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{branchName}</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {session.role === "SUPER_ADMIN" ? "Platform-wide view" : "Branch operations"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        <QueueTile label="New Requests" value={newRequestsPage.totalCount} href="/admin/tuition-requests" />
        <QueueTile label="Tutor Reviews" value={tutorReviewCount} href="/admin/tutors" />
        <QueueTile label="Open Tuitions" value={openTuitionsCount} href="/admin/tuition-requests" />
        {/* "Ready for selection" = OPEN tuitions that already have >=1 applicant, i.e. an
            admin can act on them right now (see countSelectionsReady doc comment). */}
        <QueueTile label="Selections" value={selectionsReadyCount} href="/admin/tuition-requests" />
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Needs Attention</h2>
        {attentionItems === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">Nothing needs your attention right now.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {tutorReviewCount > 0 && (
              <li className="font-body-sm text-body-sm text-on-surface-variant">
                {tutorReviewCount} tutor application{tutorReviewCount === 1 ? "" : "s"} awaiting review —{" "}
                <Link href="/admin/tutors" className="text-primary-container font-medium">
                  review now
                </Link>
                .
              </li>
            )}
            {newRequestsPage.totalCount > 0 && (
              <li className="font-body-sm text-body-sm text-on-surface-variant">
                {newRequestsPage.totalCount} tuition request{newRequestsPage.totalCount === 1 ? "" : "s"} awaiting review —{" "}
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
        {newRequestsPage.items.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">No tuition requests yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {newRequestsPage.items.slice(0, 5).map(({ request, studentName }) => (
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

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Notifications</h2>
          {recentNotifications.totalCount > 0 && (
            <Link href="/admin/notifications" className="font-label-md text-label-md text-primary-container">
              View all
            </Link>
          )}
        </div>
        {recentNotifications.items.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">No notifications yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentNotifications.items.slice(0, 5).map((n) => (
              <Link
                key={n.id}
                href="/admin/notifications"
                className={`font-body-sm text-body-sm hover:text-primary-container transition-colors ${
                  n.read ? "text-on-surface-variant" : "text-on-surface font-medium"
                }`}
              >
                {n.title}
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
