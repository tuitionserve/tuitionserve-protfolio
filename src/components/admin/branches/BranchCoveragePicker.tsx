"use client";

import { useState, useEffect } from "react";
import type { LocationNode } from "@/server/queries/location-hierarchy";
import type { BranchCoverage } from "@/server/domain/types";
import { fetchLocalGovernmentsForDistrict } from "@/server/actions/location-cascade";

interface BranchCoveragePickerProps {
  districts: LocationNode[];
  value: BranchCoverage[];
  onChange: (value: BranchCoverage[]) => void;
}

export function BranchCoveragePicker({ districts, value, onChange }: BranchCoveragePickerProps) {
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  // Local government cache per district ID: districtId -> LocationNode[]
  const [lgCache, setLgCache] = useState<Record<string, LocationNode[]>>({});
  const [loadingLg, setLoadingLg] = useState<Record<string, boolean>>({});

  // Districts available to be added (excluding those already selected)
  const availableDistricts = districts.filter((d) => !value.some((c) => c.districtId === d.id));

  // Load local governments for districts that have specific municipalities chosen
  useEffect(() => {
    for (const coverage of value) {
      if (coverage.localGovernmentIds && coverage.localGovernmentIds.length > 0) {
        if (!lgCache[coverage.districtId] && !loadingLg[coverage.districtId]) {
          fetchLocalGovernmentsForDistrict(coverage.districtId).then((lgs) => {
            setLgCache((prev) => ({ ...prev, [coverage.districtId]: lgs }));
          });
        }
      }
    }
  }, [value, lgCache, loadingLg]);

  async function loadLocalGovernments(districtId: string) {
    if (lgCache[districtId] || loadingLg[districtId]) return;
    setLoadingLg((prev) => ({ ...prev, [districtId]: true }));
    try {
      const lgs = await fetchLocalGovernmentsForDistrict(districtId);
      setLgCache((prev) => ({ ...prev, [districtId]: lgs }));
    } finally {
      setLoadingLg((prev) => ({ ...prev, [districtId]: false }));
    }
  }

  function handleAddDistrict() {
    if (!selectedDistrictId) return;
    const dist = districts.find((d) => d.id === selectedDistrictId);
    if (!dist) return;

    const newCoverage: BranchCoverage = {
      districtId: dist.id,
      districtName: dist.nameEnglish ?? dist.name,
      localGovernmentIds: [], // Empty means entire district by default
    };

    onChange([...value, newCoverage]);
    setSelectedDistrictId("");
  }

  function handleRemoveDistrict(districtId: string) {
    onChange(value.filter((c) => c.districtId !== districtId));
  }

  function handleCoverageModeChange(districtId: string, mode: "ENTIRE" | "SPECIFIC") {
    const updated = value.map((c) => {
      if (c.districtId !== districtId) return c;
      if (mode === "ENTIRE") {
        return { ...c, localGovernmentIds: [] };
      }
      return { ...c, localGovernmentIds: c.localGovernmentIds ?? [] };
    });
    onChange(updated);

    if (mode === "SPECIFIC") {
      loadLocalGovernments(districtId);
    }
  }

  function handleToggleLocalGovernment(districtId: string, lgId: string) {
    const updated = value.map((c) => {
      if (c.districtId !== districtId) return c;
      const current = c.localGovernmentIds ?? [];
      const next = current.includes(lgId) ? current.filter((id) => id !== lgId) : [...current, lgId];
      return { ...c, localGovernmentIds: next };
    });
    onChange(updated);
  }

  function handleSelectAllLgs(districtId: string) {
    const lgs = lgCache[districtId] ?? [];
    const updated = value.map((c) => {
      if (c.districtId !== districtId) return c;
      return { ...c, localGovernmentIds: lgs.map((l) => l.id) };
    });
    onChange(updated);
  }

  function handleDeselectAllLgs(districtId: string) {
    const updated = value.map((c) => {
      if (c.districtId !== districtId) return c;
      return { ...c, localGovernmentIds: [] };
    });
    onChange(updated);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label className="font-label-md text-label-md text-on-surface">Geographic Coverage (Districts & Municipalities)</label>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Requests and tutor applications from these locations will automatically route to this branch. Select an entire district or choose specific municipalities.
        </p>
      </div>

      {/* Add district selector */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          className="border border-outline-variant rounded-lg p-2.5 font-body-sm text-body-sm outline-none focus:border-primary-container bg-surface-container-lowest flex-1 min-w-[15rem]"
          value={selectedDistrictId}
          onChange={(e) => setSelectedDistrictId(e.target.value)}
        >
          <option value="">Select a district to cover...</option>
          {availableDistricts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nameEnglish ? `${d.nameEnglish} (${d.name})` : d.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          disabled={!selectedDistrictId}
          onClick={handleAddDistrict}
          className="bg-secondary text-on-secondary font-label-md text-label-md rounded-lg px-4 py-2.5 disabled:opacity-50 hover:opacity-90 transition-all shrink-0"
        >
          + Add District
        </button>
      </div>

      {/* Selected district cards */}
      {value.length === 0 ? (
        <div className="bg-surface-container border border-dashed border-outline-variant rounded-xl p-4 text-center">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            No districts selected yet. (The branch will fall back to matching the city name text until districts are added).
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {value.map((cov) => {
            const dist = districts.find((d) => d.id === cov.districtId);
            const distLabel = dist ? (dist.nameEnglish ? `${dist.nameEnglish} (${dist.name})` : dist.name) : cov.districtName ?? cov.districtId;
            const isSpecific = (cov.localGovernmentIds && cov.localGovernmentIds.length > 0) || (loadingLg[cov.districtId] ?? false);
            const lgs = lgCache[cov.districtId] ?? [];
            const selectedLgCount = cov.localGovernmentIds?.length ?? 0;

            return (
              <div
                key={cov.districtId}
                className="bg-surface-container-lowest border border-surface-variant rounded-xl p-4 flex flex-col gap-3 shadow-xs"
              >
                <div className="flex items-center justify-between gap-2 border-b border-surface-variant pb-2">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">{distLabel}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDistrict(cov.districtId)}
                    className="text-error font-label-sm text-label-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>

                {/* Coverage scope mode */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <label className="flex items-center gap-2 cursor-pointer font-body-sm text-body-sm text-on-surface">
                    <input
                      type="radio"
                      name={`mode-${cov.districtId}`}
                      checked={!isSpecific}
                      onChange={() => handleCoverageModeChange(cov.districtId, "ENTIRE")}
                      className="text-primary-container focus:ring-primary-container"
                    />
                    <span>
                      Entire District <span className="text-on-surface-variant text-xs">(All municipalities route here)</span>
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-body-sm text-body-sm text-on-surface">
                    <input
                      type="radio"
                      name={`mode-${cov.districtId}`}
                      checked={isSpecific}
                      onChange={() => handleCoverageModeChange(cov.districtId, "SPECIFIC")}
                      className="text-primary-container focus:ring-primary-container"
                    />
                    <span>
                      Specific Municipalities Only
                      {isSpecific && selectedLgCount > 0 && (
                        <span className="ml-1.5 px-2 py-0.5 rounded-full text-xs bg-primary-container/20 text-primary-container font-medium">
                          {selectedLgCount} selected
                        </span>
                      )}
                    </span>
                  </label>
                </div>

                {/* Specific municipalities checklist */}
                {isSpecific && (
                  <div className="bg-surface-container/50 border border-outline-variant/50 rounded-lg p-3 flex flex-col gap-2 mt-1">
                    {loadingLg[cov.districtId] ? (
                      <p className="font-body-sm text-body-sm text-on-surface-variant italic">Loading municipalities for this district...</p>
                    ) : lgs.length === 0 ? (
                      <p className="font-body-sm text-body-sm text-on-surface-variant">No municipalities found.</p>
                    ) : (
                      <>
                        <div className="flex justify-between items-center text-xs text-on-surface-variant border-b border-outline-variant/30 pb-1.5">
                          <span>Check the municipalities covered by this branch:</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectAllLgs(cov.districtId)}
                              className="text-primary-container hover:underline font-medium"
                            >
                              Select All
                            </button>
                            <span>·</span>
                            <button
                              type="button"
                              onClick={() => handleDeselectAllLgs(cov.districtId)}
                              className="text-on-surface-variant hover:underline"
                            >
                              Deselect All
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                          {lgs.map((lg) => {
                            const isChecked = cov.localGovernmentIds?.includes(lg.id) ?? false;
                            const lgLabel = lg.nameEnglish ? `${lg.nameEnglish} (${lg.name})` : lg.name;
                            return (
                              <label
                                key={lg.id}
                                className={`flex items-center gap-2 p-1.5 rounded cursor-pointer text-xs font-body-sm transition-colors ${
                                  isChecked ? "bg-primary-container/10 text-on-surface font-medium" : "hover:bg-surface-container text-on-surface-variant"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleLocalGovernment(cov.districtId, lg.id)}
                                  className="rounded text-primary-container focus:ring-primary-container"
                                />
                                <span className="truncate">{lgLabel}</span>
                              </label>
                            );
                          })}
                        </div>
                        {selectedLgCount === 0 && (
                          <p className="font-body-sm text-body-sm text-error text-xs">
                            Select at least one municipality, or choose &quot;Entire District&quot; above.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
