"use client";

import { useState, useTransition, type FormEvent } from "react";
import { uploadTutorCv } from "@/server/actions/onboarding";
import { errorTextClass } from "../formStyles";
import type { WizardProfileState } from "../types";

export function CvStep({
  initial,
  onSaved,
  onBack,
}: {
  initial: WizardProfileState;
  onSaved: (patch: Partial<WizardProfileState>) => void;
  onBack: () => void;
}) {
  const [cv, setCv] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!cv && !initial.hasCv) {
      setError("Choose a CV file to upload.");
      return;
    }
    if (!cv && initial.hasCv) {
      onSaved({});
      return;
    }

    const formData = new FormData();
    formData.set("cv", cv!);

    startTransition(async () => {
      const result = await uploadTutorCv(formData);
      if (result.ok) {
        onSaved({ hasCv: true });
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-headline-md text-headline-md text-on-surface">CV</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant -mt-2">
        PDF only, up to 5MB. Your CV is private — only you and reviewing admins can access it.
      </p>

      {initial.hasCv && (
        <p className="font-body-sm text-body-sm text-primary-container">A CV is already on file.</p>
      )}

      <input
        type="file"
        accept="application/pdf"
        className="font-body-sm text-body-sm"
        onChange={(e) => setCv(e.target.files?.[0] ?? null)}
      />

      {error && <p className={errorTextClass}>{error}</p>}

      <div className="flex justify-between">
        <button type="button" onClick={onBack} className="font-label-md text-label-md text-secondary px-6 py-3">
          Back
        </button>
        <button
          type="submit"
          disabled={pending}
          className="bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
        >
          {pending ? "Uploading..." : "Save & Continue"}
        </button>
      </div>
    </form>
  );
}
