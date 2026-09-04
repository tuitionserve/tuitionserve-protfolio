import { getCurrentSession } from "@/server/auth/session";
import { branchesCollection } from "@/server/domain/collections";

export default async function AdminDashboardPage() {
  const session = await getCurrentSession(); // Layout already enforced admin role.
  const branchName = session?.branchId
    ? ((await branchesCollection().doc(session.branchId).get()).data()?.name ?? "Unknown branch")
    : "All Branches";

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{branchName}</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {session?.role === "SUPER_ADMIN" ? "Platform-wide view" : "Branch operations"}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-md">
        <QueueTile label="New Requests" value={0} />
        <QueueTile label="Tutor Reviews" value={0} />
        <QueueTile label="Open Tuitions" value={0} />
        <QueueTile label="Selections" value={0} />
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Needs Attention</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Nothing needs your attention right now.</p>
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Recent Tuition Requests</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant">No tuition requests yet.</p>
      </div>
    </div>
  );
}

function QueueTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg text-center">
      <p className="font-display-lg text-headline-lg text-on-surface">{value}</p>
      <p className="font-label-md text-label-md text-on-surface-variant mt-1">{label}</p>
    </div>
  );
}
