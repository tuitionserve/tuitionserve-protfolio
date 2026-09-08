"use client";

import { useState, useTransition } from "react";
import type { BranchCoverage } from "@/server/domain/types";
import type { LocationNode } from "@/server/queries/location-hierarchy";
import { BranchCoveragePicker } from "./BranchCoveragePicker";
import { updateBranchCoverage } from "@/server/actions/branch";

interface BranchCoverageCardProps {
  branch: {
    id: string;
    name: string;
    city: string;
    coverage?: BranchCoverage[];
  };
  districts: LocationNode[];
}

export function BranchCoverageCard({ branch, districts }: BranchCoverageCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(branch.name);
  const [city, setCity] = useState(branch.city);
  const [coverage, setCoverage] = useState<BranchCoverage[]>(branch.coverage ?? []);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.set("branchId", branch.id);
    formData.set("name", name);
    formData.set("city", city);
    formData.set("coverage", JSON.stringify(coverage));

    startTransition(async () => {
      const result = await updateBranchCoverage(formData);
      if (result.ok) {
        setSuccess("Branch coverage updated successfully.");
        setIsEditing(false);
      } else {
        setError(result.error);
      }
    });
  }

  function handleCancel() {
    setName(branch.name);
    setCity(branch.city);
    setCoverage(branch.coverage ?? []);
    setError(null);
    setIsEditing(false);
  }

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Geographic Coverage & Scope</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Defines which districts and municipalities route tuition requests and tutors to this branch.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setSuccess(null);
              setError(null);
            }}
            className="bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-4 py-2 hover:opacity-90 transition-all shadow-xs"
          >
            Edit Coverage & Settings
          </button>
        )}
      </div>

      {success && (
        <div className="bg-primary-container/10 border border-primary-container/30 rounded-lg p-3">
          <p className="font-body-sm text-body-sm text-primary-container font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg p-3">
          <p className="font-body-sm text-body-sm text-error font-medium">{error}</p>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSave} className="flex flex-col gap-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="edit-branch-name">
                Branch Name
              </label>
              <input
                id="edit-branch-name"
                className="border border-outline-variant rounded-lg p-2.5 font-body-sm text-body-sm outline-none focus:border-primary-container"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="edit-branch-city">
                City / Headquarters
              </label>
              <input
                id="edit-branch-city"
                className="border border-outline-variant rounded-lg p-2.5 font-body-sm text-body-sm outline-none focus:border-primary-container"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="border-t border-surface-variant pt-3">
            <BranchCoveragePicker
              districts={districts}
              value={coverage}
              onChange={setCoverage}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={pending}
              className="bg-primary-container text-on-primary font-label-md text-label-md rounded-lg px-5 py-2.5 shadow-sm hover:shadow-md transition-all disabled:opacity-60"
            >
              {pending ? "Saving..." : "Save Coverage"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={pending}
              className="border border-secondary text-secondary font-label-md text-label-md rounded-lg px-5 py-2.5 hover:bg-surface-container transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          {(!branch.coverage || branch.coverage.length === 0) ? (
            <div className="bg-surface-container/60 border border-outline-variant/40 rounded-lg p-4">
              <p className="font-body-sm text-body-sm text-on-surface">
                <strong>Legacy fallback active:</strong> This branch matches locations where the municipality name contains <span className="font-semibold text-primary-container">&ldquo;{branch.city}&rdquo;</span>.
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Click &ldquo;Edit Coverage & Settings&rdquo; above to assign specific districts (e.g. Dhanusha, Mahottari) and municipalities so all relevant areas route here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {branch.coverage.map((c) => {
                const dist = districts.find((d) => d.id === c.districtId);
                const distLabel = dist ? (dist.nameEnglish ? `${dist.nameEnglish} (${dist.name})` : dist.name) : c.districtName ?? c.districtId;
                const isEntire = !c.localGovernmentIds || c.localGovernmentIds.length === 0;

                return (
                  <div
                    key={c.districtId}
                    className="bg-surface-container/40 border border-surface-variant rounded-lg p-3 flex flex-col gap-1"
                  >
                    <span className="font-label-md text-label-md text-on-surface font-semibold">{distLabel}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          isEntire ? "bg-primary-container" : "bg-tertiary"
                        }`}
                      />
                      <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                        {isEntire
                          ? "Entire District (All Municipalities)"
                          : `${c.localGovernmentIds!.length} specific municipality/ies`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
