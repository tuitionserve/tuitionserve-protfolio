import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { getCityLocationOptions } from "@/server/queries/locations";
import { TuitionRequestForm } from "@/components/public/tuition-request/TuitionRequestForm";

const GRADE_ID_FROM_WIDGET: Record<string, string> = {
  primary: "primary-1-5",
  "lower-secondary": "lower-secondary-6-8",
  secondary: "secondary-9-10",
  "higher-secondary": "higher-secondary-11-12",
};

export default async function RequestTutorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const locationOptions = await getCityLocationOptions();

  const gradeParam = typeof params.grade === "string" ? params.grade : undefined;
  const subjectParam = typeof params.subject === "string" ? params.subject : undefined;
  const cityParam = typeof params.city === "string" ? params.city : undefined;

  return (
    <>
      <PublicHeader active="Find a Tutor" />
      <main className="flex-1 px-margin-mobile md:px-margin-desktop py-xxl max-w-max-width mx-auto w-full">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Request a Tutor</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-8">
            Tell us about your requirement — no account needed. Our team will review it and match
            you with a verified tutor.
          </p>
          <TuitionRequestForm
            locationOptions={locationOptions}
            initialGradeId={gradeParam ? (GRADE_ID_FROM_WIDGET[gradeParam] ?? "") : ""}
            initialSubjectId={subjectParam ?? ""}
            initialLocationId={cityParam ? `city-${cityParam}` : ""}
          />
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
