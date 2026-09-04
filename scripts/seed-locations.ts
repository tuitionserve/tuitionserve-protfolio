/**
 * SUPERSEDED by `pnpm import-locations` (implementation plan M6) — see
 * data/locations/SOURCES.md. That script imports the authoritative
 * Province/District/Local Government/Ward hierarchy sourced from the
 * Government of Nepal General Post Office.
 *
 * This script is kept, and its ~20 "CITY"-level provisional records are
 * kept in Firestore (not deleted), only until the application has been
 * fully validated against the M6 dataset — do not use it for new
 * environments; use `pnpm import-locations` instead. Its 7 "PROVINCE"
 * records share IDs with the M6 dataset's provinces and are harmlessly
 * superseded (richer fields) when `pnpm import-locations` is run after
 * this script.
 *
 * Usage: pnpm seed-locations
 */
import { geographicLocationsCollection } from "../src/server/domain/collections";
import {
  CITY_SEED,
  PROVINCE_SEED,
  cityLocationId,
  provinceLocationId,
} from "../src/server/domain/location-seed-data";

async function main() {
  const batch = geographicLocationsCollection().firestore.batch();

  for (const province of PROVINCE_SEED) {
    const id = provinceLocationId(province.slug);
    batch.set(geographicLocationsCollection().doc(id), {
      id,
      level: "PROVINCE",
      name: province.name,
      nameEnglish: null,
      parentLocationId: null,
      localGovernmentType: null,
      wardCount: null,
      wardNumber: null,
      postalCode: null,
    });
  }

  for (const city of CITY_SEED) {
    const id = cityLocationId(city.slug);
    batch.set(geographicLocationsCollection().doc(id), {
      id,
      level: "CITY",
      name: city.name,
      nameEnglish: null,
      parentLocationId: provinceLocationId(city.province),
      localGovernmentType: null,
      wardCount: null,
      wardNumber: null,
      postalCode: null,
    });
  }

  await batch.commit();
  console.log(`Seeded ${PROVINCE_SEED.length} provinces and ${CITY_SEED.length} cities.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
