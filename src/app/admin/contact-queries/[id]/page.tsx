import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/guards";
import { getContactQueryDetail } from "@/server/queries/contact-queries";
import { replyMailtoHref } from "@/lib/mailto";
import { BackButton } from "@/components/shared/BackButton";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-surface-variant last:border-0">
      <span className="font-label-md text-label-md text-on-surface-variant">{label}</span>
      <span className="font-body-sm text-body-sm text-on-surface text-right">{value || "—"}</span>
    </div>
  );
}

export default async function AdminContactQueryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const query = await getContactQueryDetail(id);
  if (!query) notFound();

  return (
    <div className="max-w-2xl flex flex-col gap-lg">
      <BackButton />
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">{query.fullName}</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{query.queryUid}</p>
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <Row label="Email" value={query.email} />
        <Row label="Phone" value={query.phone ?? ""} />
        <Row label="Location" value={query.location} />
      </div>

      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">Message</h2>
        <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap break-words">{query.message}</p>
      </div>

      <a
        href={replyMailtoHref(query.email, query.queryUid, query.message)}
        className="self-start inline-flex items-center gap-2 bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all"
      >
        <MaterialIcon name="reply" className="text-xl" />
        Reply by Email
      </a>
    </div>
  );
}
