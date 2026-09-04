import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { branchesCollection } from "@/server/domain/collections";
import { getTutorReviewQueue } from "@/server/queries/tutor-review";

export default async function AdminDashboardPage() {
  // Re-runs the guard rather than trusting the layout ran first — see the
  // same note in tutor/dashboard/page.tsx.
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const [branchName, tutorReviewQueue] = await Promise.all([
    session.branchId
      ? branchesCollection()
          .doc(session.branchId)
          .get()
          .then((snap) => snap.data()?.name ?? "Unknown branch")
      : Promise.resolve("All Branches"),
    getTutorReviewQueue(session),
  ]);

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{branchName}</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {session.role === "SUPER_ADMIN" ? "Platform-wide view" : "Branch operations"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        <QueueTile label="New Requests" value={0} href="/admin/tuition-requests" />
        <QueueTile label="Tutor Reviews" value={tutorReviewQueue.length} href="/admin/tutors" />
        <QueueTile label="Open Tuitions" value={0} />
        <QueueTile label="Selections" value={0} />
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Needs Attention</h2>
        {tutorReviewQueue.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">Nothing needs your attention right now.</p>
        ) : (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {tutorReviewQueue.length} tutor application{tutorReviewQueue.length === 1 ? "" : "s"} awaiting review —{" "}
            <Link href="/admin/tutors" className="text-primary-container font-medium">
              review now
            </Link>
            .
          </p>
        )}
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Recent Tuition Requests</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">No tuition requests yet.</p>
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
