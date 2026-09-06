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
import { StatCard } from "@/components/shared/StatCard";
import { NotificationsCard } from "@/components/shared/NotificationsCard";
import { QuickActionsCard, type QuickAction } from "@/components/shared/QuickActionsCard";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

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
  const isSuperAdmin = session.role === "SUPER_ADMIN";

  const quickActions: QuickAction[] = [
    { label: "Post Tuition", href: "/admin/tuition-requests/post", icon: "add_circle" },
    { label: "Post School Enquiry", href: "/admin/school-contact-queries/post", icon: "add_business" },
    { label: "Tutor Reviews", href: "/admin/tutors", icon: "fact_check" },
    ...(isSuperAdmin ? [{ label: "Branches", href: "/admin/branches", icon: "store" }] : []),
  ];

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary-container/15 flex items-center justify-center shrink-0">
          <MaterialIcon name="dashboard" filled className="text-3xl text-primary-container" />
        </div>
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{branchName}</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {isSuperAdmin ? "Platform-wide view" : "Branch operations"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        <StatCard
          label="New Requests"
          value={newRequestsPage.totalCount}
          icon="post_add"
          tone="tertiary"
          href="/admin/tuition-requests"
        />
        <StatCard label="Tutor Reviews" value={tutorReviewCount} icon="fact_check" tone="secondary" href="/admin/tutors" />
        <StatCard label="Open Tuitions" value={openTuitionsCount} icon="menu_book" tone="primary" href="/admin/tuition-requests" />
        {/* "Ready for selection" = OPEN tuitions that already have >=1 applicant, i.e. an
            admin can act on them right now (see countSelectionsReady doc comment). */}
        <StatCard label="Selections" value={selectionsReadyCount} icon="task_alt" tone="error" href="/admin/tuition-requests" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg items-start">
        <div className="lg:col-span-2 flex flex-col gap-lg">
          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Needs Attention</h2>
            {attentionItems === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">Nothing needs your attention right now.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {tutorReviewCount > 0 && (
                  <li className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface-variant">
                    <MaterialIcon name="fact_check" className="text-tertiary shrink-0" />
                    {tutorReviewCount} tutor application{tutorReviewCount === 1 ? "" : "s"} awaiting review —{" "}
                    <Link href="/admin/tutors" className="text-primary-container font-medium">
                      review now
                    </Link>
                  </li>
                )}
                {newRequestsPage.totalCount > 0 && (
                  <li className="flex items-center gap-3 font-body-sm text-body-sm text-on-surface-variant">
                    <MaterialIcon name="post_add" className="text-tertiary shrink-0" />
                    {newRequestsPage.totalCount} tuition request{newRequestsPage.totalCount === 1 ? "" : "s"} awaiting review —{" "}
                    <Link href="/admin/tuition-requests" className="text-primary-container font-medium">
                      review now
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </div>

          <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-lg">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Recent Tuition Requests</h2>
            {newRequestsPage.items.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">No tuition requests yet.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {newRequestsPage.items.slice(0, 5).map(({ request, studentName }) => (
                  <Link
                    key={request.id}
                    href={`/admin/tuition-requests/${request.id}`}
                    className="flex items-center gap-3 py-2 border-b border-surface-variant last:border-0 font-body-sm text-body-sm text-on-surface-variant hover:text-primary-container transition-colors"
                  >
                    <MaterialIcon name="person" className="text-on-surface-variant shrink-0" />
                    {studentName ?? "Unnamed student"} — {catalogLabel(SUBJECTS, request.subjectId)} ({request.tuitionUid})
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-lg">
          <QuickActionsCard actions={quickActions} />
          <NotificationsCard notifications={recentNotifications} viewAllHref="/admin/notifications" />
        </div>
      </div>
    </div>
  );
}
