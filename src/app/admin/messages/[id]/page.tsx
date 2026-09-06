import { notFound } from "next/navigation";
import Link from "next/link";
import { assertBranchScope, requireRole } from "@/server/auth/guards";
import { getConversationDetail, getMessagesForConversation } from "@/server/actions/messaging";
import { MessageThread } from "@/components/messaging/MessageThread";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default async function AdminConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);

  const detail = await getConversationDetail(id);
  if (!detail) notFound();
  try {
    assertBranchScope(session, detail.branchId);
  } catch {
    notFound();
  }

  const messages = await getMessagesForConversation(id);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-lg py-3.5 border-b border-surface-variant shrink-0">
        <Link href="/admin/messages" className="md:hidden text-on-surface-variant">
          <MaterialIcon name="arrow_back" />
        </Link>
        <div className="min-w-0">
          <p className="font-label-lg text-label-lg text-on-surface truncate">
            {detail.tutorName ?? "Unnamed tutor"}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{detail.tutorUid}</p>
        </div>
      </div>

      <MessageThread conversationId={id} initialMessages={messages} viewerUid={session.uid} />
    </div>
  );
}
