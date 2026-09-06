import { notFound } from "next/navigation";
import Link from "next/link";
import { requireActiveTutor } from "@/server/auth/guards";
import { getConversationDetail, getMessagesForConversation } from "@/server/actions/messaging";
import { branchesCollection } from "@/server/domain/collections";
import { MessageThread } from "@/components/messaging/MessageThread";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export default async function TutorConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireActiveTutor();

  const detail = await getConversationDetail(id);
  if (!detail || detail.tutorId !== session.uid) notFound();

  const messages = await getMessagesForConversation(id);
  const branchSnap = detail.branchId ? await branchesCollection().doc(detail.branchId).get() : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-lg py-3.5 border-b border-surface-variant shrink-0">
        <Link href="/tutor/messages" className="md:hidden text-on-surface-variant">
          <MaterialIcon name="arrow_back" />
        </Link>
        <p className="font-label-lg text-label-lg text-on-surface truncate">
          {branchSnap?.exists ? `Administrator — ${branchSnap.data()!.name}` : "Administrator"}
        </p>
      </div>

      <MessageThread conversationId={id} initialMessages={messages} viewerUid={session.uid} />
    </div>
  );
}
