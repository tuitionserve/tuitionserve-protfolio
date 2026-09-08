"use server";

import {
  getAllDistricts,
  getDistrictsForProvince,
  getLocalGovernmentsForDistrict,
  type LocationNode,
} from "@/server/queries/location-hierarchy";

/** Client-callable cascading lookups for the province -> district -> local government selector. */
export async function fetchAllDistricts(): Promise<LocationNode[]> {
  return getAllDistricts();
}

export async function fetchDistrictsForProvince(provinceId: string): Promise<LocationNode[]> {
  if (!provinceId) return [];
  return getDistrictsForProvince(provinceId);
}

export async function fetchLocalGovernmentsForDistrict(districtId: string): Promise<LocationNode[]> {
  if (!districtId) return [];
  return getLocalGovernmentsForDistrict(districtId);
}
