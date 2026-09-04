import { geographicLocationsCollection } from "@/server/domain/collections";

export interface LocationOption {
  id: string;
  name: string;
  provinceName: string | null;
}

/** City-level options for the tutor onboarding Location step, grouped display-side by province. */
export async function getCityLocationOptions(): Promise<LocationOption[]> {
  const snap = await geographicLocationsCollection().where("level", "==", "CITY").get();
  const provinceSnap = await geographicLocationsCollection().where("level", "==", "PROVINCE").get();
  const provinceNames = new Map(provinceSnap.docs.map((d) => [d.id, d.data().name]));

  return snap.docs
    .map((d) => {
      const data = d.data();
      return {
        id: d.id,
        name: data.name,
        provinceName: data.parentLocationId ? (provinceNames.get(data.parentLocationId) ?? null) : null,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
