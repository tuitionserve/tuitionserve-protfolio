import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { getProvinces } from "@/server/queries/location-hierarchy";
import { TuitionRequestForm } from "@/components/public/tuition-request/TuitionRequestForm";

export const metadata: Metadata = {
  title: "Request a Home Tutor",
  description:
    "Submit your student's grade, subjects, locality, and preferred schedule to get matched with a verified home tutor across Nepal.",
  alternates: { canonical: "/request-tutor" },
};

const CITY_LABELS: Record<string, string> = {
  kathmandu: "Kathmandu",
  lalitpur: "Lalitpur",
  pokhara: "Pokhara",
};

export default async function RequestTutorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const provinces = await getProvinces();

  const gradeParam = typeof params.grade === "string" ? params.grade : undefined;
  const subjectParam = typeof params.subject === "string" ? params.subject : undefined;
  const cityParam = typeof params.city === "string" ? (CITY_LABELS[params.city.toLowerCase()] ?? params.city) : undefined;
  const scheduleParam = typeof params.schedule === "string" ? params.schedule : undefined;

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
            provinces={provinces}
            initialGradeId={gradeParam ?? ""}
            initialSubjectId={subjectParam ?? ""}
            initialLocality={cityParam ?? ""}
            initialSchedule={scheduleParam ?? ""}
          />
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
