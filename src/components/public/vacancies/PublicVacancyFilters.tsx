import Link from "next/link";
import { DAYS_OF_WEEK, GRADES, SUBJECTS } from "@/lib/catalog";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

const selectClass =
  "border border-outline-variant bg-surface-container-lowest rounded-lg px-3 py-2.5 font-body-sm text-body-sm text-on-surface outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 w-full";

export function PublicVacancyFilters({
  branches,
  selectedType,
  selectedSubject,
  selectedGrade,
  selectedDay,
  selectedBranch,
}: {
  branches: { id: string; name: string; city: string }[];
  selectedType: string;
  selectedSubject: string;
  selectedGrade: string;
  selectedDay: string;
  selectedBranch: string;
}) {
  const hasFilters = Boolean(selectedType || selectedSubject || selectedGrade || selectedDay || selectedBranch);

  return (
    <form
      method="GET"
      action="/vacancies"
      className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-lg shadow-xs flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
          <MaterialIcon name="tune" className="text-lg text-primary" />
          Filter Vacancies
        </div>
        {hasFilters && (
          <Link href="/vacancies" className="font-label-md text-label-md text-primary hover:underline">
            Clear filters
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <select name="type" defaultValue={selectedType} className={selectClass} aria-label="Vacancy type">
          <option value="">All types</option>
          <option value="HOME_TUITION">Home Tuition</option>
          <option value="SCHOOL">School Vacancy</option>
        </select>

        <select name="subject" defaultValue={selectedSubject} className={selectClass} aria-label="Subject">
          <option value="">Any subject</option>
          {SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>

        <select name="grade" defaultValue={selectedGrade} className={selectClass} aria-label="Grade level">
          <option value="">Any grade</option>
          {GRADES.map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>

        <select name="branch" defaultValue={selectedBranch} className={selectClass} aria-label="City or branch">
          <option value="">All cities / branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.city}</option>
          ))}
        </select>

        <select name="day" defaultValue={selectedDay} className={selectClass} aria-label="Day of week">
          <option value="">Any day</option>
          {DAYS_OF_WEEK.map((d) => (
            <option key={d.id} value={d.id}>{d.label}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 bg-primary-container text-on-primary font-label-md text-label-md px-5 py-2.5 rounded-lg hover:shadow-md transition-all cursor-pointer"
        >
          <MaterialIcon name="search" className="text-[18px]" />
          Search Vacancies
        </button>
      </div>
    </form>
  );
}
