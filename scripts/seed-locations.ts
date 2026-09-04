/**
 * Seeds the provisional province/city location data (see
 * src/server/domain/location-seed-data.ts) into Firestore. Idempotent —
 * uses deterministic document IDs so re-running just overwrites the same
 * records. Run once against each environment (emulator/staging/prod)
 * before onboarding tutors.
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
      parentLocationId: null,
    });
  }

  for (const city of CITY_SEED) {
    const id = cityLocationId(city.slug);
    batch.set(geographicLocationsCollection().doc(id), {
      id,
      level: "CITY",
      name: city.name,
      parentLocationId: provinceLocationId(city.province),
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
