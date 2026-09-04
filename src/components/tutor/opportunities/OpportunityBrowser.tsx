"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { DAYS_OF_WEEK, GRADES, SUBJECTS, catalogLabel } from "@/lib/catalog";
import { LocationCascadeSelect, type LocationNodeLite } from "@/components/shared/LocationCascadeSelect";
import { searchOpportunities } from "@/server/actions/opportunities";
import type { PageResult } from "@/server/domain/pagination";
// DEFAULT_PAGE_SIZE specifically comes from the client-safe re-export —
// importing it (a value, not just a type) from server/domain/pagination
// would pull that file's `firebase-admin/firestore` import into the
// browser bundle and break the build (Node-only APIs).
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import type { TutorOpportunityView, OpportunityFilters } from "@/server/queries/opportunities";

const inputClass =
  "border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 w-full";

export function OpportunityBrowser({
  initialPage,
  provinces,
}: {
  initialPage: PageResult<TutorOpportunityView>;
  provinces: LocationNodeLite[];
}) {
  const [subjectId, setSubjectId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [localGovernmentId, setLocalGovernmentId] = useState<string | null>(null);
  const [localGovernmentLabel, setLocalGovernmentLabel] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  // Client-side cursor stack (this browser is fully client-driven, unlike
  // the other list pages which use URL query params) — mirrors the same
  // "page N = stack of prior cursors" model as PaginationBar.
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  function currentFilters(): OpportunityFilters {
    return {
      subjectId: subjectId || undefined,
      gradeId: gradeId || undefined,
      dayOfWeek: dayOfWeek || undefined,
      localGovernmentId: localGovernmentId || undefined,
    };
  }

  function runSearch(filters: OpportunityFilters, nextStack: string[]) {
    startTransition(async () => {
      const found = await searchOpportunities(filters, nextStack.length > 0 ? nextStack[nextStack.length - 1]! : null);
      setPage(found);
      setCursorStack(nextStack);
    });
  }

  function handleSearch() {
    runSearch(currentFilters(), []); // a new filter search always starts back at page 1.
  }

  function clearFilters() {
    setSubjectId("");
    setGradeId("");
    setDayOfWeek("");
    setLocalGovernmentId(null);
    setLocalGovernmentLabel(null);
    runSearch({}, []);
  }

  function goNext() {
    if (!page.nextCursor) return;
    runSearch(currentFilters(), [...cursorStack, page.nextCursor]);
  }

  function goPrevious() {
    runSearch(currentFilters(), cursorStack.slice(0, -1));
  }

  const rangeStart = cursorStack.length * DEFAULT_PAGE_SIZE + 1;
  const rangeEnd = cursorStack.length * DEFAULT_PAGE_SIZE + page.items.length;

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
            onClick={handleSearch}
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

      {page.items.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No tuitions match your filters right now. Try clearing a filter or checking back later.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {page.items.map((op) => (
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

      {page.totalCount > 0 && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Showing {rangeStart}-{rangeEnd} of {page.totalCount}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goPrevious}
              disabled={pending || cursorStack.length === 0}
              className="font-label-md text-label-md text-secondary border border-secondary px-4 py-2 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={pending || !page.hasNextPage}
              className="font-label-md text-label-md text-secondary border border-secondary px-4 py-2 rounded-lg hover:bg-surface-container transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
