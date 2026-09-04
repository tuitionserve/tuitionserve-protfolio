"use client";

import { useState, useTransition, type FormEvent } from "react";
import { GENDERS } from "@/lib/catalog";
import { saveTutorPersonalStep } from "@/server/actions/onboarding";
import { errorTextClass, fieldWrapClass, inputClass, labelClass } from "../formStyles";
import type { WizardProfileState } from "../types";

export function PersonalStep({
  initial,
  onSaved,
}: {
  initial: WizardProfileState;
  onSaved: (patch: Partial<WizardProfileState>) => void;
}) {
  const [fullName, setFullName] = useState(initial.fullName ?? "");
  const [phone, setPhone] = useState(initial.phone ?? "");
  const [gender, setGender] = useState(initial.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(initial.dateOfBirth ?? "");
  const [address, setAddress] = useState(initial.address ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const formData = new FormData();
    formData.set("fullName", fullName);
    formData.set("phone", phone);
    formData.set("gender", gender);
    formData.set("dateOfBirth", dateOfBirth);
    formData.set("address", address);
    if (photo) formData.set("photo", photo);

    startTransition(async () => {
      const result = await saveTutorPersonalStep(formData);
      if (result.ok) {
        onSaved({ fullName, phone, gender, dateOfBirth, address, hasPhoto: initial.hasPhoto || Boolean(photo) });
      } else {
        setError(result.error);
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-headline-md text-headline-md text-on-surface">Personal Information</h2>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="fullName">Full name</label>
        <input id="fullName" className={inputClass} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        {fieldErrors.fullName && <p className={errorTextClass}>{fieldErrors.fullName}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="phone">Phone</label>
        <input id="phone" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} required />
        {fieldErrors.phone && <p className={errorTextClass}>{fieldErrors.phone}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="gender">Gender</label>
        <select id="gender" className={inputClass} value={gender} onChange={(e) => setGender(e.target.value)} required>
          <option value="" disabled>Select gender</option>
          {GENDERS.map((g) => (
            <option key={g.id} value={g.id}>{g.label}</option>
          ))}
        </select>
        {fieldErrors.gender && <p className={errorTextClass}>{fieldErrors.gender}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="dateOfBirth">Date of birth</label>
        <input
          id="dateOfBirth"
          type="date"
          className={inputClass}
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          required
        />
        {fieldErrors.dateOfBirth && <p className={errorTextClass}>{fieldErrors.dateOfBirth}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="address">Address</label>
        <textarea id="address" className={inputClass} rows={2} value={address} onChange={(e) => setAddress(e.target.value)} required />
        {fieldErrors.address && <p className={errorTextClass}>{fieldErrors.address}</p>}
      </div>

      <div className={fieldWrapClass}>
        <label className={labelClass} htmlFor="photo">
          Profile photo {initial.hasPhoto && <span className="text-primary-container">(already uploaded — optional to replace)</span>}
        </label>
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={inputClass}
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && <p className={errorTextClass}>{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-end bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-6 py-3 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save & Continue"}
      </button>
    </form>
  );
}
