import Link from "next/link";
import { requireRole } from "@/server/auth/guards";
import { getConversationsForAdmin } from "@/server/actions/messaging";
import { tutorsCollection } from "@/server/domain/collections";
import { StartConversationForm } from "@/components/admin/messages/StartConversationForm";

function formatDate(millis: number | null): string {
  if (!millis) return "";
  return new Date(millis).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default async function AdminMessagesPage() {
  await requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"]);
  const conversations = await getConversationsForAdmin();

  const tutors = await Promise.all(conversations.map((c) => tutorsCollection().doc(c.tutorId).get()));

  return (
    <div className="flex flex-col gap-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Messages</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
          Conversations with tutors.
        </p>
      </div>

      <StartConversationForm />

      {conversations.length === 0 ? (
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg">
          <p className="font-body-sm text-body-sm text-on-surface-variant">No conversations yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {conversations.map((c, i) => (
            <Link
              key={c.id}
              href={`/admin/messages/${c.id}`}
              className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex items-center justify-between gap-4 hover:shadow-md transition-all"
            >
              <div className="min-w-0">
                <p className="font-label-md text-label-md text-on-surface">
                  {tutors[i]?.exists ? tutors[i]!.data()!.tutorUid : "Unknown tutor"}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {c.lastMessagePreview || "No messages yet"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="font-label-md text-label-md text-on-surface-variant">
                  {formatDate(c.lastMessageAt)}
                </span>
                {c.adminUnreadCount > 0 && (
                  <span className="font-label-md text-label-md bg-primary-container text-on-primary px-2 py-1 rounded-full">
                    {c.adminUnreadCount}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
