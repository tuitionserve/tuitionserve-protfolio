import { notFound } from "next/navigation";
import Link from "next/link";
import { assertBranchScope, requireRole } from "@/server/auth/guards";
import { getConversationDetail, getMessagesForConversation } from "@/server/actions/messaging";
import { MessageThread } from "@/components/messaging/MessageThread";

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
    <div className="flex flex-col gap-lg max-w-3xl">
      <div>
        <Link href="/admin/messages" className="font-label-md text-label-md text-primary-container">
          &larr; Messages
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mt-2">
          {detail.tutorName ?? "Unnamed tutor"}
        </h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{detail.tutorUid}</p>
      </div>

      <MessageThread conversationId={id} initialMessages={messages} viewerUid={session.uid} />
    </div>
  );
}
