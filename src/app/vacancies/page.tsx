import type { Metadata } from "next";
import Link from "next/link";
import { catalogLabel, DAYS_OF_WEEK, GRADES, SUBJECTS } from "@/lib/catalog";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE } from "@/server/domain/pagination";
import {
  getPublicOpenVacancies,
  getPublicVacancyBranches,
} from "@/server/queries/public-vacancies";
import type { TuitionPostingType } from "@/server/domain/types";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicVacancyFilters } from "@/components/public/vacancies/PublicVacancyFilters";
import { PaginationBar } from "@/components/shared/PaginationBar";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { AdBanner } from "@/components/ads/AdBanner";
import { JsonLd } from "@/components/seo/JsonLd";
import { AD_SLOTS } from "@/lib/ads";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Open Home Tuition & School Teaching Vacancies",
  description:
    "Browse verified home tuition and school teaching vacancies across Nepal. Filter by subject, grade, schedule, and city, then sign in or register to apply.",
  alternates: { canonical: "/vacancies" },
  openGraph: {
    title: "Open Home Tuition & School Teaching Vacancies — Tuition Serve",
    description:
      "Browse verified home tuition and school teaching vacancies across Nepal.",
    type: "website",
  },
};

const GENDER_PREFERENCE_LABEL: Record<string, string> = {
  MALE: "Male tutor",
  FEMALE: "Female tutor",
  ANY: "Any tutor",
};

export default async function PublicVacanciesPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    subject?: string;
    grade?: string;
    day?: string;
    branch?: string;
    cursors?: string;
  }>;
}) {
  const params = await searchParams;
  const postingType: TuitionPostingType | undefined =
    params.type === "HOME_TUITION" || params.type === "SCHOOL" ? params.type : undefined;
  const subjectId = params.subject || undefined;
  const gradeId = params.grade || undefined;
  const dayOfWeek = params.day || undefined;
  const branchId = params.branch || undefined;
  const cursorStack = parseCursorStack(params.cursors);

  const [page, branches] = await Promise.all([
    getPublicOpenVacancies(
      { postingType, subjectId, gradeId, dayOfWeek, branchId },
      currentCursor(cursorStack),
    ),
    getPublicVacancyBranches(),
  ]);

  const extraParams: Record<string, string> = {};
  if (postingType) extraParams.type = postingType;
  if (subjectId) extraParams.subject = subjectId;
  if (gradeId) extraParams.grade = gradeId;
  if (dayOfWeek) extraParams.day = dayOfWeek;
  if (branchId) extraParams.branch = branchId;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Vacancies", path: "/vacancies" },
        ])}
      />
      <PublicHeader active="vacancies" />
      <main className="flex-1 w-full bg-surface">
        <section className="w-full px-margin-mobile md:px-margin-desktop pt-xl pb-lg max-w-max-width mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary bg-primary-container/12 px-3 py-1 rounded-full mb-3">
                <MaterialIcon name="work_outline" className="text-[16px]" />
                Live Teaching Opportunities
              </span>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">
                Open Home Tuition &amp; School Vacancies
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Browse verified requirements posted by families, schools, and Tuition Serve branch teams. Exact
                addresses and contact details remain private — sign in or register as a tutor to apply.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/register"
                className="font-label-md text-label-md border border-outline-variant bg-surface-container-lowest text-on-surface px-4 py-2.5 rounded-lg hover:border-primary-container transition-all"
              >
                Become a Tutor
              </Link>
              <Link
                href="/request-tutor"
                className="font-label-md text-label-md bg-primary-container text-on-primary px-4 py-2.5 rounded-lg shadow-xs hover:shadow-md transition-all"
              >
                Request a Tutor
              </Link>
            </div>
          </div>
        </section>

        <section className="w-full px-margin-mobile md:px-margin-desktop pb-xxl max-w-max-width mx-auto flex flex-col gap-lg">
          <PublicVacancyFilters
            branches={branches}
            selectedType={postingType ?? ""}
            selectedSubject={subjectId ?? ""}
            selectedGrade={gradeId ?? ""}
            selectedDay={dayOfWeek ?? ""}
            selectedBranch={branchId ?? ""}
          />

          <AdBanner slotId={AD_SLOTS.vacanciesTop} />

          {page.items.length === 0 ? (
            <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-xl text-center flex flex-col items-center gap-3">
              <MaterialIcon name="search_off" className="text-4xl text-on-surface-variant" />
              <h2 className="font-headline-sm text-headline-sm text-on-surface">No matching open vacancies</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-[30rem]">
                Try clearing some filters or check back soon — new home tuition and school requirements are added
                daily.
              </p>
              <Link
                href="/register"
                className="mt-2 font-label-md text-label-md bg-primary-container text-on-primary px-4 py-2.5 rounded-lg"
              >
                Register as a Tutor to Get Notified
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {page.items.map((vacancy) => {
                const isSchool = vacancy.postingType === "SCHOOL";
                const gradeList =
                  vacancy.gradeIds && vacancy.gradeIds.length > 0 ? vacancy.gradeIds : [vacancy.gradeId];
                const gradeText = gradeList.map((g) => catalogLabel(GRADES, g)).join(", ");
                const subjectText = vacancy.subjectIds.map((s) => catalogLabel(SUBJECTS, s)).join(", ");
                const locationText = vacancy.branchCity
                  ? `${vacancy.tutorVisibleLocality}, ${vacancy.branchCity}`
                  : vacancy.tutorVisibleLocality;

                return (
                  <Link
                    key={vacancy.id}
                    href={`/vacancies/${vacancy.slug}`}
                    className="group bg-surface-container-lowest border border-surface-variant rounded-2xl p-lg flex flex-col justify-between gap-4 hover:border-primary-container hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`font-label-md text-[11px] px-2.5 py-0.5 rounded-full ${
                            isSchool
                              ? "bg-tertiary-container/40 text-on-tertiary-container"
                              : "bg-secondary-container/50 text-on-secondary-container"
                          }`}
                        >
                          {isSchool ? "School Vacancy" : "Home Tuition"}
                        </span>
                        <span className="font-mono text-xs text-on-surface-variant">{vacancy.tuitionUid}</span>
                      </div>

                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                          {isSchool && vacancy.institutionName
                            ? `${vacancy.institutionName} — ${subjectText}`
                            : `${gradeText} · ${subjectText}`}
                        </h2>
                        {isSchool && (
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{gradeText}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-body-sm text-body-sm text-on-surface-variant">
                        <span className="inline-flex items-center gap-1">
                          <MaterialIcon name="location_on" className="text-[16px] text-primary" />
                          {locationText}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MaterialIcon name="person_outline" className="text-[16px] text-primary" />
                          {GENDER_PREFERENCE_LABEL[vacancy.tutorGenderPreference] ?? "Any tutor"}
                        </span>
                      </div>

                      {vacancy.availability.length > 0 && (
                        <p className="font-body-sm text-body-sm text-on-surface-variant flex items-start gap-1.5">
                          <MaterialIcon name="schedule" className="text-[16px] text-primary shrink-0 mt-0.5" />
                          <span>
                            {vacancy.availability
                              .slice(0, 3)
                              .map((s) => `${catalogLabel(DAYS_OF_WEEK, s.dayOfWeek)} ${s.startTime}-${s.endTime}`)
                              .join(" · ")}
                            {vacancy.availability.length > 3 && ` +${vacancy.availability.length - 3} more`}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-surface-variant flex items-center justify-between gap-2">
                      <span className="font-label-md text-label-md text-primary-container inline-flex items-center gap-1">
                        View details &amp; apply
                        <MaterialIcon name="arrow_forward" className="text-[16px]" />
                      </span>
                      <span className="font-label-md text-[11px] bg-primary-container/15 text-primary px-2.5 py-1 rounded-full">
                        Open
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <PaginationBar
            basePath="/vacancies"
            cursorParamName="cursors"
            cursorStack={cursorStack}
            nextCursor={page.nextCursor}
            hasNextPage={page.hasNextPage}
            itemsCount={page.items.length}
            totalCount={page.totalCount}
            pageSize={DEFAULT_PAGE_SIZE}
            extraParams={Object.keys(extraParams).length > 0 ? extraParams : undefined}
          />
        </section>
      </main>
      <PublicFooter />
    </>
  );
}
