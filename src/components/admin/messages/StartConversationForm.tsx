"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startConversationWithTutorUid } from "@/server/actions/messaging";

/**
 * Manual "message a tutor by UID" entry point. Per the M9 task scope,
 * wiring a "message this tutor" button into other milestones' pages
 * (tutor detail, applicant list, tuition detail) is explicitly out of
 * scope — this form is the one place an admin can start a new
 * conversation for now.
 */
export function StartConversationForm() {
  const router = useRouter();
  const [tutorUid, setTutorUid] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    if (pending) return;
    setError(null);
    if (!tutorUid.trim()) {
      setError("Enter a Tutor UID.");
      return;
    }
    startTransition(async () => {
      const result = await startConversationWithTutorUid(tutorUid.trim());
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/admin/messages/${result.conversationId}`);
    });
  }

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col gap-3">
      <h2 className="font-headline-sm text-headline-sm text-on-surface">Message a Tutor</h2>
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={tutorUid}
          onChange={(e) => setTutorUid(e.target.value)}
          placeholder="Tutor UID (e.g. TS-T-000127)"
          disabled={pending}
          className="flex-1 min-w-[240px] border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={pending}
          className="bg-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          {pending ? "Starting..." : "Start Conversation"}
        </button>
      </div>
      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
    </div>
  );
}
