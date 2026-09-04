"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveTutorLocationStep } from "@/server/actions/onboarding";
import { errorTextClass, fieldWrapClass, inputClass, labelClass } from "../formStyles";
import type { LocationOption, WizardProfileState } from "../types";

export function LocationStep({
  initial,
  locationOptions,
  onSaved,
  onBack,
}: {
  initial: WizardProfileState;
  locationOptions: LocationOption[];
  onSaved: (patch: Partial<WizardProfileState>) => void;
  onBack: () => void;
}) {
  const [preferredLocationId, setPreferredLocationId] = useState(initial.preferredLocationId ?? "");
  const [preferredLocality, setPreferredLocality] = useState(initial.preferredLocality ?? "");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.set("preferredLocationId", preferredLocationId);
    formData.set("preferredLocality", preferredLocality);

    startTransition(async () => {
      const result = await saveTutorLocationStep(formData);
      if (result.ok) {
        onSaved({ preferredLocationId, preferredLocality });
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-headline-md text-headline-md text-on-surface">Preferred Teaching Location</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant -mt-2">
        This guides which tuitions you&rsquo;ll see first — it won&rsquo;t limit you from browsing the wider area.
      </p>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="preferredLocationId">City</label>
        <select
          id="preferredLocationId"
          className={inputClass}
          value={preferredLocationId}
          onChange={(e) => setPreferredLocationId(e.target.value)}
          required
        >
          <option value="" disabled>Select city</option>
          {locationOptions.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
              {loc.provinceName ? ` (${loc.provinceName})` : ""}
            </option>
          ))}
        </select>
        {fieldErrors.preferredLocationId && <p className={errorTextClass}>{fieldErrors.preferredLocationId}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="preferredLocality">Preferred locality / area</label>
        <input
          id="preferredLocality"
          className={inputClass}
          value={preferredLocality}
          onChange={(e) => setPreferredLocality(e.target.value)}
          placeholder="e.g. Devichowk"
          required
        />
        {fieldErrors.preferredLocality && <p className={errorTextClass}>{fieldErrors.preferredLocality}</p>}
      </div>

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
          {pending ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </form>
  );
}
