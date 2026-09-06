"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveTutorLocationStep } from "@/server/actions/onboarding";
import { LocationCascadeSelect, type LocationNodeLite } from "@/components/shared/LocationCascadeSelect";
import { errorTextClass, fieldWrapClass, inputClass, labelClass } from "../formStyles";
import type { WizardProfileState } from "../types";

export function LocationStep({
  initial,
  provinces,
  initialCascade,
  onSaved,
  onBack,
}: {
  initial: WizardProfileState;
  provinces: LocationNodeLite[];
  initialCascade?: {
    provinceId?: string;
    districtId?: string;
    localGovernmentId?: string;
    wardNumber?: number;
    districts?: LocationNodeLite[];
    localGovernments?: LocationNodeLite[];
  };
  onSaved: (patch: Partial<WizardProfileState>) => void;
  onBack: () => void;
}) {
  const [wardId, setWardId] = useState<string | null>(initial.preferredLocationId);
  const [wardLabel, setWardLabel] = useState<string | null>(initial.preferredLocationLabel);
  const [preferredLocality, setPreferredLocality] = useState(initial.preferredLocality ?? "");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!wardId) {
      setError("Select your province, district, municipality, and ward.");
      return;
    }

    const formData = new FormData();
    formData.set("preferredLocationId", wardId);
    formData.set("preferredLocality", preferredLocality);

    startTransition(async () => {
      const result = await saveTutorLocationStep(formData);
      if (result.ok) {
        onSaved({ preferredLocationId: wardId, preferredLocationLabel: wardLabel, preferredLocality });
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

      <LocationCascadeSelect
        provinces={provinces}
        initialProvinceId={initialCascade?.provinceId}
        initialDistrictId={initialCascade?.districtId}
        initialLocalGovernmentId={initialCascade?.localGovernmentId}
        initialWardNumber={initialCascade?.wardNumber}
        initialDistricts={initialCascade?.districts}
        initialLocalGovernments={initialCascade?.localGovernments}
        onChange={(id, label) => {
          setWardId(id);
          setWardLabel(label);
        }}
      />
      {fieldErrors.preferredLocationId && <p className={errorTextClass}>{fieldErrors.preferredLocationId}</p>}

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="preferredLocality">Preferred locality / area</label>
        <input
          id="preferredLocality"
          className={inputClass}
          value={preferredLocality}
          onChange={(e) => setPreferredLocality(e.target.value)}
          placeholder="e.g. New Baneshwor"
          required
        />
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          No official directory of neighborhood names exists below ward level — enter the area
          name you&rsquo;re known by locally.
        </p>
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
