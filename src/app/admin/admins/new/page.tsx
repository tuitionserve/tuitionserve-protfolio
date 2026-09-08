import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { branchesCollection } from "@/server/domain/collections";
import { getAllDistricts } from "@/server/queries/location-hierarchy";
import { CreateAdminForm } from "@/components/admin/users/CreateAdminForm";

export default async function NewAdminPage() {
  await requireRole(["SUPER_ADMIN"]);
  const [branchesSnap, districts] = await Promise.all([
    branchesCollection().where("status", "==", "ACTIVE").get(),
    getAllDistricts(),
  ]);
  const branches = branchesSnap.docs.map((d) => ({ id: d.data().id, name: d.data().name }));

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <Link href="/admin/admins" className="font-label-md text-label-md text-primary-container">
          ← Back to Admins
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mt-2">Add Admin</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Registers a new Branch Admin or Super Admin account and assigns them a branch — no database access
          needed.
        </p>
      </div>

      <CreateAdminForm branches={branches} districts={districts} />
    </div>
  );
}
