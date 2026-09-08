import Link from "next/link";
import { notFound } from "next/navigation";
import { getBranchDetail } from "@/server/queries/branch-detail";
import { getAllDistricts } from "@/server/queries/location-hierarchy";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { BackButton } from "@/components/shared/BackButton";
import { BranchCoverageCard } from "@/components/admin/branches/BranchCoverageCard";

const STATUS_LABEL: Record<string, string> = {
  PROFILE_INCOMPLETE: "Incomplete",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  REJECTED: "Changes Required",
  RESUBMITTED: "Resubmitted",
  APPROVED: "Verified",
  SUSPENDED: "Suspended",
};

export default async function AdminBranchDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ branchId: string }>;
  searchParams: Promise<{ cursors?: string }>;
}) {
  const { branchId } = await params;
  const cursorStack = parseCursorStack((await searchParams).cursors);
  const [detail, districts] = await Promise.all([
    getBranchDetail(branchId, currentCursor(cursorStack)),
    getAllDistricts(),
  ]);
  const { branch, admins, tutors } = detail;
  if (!branch) notFound();

  return (
    <div className="flex flex-col gap-lg">
      <BackButton />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{branch.name}</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {branch.branchUid} · {branch.city}
          </p>
        </div>
        <span
          className={`font-label-md text-label-md px-3 py-1 rounded-full shrink-0 ${
            branch.status === "ACTIVE" ? "bg-primary-container/20 text-primary-container" : "bg-surface-container text-on-surface-variant"
          }`}
        >
          {branch.status === "ACTIVE" ? "Active" : "Inactive"}
        </span>
      </div>

      <BranchCoverageCard
        branch={{
          id: branch.id,
          name: branch.name,
          city: branch.city,
          coverage: branch.coverage,
        }}
        districts={districts}
      />

      <div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3">Admins ({admins.length})</h2>
        {admins.length === 0 ? (
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
            <p className="font-body-sm text-body-sm text-on-surface-variant">No admins assigned to this branch.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {admins.map((a) => (
              <div key={a.id} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4">
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{a.fullName ?? "Unnamed admin"}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {a.adminUid ?? "—"} · {a.email}
                  </p>
                </div>
                <span
                  className={`font-label-md text-label-md px-3 py-1 rounded-full shrink-0 ${
                    a.accountStatus === "ACTIVE" ? "bg-primary-container/20 text-primary-container" : "bg-error-container text-on-error-container"
                  }`}
                >
                  {a.accountStatus === "ACTIVE" ? "Active" : "Disabled"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-3">Tutors ({tutors.totalCount})</h2>
        {tutors.items.length === 0 ? (
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
            <p className="font-body-sm text-body-sm text-on-surface-variant">No tutors in this branch yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tutors.items.map((t) => (
              <Link
                key={t.id}
                href={`/admin/tutors/${t.id}`}
                className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4 hover:shadow-md transition-all"
              >
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{t.fullName ?? "Unnamed tutor"}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">{t.tutorUid}</p>
                </div>
                <span className="font-label-md text-label-md px-3 py-1 rounded-full bg-surface-container text-on-surface-variant shrink-0">
                  {STATUS_LABEL[t.verificationStatus] ?? t.verificationStatus}
                </span>
              </Link>
            ))}
          </div>
        )}
        <PaginationBar
          basePath={`/admin/branches/${branchId}`}
          cursorParamName="cursors"
          cursorStack={cursorStack}
          nextCursor={tutors.nextCursor}
          hasNextPage={tutors.hasNextPage}
          itemsCount={tutors.items.length}
          totalCount={tutors.totalCount}
          pageSize={DEFAULT_PAGE_SIZE}
        />
      </div>
    </div>
  );
}
