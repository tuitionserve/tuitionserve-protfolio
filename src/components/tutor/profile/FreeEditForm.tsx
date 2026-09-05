"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { updateFreeEditFields } from "@/server/actions/profile-changes";

export function FreeEditForm({ initialExperience, hasPhoto }: { initialExperience: string | null; hasPhoto: boolean }) {
  const router = useRouter();
  const [experience, setExperience] = useState(initialExperience ?? "");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const formData = new FormData();
    formData.set("teachingExperienceSummary", experience);
    if (photo) formData.set("photo", photo);

    startTransition(async () => {
      const result = await updateFreeEditFields(formData);
      if (result.ok) {
        setSaved(true);
        setPhoto(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="experience">
          Teaching experience
        </label>
        <textarea
          id="experience"
          className="border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 w-full"
          rows={3}
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="photo">
          Profile photo {hasPhoto && <span className="text-primary-container">(already uploaded — optional to replace)</span>}
        </label>
        <input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="font-body-sm text-body-sm text-on-surface-variant file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-label-md file:text-label-md file:bg-primary-container file:text-on-primary hover:file:shadow-md file:transition-all file:cursor-pointer cursor-pointer"
          onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}
      {saved && <p className="font-body-sm text-body-sm text-primary-container">Saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-5 py-2.5 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
