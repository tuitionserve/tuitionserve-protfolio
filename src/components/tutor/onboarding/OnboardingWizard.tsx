"use client";

import { useState } from "react";
import { ProgressIndicator } from "./ProgressIndicator";
import { PersonalStep } from "./steps/PersonalStep";
import { EducationStep } from "./steps/EducationStep";
import { TeachingStep } from "./steps/TeachingStep";
import { LocationStep } from "./steps/LocationStep";
import { AvailabilityStep } from "./steps/AvailabilityStep";
import { CvStep } from "./steps/CvStep";
import { ReviewStep } from "./steps/ReviewStep";
import { EMPTY_WIZARD_PROFILE, type CascadeResumeState, type WizardProfileState } from "./types";
import type { LocationNodeLite } from "@/components/shared/LocationCascadeSelect";

const STEPS = ["personal", "education", "teaching", "location", "availability", "cv", "review"] as const;

export function OnboardingWizard({
  initialProfile,
  provinces,
  initialCascade,
}: {
  initialProfile: WizardProfileState | null;
  provinces: LocationNodeLite[];
  initialCascade?: CascadeResumeState;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [profile, setProfile] = useState<WizardProfileState>(initialProfile ?? EMPTY_WIZARD_PROFILE);

  function goNext(patch: Partial<WizardProfileState>) {
    setProfile((prev) => ({ ...prev, ...patch }));
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  const step = STEPS[stepIndex];

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm p-lg">
      <ProgressIndicator currentIndex={stepIndex} />

      {step === "personal" && <PersonalStep initial={profile} onSaved={goNext} />}
      {step === "education" && <EducationStep initial={profile} onSaved={goNext} onBack={goBack} />}
      {step === "teaching" && <TeachingStep initial={profile} onSaved={goNext} onBack={goBack} />}
      {step === "location" && (
        <LocationStep
          initial={profile}
          provinces={provinces}
          initialCascade={initialCascade}
          onSaved={goNext}
          onBack={goBack}
        />
      )}
      {step === "availability" && <AvailabilityStep initial={profile} onSaved={goNext} onBack={goBack} />}
      {step === "cv" && <CvStep initial={profile} onSaved={goNext} onBack={goBack} />}
      {step === "review" && <ReviewStep profile={profile} onBack={goBack} />}
    </div>
  );
}
