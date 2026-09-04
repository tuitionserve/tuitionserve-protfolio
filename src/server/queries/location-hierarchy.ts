import { geographicLocationsCollection } from "@/server/domain/collections";
import type { GeographicLocation } from "@/server/domain/types";
import { buildWardOptions as buildWardOptionsPure } from "@/lib/location";

export { locationLabel } from "@/lib/location";

export interface LocationNode {
  id: string;
  name: string;
  nameEnglish: string | null;
  wardCount: number | null;
}

function toNode(loc: GeographicLocation): LocationNode {
  return { id: loc.id, name: loc.name, nameEnglish: loc.nameEnglish, wardCount: loc.wardCount };
}

export async function getProvinces(): Promise<LocationNode[]> {
  const snap = await geographicLocationsCollection().where("level", "==", "PROVINCE").get();
  return snap.docs.map((d) => toNode(d.data())).sort((a, b) => a.name.localeCompare(b.name, "ne"));
}

export async function getDistrictsForProvince(provinceId: string): Promise<LocationNode[]> {
  const snap = await geographicLocationsCollection()
    .where("level", "==", "DISTRICT")
    .where("parentLocationId", "==", provinceId)
    .get();
  return snap.docs.map((d) => toNode(d.data())).sort((a, b) => a.name.localeCompare(b.name, "ne"));
}

export async function getLocalGovernmentsForDistrict(districtId: string): Promise<LocationNode[]> {
  const snap = await geographicLocationsCollection()
    .where("level", "==", "LOCAL_GOVERNMENT")
    .where("parentLocationId", "==", districtId)
    .get();
  return snap.docs.map((d) => toNode(d.data())).sort((a, b) => a.name.localeCompare(b.name, "ne"));
}

/** Ward IDs/numbers are derived deterministically from the local government — no query needed. */
export function buildWardOptions(localGovernmentId: string, wardCount: number): LocationNode[] {
  return buildWardOptionsPure(localGovernmentId, wardCount).map(({ id, wardNumber }) => ({
    id,
    name: `वडा ${wardNumber}`,
    nameEnglish: `Ward ${wardNumber}`,
    wardCount: null,
  }));
}

export async function getWardById(wardId: string): Promise<GeographicLocation | null> {
  const snap = await geographicLocationsCollection().doc(wardId).get();
  return snap.exists ? snap.data()! : null;
}

/** Walks WARD -> LOCAL_GOVERNMENT -> DISTRICT -> PROVINCE, for display/branch-routing. */
export async function getLocationAncestry(locationId: string): Promise<GeographicLocation[]> {
  const chain: GeographicLocation[] = [];
  let current = await geographicLocationsCollection().doc(locationId).get();
  while (current.exists) {
    const data = current.data()!;
    chain.push(data);
    if (!data.parentLocationId) break;
    current = await geographicLocationsCollection().doc(data.parentLocationId).get();
  }
  return chain; // [ward, localGovernment, district, province]
}
