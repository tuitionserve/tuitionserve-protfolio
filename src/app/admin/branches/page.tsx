import { requireRole } from "@/server/auth/guards";
import { branchesCollection } from "@/server/domain/collections";

export default async function AdminBranchesPage() {
  // Super Admin only — a Branch Admin has exactly one branch and no
  // reason to browse others; requireRole below enforces this even if
  // someone guesses the URL.
  await requireRole(["SUPER_ADMIN"]);
  const snap = await branchesCollection().orderBy("createdAt", "desc").get();
  const branches = snap.docs.map((d) => d.data());

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Branches</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {branches.length} branch{branches.length === 1 ? "" : "es"}. New branches are created via the
          provisioning script when a new Branch Admin is set up — see the client handbook.
        </p>
      </div>

      {branches.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">No branches yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-label-md text-label-md text-on-surface">{branch.name}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {branch.branchUid} · {branch.city}
                </p>
              </div>
              <span
                className={`font-label-md text-label-md px-3 py-1 rounded-full shrink-0 ${
                  branch.status === "ACTIVE"
                    ? "bg-primary-container/20 text-primary-container"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {branch.status === "ACTIVE" ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
