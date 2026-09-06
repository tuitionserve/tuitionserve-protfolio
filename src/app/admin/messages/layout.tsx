import { requireRole } from "@/server/auth/guards";
import { getConversationsForAdmin } from "@/server/actions/messaging";
import { enrichConversationsForAdmin } from "@/server/domain/messaging-views";
import { StartConversationForm } from "@/components/admin/messages/StartConversationForm";
import { ConversationListPane } from "@/components/messaging/ConversationListPane";
import { MessagingShell } from "@/components/messaging/MessagingShell";

export default async function AdminMessagesLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const page = await getConversationsForAdmin(null);
  const items = await enrichConversationsForAdmin(page.items);

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Messages</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Conversations with tutors — updates live, no refresh needed.
        </p>
      </div>

      <StartConversationForm />

      <MessagingShell
        basePath="/admin/messages"
        listPane={
          <ConversationListPane
            initialItems={items}
            basePath="/admin/messages"
            unreadField="adminUnreadCount"
            emptyMessage="No conversations yet."
          />
        }
      >
        {children}
      </MessagingShell>
    </div>
  );
}
