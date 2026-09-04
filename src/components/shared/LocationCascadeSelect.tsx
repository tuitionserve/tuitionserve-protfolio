"use client";

import { useEffect, useState } from "react";
import {
  fetchDistrictsForProvince,
  fetchLocalGovernmentsForDistrict,
} from "@/server/actions/location-cascade";
import { buildWardOptions, locationLabel } from "@/lib/location";

export interface LocationNodeLite {
  id: string;
  name: string;
  nameEnglish: string | null;
  wardCount: number | null;
}

const selectClass =
  "border border-outline-variant rounded-lg p-3 font-body-sm text-body-sm outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 w-full";

/**
 * Province -> District -> Local Government -> Ward cascading selector.
 * Avoids sending Nepal's full ~7,600-record hierarchy to the client
 * (uiux-product-fidelity skill: no giant unstructured dropdowns) — each
 * level is fetched on demand for just the selected parent, and ward
 * options are generated client-side from the selected local
 * government's ward count (no fetch needed, ward IDs are deterministic).
 */
export function LocationCascadeSelect({
  provinces,
  initialProvinceId,
  initialDistrictId,
  initialLocalGovernmentId,
  initialWardNumber,
  initialDistricts,
  initialLocalGovernments,
  requireWard = true,
  onChange,
}: {
  provinces: LocationNodeLite[];
  initialProvinceId?: string;
  initialDistrictId?: string;
  initialLocalGovernmentId?: string;
  initialWardNumber?: number;
  initialDistricts?: LocationNodeLite[];
  initialLocalGovernments?: LocationNodeLite[];
  /** When false, stops at Local Government (no ward select) and fires onChange with the local government's id — for broad filtering, not precise address capture. Fields also become optional. */
  requireWard?: boolean;
  onChange: (locationId: string | null, label: string | null) => void;
}) {
  const [provinceId, setProvinceId] = useState(initialProvinceId ?? "");
  const [districtId, setDistrictId] = useState(initialDistrictId ?? "");
  const [localGovernmentId, setLocalGovernmentId] = useState(initialLocalGovernmentId ?? "");
  const [wardNumber, setWardNumber] = useState<string>(
    initialWardNumber ? String(initialWardNumber) : "",
  );

  const [districts, setDistricts] = useState<LocationNodeLite[]>(initialDistricts ?? []);
  const [localGovernments, setLocalGovernments] = useState<LocationNodeLite[]>(
    initialLocalGovernments ?? [],
  );
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingLocalGovernments, setLoadingLocalGovernments] = useState(false);

  const selectedLocalGovernment = localGovernments.find((l) => l.id === localGovernmentId) ?? null;
  const wardOptions = selectedLocalGovernment?.wardCount
    ? buildWardOptions(selectedLocalGovernment.id, selectedLocalGovernment.wardCount)
    : [];

  function handleProvinceChange(next: string) {
    setProvinceId(next);
    setDistrictId("");
    setLocalGovernmentId("");
    setWardNumber("");
    setDistricts([]);
    setLocalGovernments([]);
    onChange(null, null);
    if (!next) return;
    setLoadingDistricts(true);
    fetchDistrictsForProvince(next)
      .then(setDistricts)
      .finally(() => setLoadingDistricts(false));
  }

  function handleDistrictChange(next: string) {
    setDistrictId(next);
    setLocalGovernmentId("");
    setWardNumber("");
    setLocalGovernments([]);
    onChange(null, null);
    if (!next) return;
    setLoadingLocalGovernments(true);
    fetchLocalGovernmentsForDistrict(next)
      .then(setLocalGovernments)
      .finally(() => setLoadingLocalGovernments(false));
  }

  function handleLocalGovernmentChange(next: string) {
    setLocalGovernmentId(next);
    setWardNumber("");
    if (!requireWard) {
      const lg = localGovernments.find((l) => l.id === next);
      const district = districts.find((d) => d.id === districtId);
      if (!next || !lg) {
        onChange(null, null);
        return;
      }
      const label = [locationLabel(lg), district ? locationLabel(district) : null].filter(Boolean).join(", ");
      onChange(next, label);
      return;
    }
    onChange(null, null);
  }

  function handleWardChange(next: string) {
    setWardNumber(next);
    const district = districts.find((d) => d.id === districtId);
    if (!next || !selectedLocalGovernment) {
      onChange(null, null);
      return;
    }
    const code = selectedLocalGovernment.id.replace(/^lg-/, "");
    const label = [locationLabel(selectedLocalGovernment), district ? locationLabel(district) : null, `Ward ${next}`]
      .filter(Boolean)
      .join(", ");
    onChange(`ward-${code}-${next.padStart(2, "0")}`, label);
  }

  // Fire the initial wardId once on mount if we were given a complete resume state.
  useEffect(() => {
    if (initialLocalGovernmentId && initialWardNumber) {
      const code = initialLocalGovernmentId.replace(/^lg-/, "");
      const lg = (initialLocalGovernments ?? []).find((l) => l.id === initialLocalGovernmentId);
      const d = (initialDistricts ?? []).find((x) => x.id === initialDistrictId);
      const label = [lg ? locationLabel(lg) : null, d ? locationLabel(d) : null, `Ward ${initialWardNumber}`]
        .filter(Boolean)
        .join(", ");
      onChange(`ward-${code}-${String(initialWardNumber).padStart(2, "0")}`, label);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="flex flex-col gap-2">
        <label className="font-label-md text-label-md text-on-surface-variant">Province</label>
        <select className={selectClass} value={provinceId} onChange={(e) => handleProvinceChange(e.target.value)} required={requireWard}>
          <option value="">{requireWard ? "Select province" : "Any province"}</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>{locationLabel(p)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-label-md text-label-md text-on-surface-variant">District</label>
        <select
          className={selectClass}
          value={districtId}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={!provinceId || loadingDistricts}
          required={requireWard}
        >
          <option value="">{loadingDistricts ? "Loading..." : requireWard ? "Select district" : "Any district"}</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>{locationLabel(d)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-label-md text-label-md text-on-surface-variant">Municipality / Rural Municipality</label>
        <select
          className={selectClass}
          value={localGovernmentId}
          onChange={(e) => handleLocalGovernmentChange(e.target.value)}
          disabled={!districtId || loadingLocalGovernments}
          required={requireWard}
        >
          <option value="">{loadingLocalGovernments ? "Loading..." : requireWard ? "Select municipality" : "Any municipality"}</option>
          {localGovernments.map((l) => (
            <option key={l.id} value={l.id}>{locationLabel(l)}</option>
          ))}
        </select>
      </div>

      {requireWard && (
        <div className="flex flex-col gap-2">
          <label className="font-label-md text-label-md text-on-surface-variant">Ward</label>
          <select
            className={selectClass}
            value={wardNumber}
            onChange={(e) => handleWardChange(e.target.value)}
            disabled={!localGovernmentId}
            required
          >
            <option value="" disabled>Select ward</option>
            {wardOptions.map((w) => (
              <option key={w.id} value={w.wardNumber}>Ward {w.wardNumber}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
