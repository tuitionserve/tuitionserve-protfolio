import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { getTuitionRequestQueue } from "@/server/queries/tuition-requests";
import { catalogLabel, SUBJECTS } from "@/lib/catalog";

export default async function AdminTuitionRequestsQueuePage() {
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const rows = await getTuitionRequestQueue(session);

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Tuition Requests</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Parent requests awaiting confirmation.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No tuition requests are currently awaiting review.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map(({ request, parentName, studentName }) => (
            <Link
              key={request.id}
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
              <span className="font-label-md text-label-md px-3 py-1 rounded-full bg-tertiary-container/30 text-on-tertiary-container shrink-0">
                New
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
