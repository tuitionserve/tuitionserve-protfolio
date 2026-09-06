import { requireRole } from "@/server/auth/guards";
import { getProvinces } from "@/server/queries/location-hierarchy";
import { SchoolVacancyForm } from "@/components/admin/tuition-requests/SchoolVacancyForm";
import { BackButton } from "@/components/shared/BackButton";

export default async function AdminPostSchoolVacancyPage() {
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const provinces = await getProvinces();

  return (
    <div className="max-w-2xl flex flex-col gap-lg">
      <BackButton />
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Post a School Vacancy</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          For after you&rsquo;ve talked to a school and there&rsquo;s an actual position to staff — this is
          different from a School Contact enquiry. It goes through the same review pipeline as a home tuition
          request, and tutors will see it in Available Tuitions tagged &ldquo;School&rdquo;.
        </p>
      </div>
      <SchoolVacancyForm provinces={provinces} />
    </div>
  );
}
