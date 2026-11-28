import { requireRole } from "@/server/auth/guards";
import { getProvinces } from "@/server/queries/location-hierarchy";
import { TuitionRequestForm } from "@/components/public/tuition-request/TuitionRequestForm";
import { submitTuitionRequestAsAdmin } from "@/server/actions/admin-tuition-request";
import { BackButton } from "@/components/shared/BackButton";

export default async function AdminPostTuitionPage() {
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const provinces = await getProvinces();

  return (
    <div className="max-w-2xl flex flex-col gap-lg">
      <BackButton />
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Post a Tuition Request</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          For a parent who called or messaged you directly instead of using the website. Admin-posted tuitions
          skip verification and publish straight to Open Tuitions &amp; the public Vacancies page.
        </p>
      </div>
      <TuitionRequestForm
        provinces={provinces}
        initialGradeId=""
        initialSubjectId=""
        action={submitTuitionRequestAsAdmin}
        directPublished
        successHref="/admin/tuition-requests/open"
        successHrefLabel="View Open Tuitions"
      />
    </div>
  );
}
