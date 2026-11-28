import { requireRole } from "@/server/auth/guards";
import {
  branchesCollection,
  fetchDocsByIds,
  tutorProfilesCollection,
  tutorsCollection,
  userAccountsCollection,
} from "@/server/domain/collections";
import { fetchPage, type PageResult } from "@/server/domain/pagination";
import type { Branch } from "@/server/domain/types";

export interface BranchAdminRow {
  id: string;
  adminUid: string | null;
  fullName: string | null;
  email: string | null;
  role: "SUPER_ADMIN" | "BRANCH_ADMIN";
  accountStatus: "ACTIVE" | "DISABLED";
}

export interface BranchTutorRow {
  id: string;
  tutorUid: string;
  fullName: string | null;
  verificationStatus: string;
}

/** Super-Admin-only: a specific branch's own admins (small, unpaginated) and a paginated tutor list. */
export async function getBranchDetail(
  branchId: string,
  cursor: string | null,
): Promise<{ branch: Branch | null; admins: BranchAdminRow[]; tutors: PageResult<BranchTutorRow> }> {
  await requireRole(["SUPER_ADMIN"]);

  const branchSnap = await branchesCollection().doc(branchId).get();
  const branch = branchSnap.exists ? branchSnap.data()! : null;

  const adminsSnap = await userAccountsCollection()
    .where("role", "in", ["SUPER_ADMIN", "BRANCH_ADMIN"])
    .where("branchId", "==", branchId)
    .get();
  const admins: BranchAdminRow[] = adminsSnap.docs.map((d) => {
    const a = d.data();
    return { id: a.id, adminUid: a.adminUid, fullName: a.fullName, email: a.email, role: a.role as "SUPER_ADMIN" | "BRANCH_ADMIN", accountStatus: a.accountStatus };
  });

  const tutorsBase = tutorsCollection().where("branchId", "==", branchId);
  const tutorsPage = await fetchPage(tutorsBase, "createdAt", cursor);
  const profileMap = await fetchDocsByIds(
    tutorProfilesCollection(),
    tutorsPage.items.map((t) => t.id),
  );
  const tutors: PageResult<BranchTutorRow> = {
    ...tutorsPage,
    items: tutorsPage.items.map((t) => ({
      id: t.id,
      tutorUid: t.tutorUid,
      fullName: profileMap.get(t.id)?.fullName ?? null,
      verificationStatus: t.verificationStatus,
    })),
  };

  return { branch, admins, tutors };
}
