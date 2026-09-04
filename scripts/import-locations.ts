/**
 * Imports the canonical Nepal location dataset (data/locations/processed/)
 * into Firestore. Idempotent — deterministic document IDs, safe to
 * re-run. This is the ONLY supported way to load this data; the
 * documents are never meant to be hand-edited in the console or in
 * application code (implementation plan M6 requirement: re-importable,
 * versioned dataset).
 *
 * Does NOT touch the M3-era provisional "CITY"/legacy "PROVINCE" docs
 * written by scripts/seed-locations.ts — those are removed in a
 * separate, deliberate cleanup step once the application has been
 * validated against this dataset (see data/locations/SOURCES.md).
 *
 * Usage: pnpm import-locations
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { geographicLocationsCollection } from "../src/server/domain/collections";

const DATA_DIR = join(__dirname, "..", "data", "locations", "processed");

function loadJson<T>(file: string): T {
  return JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8")) as T;
}

interface ProvinceRow {
  id: string;
  name: string;
  nameEnglish: string;
  sourceCode: number;
}
interface DistrictRow {
  id: string;
  name: string;
  nameEnglish: string;
  parentLocationId: string;
  sourceCode: number;
}
interface LocalGovernmentRow {
  id: string;
  name: string;
  nameEnglish: string | null;
  localGovernmentType: string;
  parentLocationId: string;
  wardCount: number;
  sourceCode: string;
}
interface WardRow {
  id: string;
  wardNumber: number;
  parentLocationId: string;
  postalCode: string;
}

async function main() {
  const provinces = loadJson<ProvinceRow[]>("provinces.json");
  const districts = loadJson<DistrictRow[]>("districts.json");
  const localGovernments = loadJson<LocalGovernmentRow[]>("local-governments.json");
  const wards = loadJson<WardRow[]>("wards.json");

  const collection = geographicLocationsCollection();
  let written = 0;

  async function writeInBatches<T extends { id: string }>(rows: T[], toDoc: (row: T) => object) {
    const BATCH_SIZE = 400; // Firestore limit is 500 writes/batch.
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE);
      const batch = collection.firestore.batch();
      for (const row of chunk) {
        batch.set(collection.doc(row.id), toDoc(row));
      }
      await batch.commit();
      written += chunk.length;
      process.stdout.write(`\r${written} documents written...`);
    }
  }

  await writeInBatches(provinces, (p) => ({
    id: p.id,
    level: "PROVINCE",
    name: p.name,
    nameEnglish: p.nameEnglish,
    parentLocationId: null,
    localGovernmentType: null,
    wardCount: null,
    wardNumber: null,
    postalCode: null,
  }));

  await writeInBatches(districts, (d) => ({
    id: d.id,
    level: "DISTRICT",
    name: d.name,
    nameEnglish: d.nameEnglish,
    parentLocationId: d.parentLocationId,
    localGovernmentType: null,
    wardCount: null,
    wardNumber: null,
    postalCode: null,
  }));

  await writeInBatches(localGovernments, (l) => ({
    id: l.id,
    level: "LOCAL_GOVERNMENT",
    name: l.name,
    nameEnglish: l.nameEnglish,
    parentLocationId: l.parentLocationId,
    localGovernmentType: l.localGovernmentType,
    wardCount: l.wardCount,
    wardNumber: null,
    postalCode: null,
  }));

  await writeInBatches(wards, (w) => ({
    id: w.id,
    level: "WARD",
    name: `Ward ${w.wardNumber}`,
    nameEnglish: `Ward ${w.wardNumber}`,
    parentLocationId: w.parentLocationId,
    localGovernmentType: null,
    wardCount: null,
    wardNumber: w.wardNumber,
    postalCode: w.postalCode,
  }));

  console.log(
    `\nDone. Imported ${provinces.length} provinces, ${districts.length} districts, ` +
      `${localGovernments.length} local governments, ${wards.length} wards.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
