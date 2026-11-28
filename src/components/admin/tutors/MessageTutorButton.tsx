"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startOrGetConversation } from "@/server/actions/messaging";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

export function MessageTutorButton({ tutorId }: { tutorId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await startOrGetConversation(tutorId);
      if (result.ok) {
        router.push(`/admin/messages/${result.conversationId}`);
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-2 border border-secondary text-secondary font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-surface-container transition-all disabled:opacity-50"
      >
        <MaterialIcon name="chat" className="text-lg" />
        {pending ? "Opening..." : "Message Tutor"}
      </button>
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
    </div>
  );
}
