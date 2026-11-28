import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalogLabel, DAYS_OF_WEEK, GRADES, SUBJECTS } from "@/lib/catalog";
import { getCurrentSession } from "@/server/auth/session";
import { getPublicVacancyBySlugOrId } from "@/server/queries/public-vacancies";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CopyLinkButton } from "@/components/shared/CopyLinkButton";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { AdBanner } from "@/components/ads/AdBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { AD_SLOTS } from "@/lib/ads";
import { breadcrumbJsonLd, jobPostingJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

const GENDER_PREFERENCE_LABEL: Record<string, string> = {
  MALE: "Male tutor preferred",
  FEMALE: "Female tutor preferred",
  ANY: "Any gender welcome",
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 py-3 border-b border-surface-variant last:border-0">
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <span className="font-body-md text-body-md text-on-surface sm:text-right">{value || "—"}</span>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await getPublicVacancyBySlugOrId(slug);
  if (!vacancy) {
    return { title: "Vacancy Not Found — Tuition Serve" };
  }

  const isSchool = vacancy.postingType === "SCHOOL";
  const gradeText = (vacancy.gradeIds && vacancy.gradeIds.length > 0 ? vacancy.gradeIds : [vacancy.gradeId])
    .map((g) => catalogLabel(GRADES, g))
    .join(", ");
  const subjectText = vacancy.subjectIds.map((s) => catalogLabel(SUBJECTS, s)).join(", ");
  const locationText = vacancy.branchCity
    ? `${vacancy.tutorVisibleLocality}, ${vacancy.branchCity}`
    : vacancy.tutorVisibleLocality;

  const title = isSchool && vacancy.institutionName
    ? `${vacancy.institutionName} ${subjectText} Teacher Vacancy (${locationText}) — Tuition Serve`
    : `${gradeText} ${subjectText} Home Tuition in ${locationText} — Tuition Serve`;

  const description = `${isSchool ? "School teaching vacancy" : "Verified home tuition requirement"} (${vacancy.tuitionUid}) for ${gradeText} ${subjectText} near ${locationText}. View schedule and sign in to apply on Tuition Serve.`;

  return {
    title,
    description,
    alternates: { canonical: `/vacancies/${vacancy.slug}` },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function PublicVacancyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [vacancy, session] = await Promise.all([
    getPublicVacancyBySlugOrId(slug),
    getCurrentSession(),
  ]);

  if (!vacancy) notFound();

  const isSchool = vacancy.postingType === "SCHOOL";
  const isOpen = vacancy.status === "OPEN";
  const gradeText = (vacancy.gradeIds && vacancy.gradeIds.length > 0 ? vacancy.gradeIds : [vacancy.gradeId])
    .map((g) => catalogLabel(GRADES, g))
    .join(", ");
  const subjectText = vacancy.subjectIds.map((s) => catalogLabel(SUBJECTS, s)).join(", ");
  const locationText = vacancy.branchCity
    ? `${vacancy.tutorVisibleLocality}, ${vacancy.branchCity}`
    : vacancy.tutorVisibleLocality;

  const tutorOpportunityHref = `/tutor/opportunities/${vacancy.id}`;
  const loginHref = `/login?next=${encodeURIComponent(tutorOpportunityHref)}`;
  const registerHref = `/register?next=${encodeURIComponent(tutorOpportunityHref)}`;

  const jobTitle =
    isSchool && vacancy.institutionName
      ? `${vacancy.institutionName} — ${subjectText}`
      : `${gradeText} ${subjectText} Home Tuition`;

  const jobDescription = [
    `${isSchool ? "School Teaching Vacancy" : "Home Tuition"} (${vacancy.tuitionUid})`,
    `Grade: ${gradeText}`,
    `Subjects: ${subjectText}`,
    `Location: ${locationText}`,
    vacancy.notes ? `Requirements: ${vacancy.notes}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Vacancies", path: "/vacancies" },
          { name: jobTitle, path: `/vacancies/${vacancy.slug}` },
        ])}
      />
      {isOpen && (
        <JsonLd
          data={jobPostingJsonLd({
            title: jobTitle,
            description: jobDescription,
            identifier: vacancy.tuitionUid,
            slug: vacancy.slug,
            hiringOrganizationName:
              isSchool && vacancy.institutionName ? vacancy.institutionName : "Tuition Serve",
            locality: vacancy.tutorVisibleLocality,
            city: vacancy.branchCity,
            datePostedIso: vacancy.createdAtIso ?? new Date().toISOString(),
            employmentType: isSchool ? "FULL_TIME" : "PART_TIME",
          })}
        />
      )}
      <PublicHeader active="vacancies" />
      <main className="flex-1 w-full bg-surface px-margin-mobile md:px-margin-desktop py-xl max-w-max-width mx-auto">
        <div className="max-w-3xl mx-auto flex flex-col gap-lg">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <Link
              href="/vacancies"
              className="inline-flex items-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary"
            >
              <MaterialIcon name="arrow_back" className="text-[18px]" />
              Back to all vacancies
            </Link>
            <CopyLinkButton path={`/vacancies/${vacancy.slug}`} label="Share vacancy link" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`font-label-md text-[11px] px-2.5 py-0.5 rounded-full ${
                  isSchool
                    ? "bg-tertiary-container/40 text-on-tertiary-container"
                    : "bg-secondary-container/50 text-on-secondary-container"
                }`}
              >
                {isSchool ? "School Vacancy" : "Home Tuition"}
              </span>
              <span
                className={`font-label-md text-[11px] px-2.5 py-0.5 rounded-full ${
                  isOpen
                    ? "bg-primary-container/15 text-primary"
                    : "bg-surface-variant text-on-surface-variant"
                }`}
              >
                {isOpen ? "Open for applications" : "Filled / Closed"}
              </span>
              <span className="font-mono text-xs text-on-surface-variant">{vacancy.tuitionUid}</span>
            </div>

            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              {isSchool && vacancy.institutionName
                ? `${vacancy.institutionName} — ${subjectText}`
                : `${gradeText} · ${subjectText}`}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant inline-flex items-center gap-1.5">
              <MaterialIcon name="location_on" className="text-[18px] text-primary" />
              {locationText}
            </p>
          </div>

          {!isOpen ? (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-lg flex flex-col gap-3">
              <div className="flex items-center gap-2 text-on-surface">
                <MaterialIcon name="info" className="text-xl text-on-surface-variant" />
                <h2 className="font-headline-sm text-headline-sm">This vacancy is no longer open</h2>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                This position has already been filled or closed by Tuition Serve. Explore other active home tuition
                and school vacancies currently open for tutors.
              </p>
              <Link
                href="/vacancies"
                className="self-start font-label-md text-label-md bg-primary-container text-on-primary px-4 py-2.5 rounded-lg"
              >
                Browse Open Vacancies
              </Link>
            </div>
          ) : (
            <>
              <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-lg shadow-xs">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Vacancy Summary</h2>
                {isSchool && vacancy.institutionName && (
                  <DetailRow label="School / Institution" value={vacancy.institutionName} />
                )}
                <DetailRow label="Type" value={isSchool ? "School Teaching Vacancy" : "Home Tuition"} />
                <DetailRow label="Grade / Level" value={gradeText} />
                <DetailRow label="Subjects" value={subjectText} />
                <DetailRow label="Locality" value={locationText} />
                <DetailRow
                  label="Tutor preference"
                  value={GENDER_PREFERENCE_LABEL[vacancy.tutorGenderPreference] ?? "Any tutor"}
                />
                <DetailRow
                  label="Preferred Schedule"
                  value={
                    vacancy.availability.length > 0
                      ? vacancy.availability
                          .map((s) => `${catalogLabel(DAYS_OF_WEEK, s.dayOfWeek)} ${s.startTime}-${s.endTime}`)
                          .join("; ")
                      : "Flexible — discuss upon selection"
                  }
                />
                {vacancy.notes && <DetailRow label="Additional Notes" value={vacancy.notes} />}
              </div>

              <AdBanner slotId={AD_SLOTS.vacancyDetail} />

              <div className="bg-primary-container/10 border border-primary-container/30 rounded-2xl p-lg flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <MaterialIcon name="lock_open" className="text-2xl text-primary shrink-0 mt-0.5" />
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">
                      Interested in applying for this {isSchool ? "school vacancy" : "home tuition"}?
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Only registered and verified Tuition Serve tutors can submit applications. Exact house
                      addresses and parent/school phone contacts are kept private until you are assigned.
                    </p>
                  </div>
                </div>

                {session?.role === "TUTOR" ? (
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={tutorOpportunityHref}
                      className="inline-flex items-center gap-2 font-label-md text-label-md bg-primary-container text-on-primary px-5 py-3 rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                      <MaterialIcon name="send" className="text-[18px]" />
                      Apply on Tutor Portal
                    </Link>
                  </div>
                ) : session?.role === "SUPER_ADMIN" || session?.role === "BRANCH_ADMIN" ? (
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/admin/tuition-requests/${vacancy.id}`}
                      className="inline-flex items-center gap-2 font-label-md text-label-md bg-primary-container text-on-primary px-5 py-3 rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                      <MaterialIcon name="admin_panel_settings" className="text-[18px]" />
                      Manage in Admin Portal
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <Link
                      href={loginHref}
                      className="inline-flex items-center gap-2 font-label-md text-label-md bg-primary-container text-on-primary px-5 py-3 rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                      <MaterialIcon name="login" className="text-[18px]" />
                      Log In to Apply
                    </Link>
                    <Link
                      href={registerHref}
                      className="inline-flex items-center gap-2 font-label-md text-label-md border border-secondary text-secondary bg-surface-container-lowest px-5 py-3 rounded-lg hover:bg-surface-container transition-all"
                    >
                      Register as a Tutor
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
