import { notFound } from "next/navigation";
import Link from "next/link";
import { requireActiveTutor } from "@/server/auth/guards";
import { getConversationDetail, getMessagesForConversation } from "@/server/actions/messaging";
import { branchesCollection } from "@/server/domain/collections";
import { MessageThread } from "@/components/messaging/MessageThread";

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
    <div className="flex flex-col gap-lg max-w-3xl">
      <div>
        <Link href="/tutor/messages" className="font-label-md text-label-md text-primary-container">
          &larr; Messages
        </Link>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mt-2">
          {branchSnap?.exists ? branchSnap.data()!.name : "Administrator"}
        </h1>
      </div>

      <MessageThread conversationId={id} initialMessages={messages} viewerUid={session.uid} />
    </div>
  );
}
