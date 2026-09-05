import { requireRole } from "@/server/auth/guards";
import { branchesCollection } from "@/server/domain/collections";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-surface-variant last:border-0">
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <span className="font-body-sm text-body-sm text-on-surface text-right">{value || "—"}</span>
    </div>
  );
}

export default async function AdminProfilePage() {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const branchSnap = session.branchId ? await branchesCollection().doc(session.branchId).get() : null;
  const branchName = branchSnap?.exists ? branchSnap.data()!.name : null;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Your Profile</h1>
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Account</h2>
        <Row label="Email" value={session.email ?? ""} />
        <Row label="Role" value={session.role === "SUPER_ADMIN" ? "Super Admin" : "Branch Admin"} />
        {session.role === "BRANCH_ADMIN" && <Row label="Branch" value={branchName ?? "Unassigned"} />}
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Admin accounts are provisioned directly and don&rsquo;t have a self-service edit screen — to change your
          name, email, or password, contact whoever manages the project&rsquo;s Firebase Console.
        </p>
      </div>
    </div>
  );
}
