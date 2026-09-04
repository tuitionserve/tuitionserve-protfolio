"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { DAYS_OF_WEEK, GRADES, SUBJECTS, catalogLabel } from "@/lib/catalog";
import { LocationCascadeSelect, type LocationNodeLite } from "@/components/shared/LocationCascadeSelect";
import { searchOpportunities } from "@/server/actions/opportunities";
import type { TutorOpportunityView } from "@/server/queries/opportunities";

const inputClass =
  "border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 w-full";

export function OpportunityBrowser({
  initialOpportunities,
  provinces,
}: {
  initialOpportunities: TutorOpportunityView[];
  provinces: LocationNodeLite[];
}) {
  const [subjectId, setSubjectId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [localGovernmentId, setLocalGovernmentId] = useState<string | null>(null);
  const [localGovernmentLabel, setLocalGovernmentLabel] = useState<string | null>(null);
  const [results, setResults] = useState(initialOpportunities);
  const [pending, startTransition] = useTransition();

  function runSearch() {
    startTransition(async () => {
      const found = await searchOpportunities({
        subjectId: subjectId || undefined,
        gradeId: gradeId || undefined,
        dayOfWeek: dayOfWeek || undefined,
        localGovernmentId: localGovernmentId || undefined,
      });
      setResults(found);
    });
  }

  function clearFilters() {
    setSubjectId("");
    setGradeId("");
    setDayOfWeek("");
    setLocalGovernmentId(null);
    setLocalGovernmentLabel(null);
    startTransition(async () => {
      setResults(await searchOpportunities({}));
    });
  }

  return (
    <div className="flex flex-col gap-lg">
      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select className={inputClass} value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
            <option value="">Any subject</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <select className={inputClass} value={gradeId} onChange={(e) => setGradeId(e.target.value)}>
            <option value="">Any grade</option>
            {GRADES.map((g) => (
              <option key={g.id} value={g.id}>{g.label}</option>
            ))}
          </select>
          <select className={inputClass} value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
            <option value="">Any day</option>
            {DAYS_OF_WEEK.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <p className="font-label-md text-label-md text-on-surface-variant mb-2">
            Location — optional, narrows results without hiding everything else
          </p>
          <LocationCascadeSelect
            provinces={provinces}
            requireWard={false}
            onChange={(id, label) => {
              setLocalGovernmentId(id);
              setLocalGovernmentLabel(label);
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={runSearch}
            disabled={pending}
            className="bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
          >
            {pending ? "Searching..." : "Search"}
          </button>
          <button type="button" onClick={clearFilters} className="font-label-md text-label-md text-secondary">
            Clear filters
          </button>
          {localGovernmentLabel && (
            <span className="font-body-sm text-body-sm text-on-surface-variant">Filtering: {localGovernmentLabel}</span>
          )}
        </div>
      </div>

      {results.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No tuitions match your filters right now. Try clearing a filter or checking back later.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {results.map((op) => (
            <Link
              key={op.id}
              href={`/tutor/opportunities/${op.id}`}
              className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4 hover:shadow-md transition-all"
            >
              <div>
                <p className="font-label-md text-label-md text-on-surface">
                  {catalogLabel(GRADES, op.gradeId)} {catalogLabel(SUBJECTS, op.subjectId)}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {op.tuitionUid} · {op.tutorVisibleLocality} · Home Tuition
                </p>
              </div>
              <span className="font-label-md text-label-md text-primary-container shrink-0">View Details</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
