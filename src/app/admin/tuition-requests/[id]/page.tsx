import { notFound } from "next/navigation";
import { assertBranchScope, requireRole } from "@/server/auth/guards";
import { parentsCollection, studentsCollection, tuitionRequestsCollection } from "@/server/domain/collections";
import { catalogLabel, DAYS_OF_WEEK, GRADES, SUBJECTS } from "@/lib/catalog";
import { currentCursor, parseCursorStack, DEFAULT_PAGE_SIZE, type PageResult } from "@/server/domain/pagination";
import { TuitionRequestReviewActions } from "@/components/admin/tuition-requests/TuitionRequestReviewActions";
import { ApplicantsList } from "@/components/admin/tuition-requests/ApplicantsList";
import { AssignmentReviewPanel } from "@/components/admin/tuition-requests/AssignmentReviewPanel";
import { getApplicantsForTuition, type AdminApplicantView } from "@/server/queries/admin-applicants";
import { getLatestAssignmentForTuition } from "@/server/queries/admin-assignment";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-surface-variant last:border-0">
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <span className="font-body-sm text-body-sm text-on-surface text-right">{value || "—"}</span>
    </div>
  );
}

export default async function AdminTuitionRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cursors?: string }>;
}) {
  const { id } = await params;
  const cursorStack = parseCursorStack((await searchParams).cursors);
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const requestSnap = await tuitionRequestsCollection().doc(id).get();
  if (!requestSnap.exists) notFound();
  const request = requestSnap.data()!;

  try {
    assertBranchScope(session, request.branchId);
  } catch {
    notFound();
  }

  const emptyApplicantsPage: PageResult<AdminApplicantView> = {
    items: [],
    nextCursor: null,
    hasNextPage: false,
    totalCount: 0,
  };

  const [parentSnap, studentSnap, applicants, assignment] = await Promise.all([
    parentsCollection().doc(request.parentId).get(),
    studentsCollection().doc(request.studentId).get(),
    request.status === "NEW"
      ? Promise.resolve(emptyApplicantsPage)
      : getApplicantsForTuition(id, currentCursor(cursorStack)),
    request.status === "ASSIGNED" ? getLatestAssignmentForTuition(id) : Promise.resolve(null),
  ]);
  const parent = parentSnap.data() ?? null;
  const student = studentSnap.data() ?? null;

  return (
    <div className="max-w-2xl flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          {student?.fullName ?? "Unnamed student"} — {catalogLabel(SUBJECTS, request.subjectId)}
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{request.tuitionUid}</p>
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Parent</h2>
        <Row label="Name" value={parent?.fullName ?? ""} />
        <Row label="Phone" value={parent?.phone ?? ""} />
        <Row label="Email" value={parent?.email ?? ""} />
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Student & Tuition</h2>
        <Row label="Student" value={student?.fullName ?? ""} />
        <Row label="Grade" value={student ? catalogLabel(GRADES, student.gradeId) : ""} />
        <Row label="School" value={student?.schoolName ?? ""} />
        <Row label="Subject" value={catalogLabel(SUBJECTS, request.subjectId)} />
        <Row
          label="Availability"
          value={request.availability
            .map((s) => `${catalogLabel(DAYS_OF_WEEK, s.dayOfWeek)} ${s.startTime}-${s.endTime}`)
            .join("; ")}
        />
        <Row label="Notes" value={request.notes ?? ""} />
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Location (admin-only)</h2>
        <Row label="Area / locality" value={request.tutorVisibleLocality} />
        <Row label="Exact address" value={request.exactAddress} />
      </div>

      {request.status === "NEW" ? (
        <TuitionRequestReviewActions requestId={id} />
      ) : request.status === "ASSIGNED" && assignment ? (
        <AssignmentReviewPanel assignment={assignment} tuitionId={id} />
      ) : (
        <ApplicantsList
          applicants={applicants.items}
          tuitionId={id}
          tuitionUid={request.tuitionUid}
          canAssign={request.status === "OPEN"}
          basePath={`/admin/tuition-requests/${id}`}
          cursorStack={cursorStack}
          nextCursor={applicants.nextCursor}
          hasNextPage={applicants.hasNextPage}
          totalCount={applicants.totalCount}
        />
      )}
    </div>
  );
}
