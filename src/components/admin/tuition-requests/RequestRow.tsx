import Link from "next/link";
import { catalogLabel, SUBJECTS } from "@/lib/catalog";
import type { TuitionRequestQueueRow } from "@/server/queries/tuition-requests";

export function RequestRow({
  row,
  badgeLabel,
  badgeClass,
}: {
  row: TuitionRequestQueueRow;
  badgeLabel: string;
  badgeClass: string;
}) {
  const { request, parentName, studentName } = row;
  const isSchool = request.postingType === "SCHOOL";
  return (
    <Link
      href={`/admin/tuition-requests/${request.id}`}
      className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4 hover:shadow-md transition-all"
    >
      <div>
        <div className="flex items-center gap-2">
          <span
            className={`font-label-md text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
              isSchool ? "bg-tertiary-container/40 text-on-tertiary-container" : "bg-secondary-container/50 text-on-secondary-container"
            }`}
          >
            {isSchool ? "School" : "Home Tuition"}
          </span>
          <p className="font-label-md text-label-md text-on-surface">
            {(isSchool ? request.institutionName : studentName) ?? "Unnamed"} —{" "}
            {request.subjectIds.map((s) => catalogLabel(SUBJECTS, s)).join(", ")}
          </p>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          {request.tuitionUid} · {parentName ?? "Unknown contact"} · {request.tutorVisibleLocality}
        </p>
      </div>
      <span className={`font-label-md text-label-md px-3 py-1 rounded-full shrink-0 ${badgeClass}`}>
        {badgeLabel}
      </span>
    </Link>
  );
}
