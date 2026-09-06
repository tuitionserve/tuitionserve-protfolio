import { requireActiveTutor } from "@/server/auth/guards";
import { getConversationsForTutor } from "@/server/actions/messaging";
import { enrichConversationsForTutor } from "@/server/domain/messaging-views";
import { ConversationListPane } from "@/components/messaging/ConversationListPane";
import { MessagingShell } from "@/components/messaging/MessagingShell";

export default async function TutorMessagesLayout({ children }: { children: React.ReactNode }) {
  await requireActiveTutor();
  const page = await getConversationsForTutor(null);
  const items = await enrichConversationsForTutor(page.items);

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Messages</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Conversations with your branch administrators — updates live, no refresh needed.
        </p>
      </div>

      <MessagingShell
        basePath="/tutor/messages"
        listPane={
          <ConversationListPane
            initialItems={items}
            basePath="/tutor/messages"
            unreadField="tutorUnreadCount"
            emptyMessage="No conversations yet. An administrator will reach out here if they need to message you."
          />
        }
      >
        {children}
      </MessagingShell>
    </div>
  );
}
