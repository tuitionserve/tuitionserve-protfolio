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
  return (
    <Link
      href={`/admin/tuition-requests/${request.id}`}
      className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4 hover:shadow-md transition-all"
    >
      <div>
        <p className="font-label-md text-label-md text-on-surface">
          {studentName ?? "Unnamed student"} — {catalogLabel(SUBJECTS, request.subjectId)}
        </p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {request.tuitionUid} · {parentName ?? "Unknown parent"} · {request.tutorVisibleLocality}
        </p>
      </div>
      <span className={`font-label-md text-label-md px-3 py-1 rounded-full shrink-0 ${badgeClass}`}>
        {badgeLabel}
      </span>
    </Link>
  );
}
