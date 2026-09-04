# Nepal Location Dataset — Sources, Provenance, and Licensing

Canonical dataset for Tuition Serve's structured location system
(implementation plan M6), replacing the provisional ~20-city seed from M3
(`src/server/domain/location-seed-data.ts`, kept until this dataset is
validated in the running application — see status in the M6 report).

## 1. Sources used

### Primary: Government of Nepal, General Post Office — Postal Code of Nepal (2025)

- URL: https://gpo.gov.np/pages/postal-code-1259614658/
- Publisher: General Post Office (हुलाक सेवा विभाग), Government of Nepal —
  the same government body responsible for issuing postal codes.
- Fetched: 2026-09-04.
- Content: a single HTML table, 753 data rows (one per local government),
  grouped under province and district headers. Columns: S.N., Province
  (प्रदेश), District (जिल्ला), Local Level name (स्थानीय तहको नाम), Ward
  count (वडा संख्या), Post office (कार्यालय), Local-level code (कोड -
  स्थानीय तह), Local-level+ward code range (कोड - स्थानीय तह तथा वडा
  समेत).
- This is Nepal's **2025 postal code scheme**, introduced to replace the
  1991 scheme and align postal codes with the post-2015-constitution
  federal administrative structure (province/district/local
  government/ward), per the same GPO page.
- Raw snapshot: `raw/gpo-postal-code-table-2025.json` (table extracted to
  JSON; the original ~2MB HTML is not committed — it is almost entirely
  inline CSS/JS noise around one `<table>` element. Re-fetch procedure
  below.)
- License/usage: Nepal government public-sector information published on
  an official `.gov.np` site for public reference. No explicit license
  statement was found on the page; treated as public administrative
  reference data, used here as factual/administrative reference (names,
  codes, counts), not reproduced as a creative work.

### Cross-reference: `bibekoli/local-levels-of-nepal` (GitHub)

- URL: https://github.com/bibekoli/local-levels-of-nepal
- Fetched: 2026-09-04 (commit at time of fetch, `main` branch).
- Content: `provinces.json` (7), `districts.json` (77),
  `local_levels.json` (753), `local_level_type.json` (4) — each record
  has an English name alongside a Nepali name.
- Used **only** to attach English names to the GPO-sourced hierarchy
  (see §5 "Data normalization strategy" for exactly how, and its
  limitations). The GPO table itself has no English column.
- License: no license file/statement found in the repository. Used here
  narrowly as a cross-reference for English name spelling, not as the
  source of the authoritative hierarchy, codes, or counts (all of which
  come from the GPO table). If a licensing concern is later identified,
  the English-name layer can be dropped or resourced without touching
  the authoritative Nepali hierarchy.
- Independent cross-validation: this dataset's per-province local-level
  counts (137/136/119/85/109/79/88) sum to exactly 753 and independently
  match the GPO table's totals, and every sampled record (e.g.
  Janakpurdham, Sub-Metropolitan City, district Dhanusha) agrees with
  the GPO table — strong evidence both describe the same real,
  government-defined structure.

### Verification-only: OpenStreetMap (via Nominatim)

- Used to verify a single concrete product use case (see the M6 report)
  — whether "Devichowk, Janakpur" is a real, mappable locality, and
  whether it resolves to a specific ward. It does: Nominatim returns an
  OSM way tagged `city_district: Janakpur-09`, i.e. Ward 9 of
  Janakpurdham — which matches `ward-20315-09` in this dataset exactly.
- Not imported in bulk. No locality/tole-level catalog is included in
  this dataset (see §7 Limitations) — OSM/Nominatim is documented here
  as a validated *future* enrichment path, not a data source actually
  imported now.
- License if ever bulk-imported: ODbL 1.0 (OpenStreetMap Foundation),
  requires attribution and share-alike for produced/derived databases.

## 2. Coverage summary

| Level | Count | Source of truth |
| --- | --- | --- |
| Province | 7 | GPO (name), bibekoli (English name) |
| District | 77 | GPO (name), bibekoli (English name) |
| Local Government | 753 | GPO (name, type, ward count, code) — English name from bibekoli for 445/753 (59%), `null` for the rest |
| Ward | 6,743 | GPO (count per local government; postal code derived per §4) — no separate name (wards are numbered, not named, in the official structure) |
| Locality/Area (e.g. Devichowk) | 0 imported | No official source exists at this level (see §7) — remains a free-text field on the parent/tutor forms, as before M6 |
| Coordinates | 0 imported | No source used in this pass provided them (see §7) |

Total records imported: 7 + 77 + 753 + 6,743 = **7,580**.

## 3. Licensing/usage summary

- GPO table: Nepal government public administrative reference data,
  used as factual/administrative data (not a creative work) for a
  Nepal-focused product. No explicit license found; standard practice
  for government reference data of this kind.
- bibekoli/local-levels-of-nepal: no explicit license; used narrowly
  (English name cross-reference only, not the authoritative source of
  any hierarchy/code/count).
- OpenStreetMap/Nominatim: ODbL, used here only for a one-off
  verification query, not for imported data.
- Attribution is recorded in this file per source, satisfying the
  spirit of both sources even where no formal license text was found.

## 4. Postal codes

The GPO table's "local level + ward" code (e.g. `1010101` through
`1010107` for a 7-ward local government coded `10101`) is Nepal's
official 2025 postal code, per ward. This dataset derives each ward's
`postalCode` as `{localGovernmentCode}{wardNumber, 2 digits}` — this is
not a guess or approximation; it is exactly how the GPO table itself
expresses per-ward codes (as a range, e.g. "1010101 देखि 07"), expanded
into one explicit code per ward. All 6,743 derived codes are unique
(validated, see §6).

## 5. Data normalization strategy

- All Devanagari text is Unicode-normalized (NFC) and HTML-entity
  decoded before any comparison — the GPO and bibekoli sources encode
  visually-identical text differently (composed vs. decomposed matras),
  which silently breaks naive string equality if skipped.
- **Province matching**: GPO's province column omits the "प्रदेश"
  (Province) suffix that bibekoli includes; stripped before matching.
  100% matched (7/7).
- **District matching**: GPO and bibekoli disagree on spelling/naming
  for 9 of 77 districts — all verified by hand as the *same* real
  district under an alternate spelling or an administrative-split
  naming difference (e.g. GPO's "रुकुम (पूर्वी भाग)" = bibekoli's "रुकुम
  पूर्व", both "Rukum East" — Rukum and Nawalparasi are each split
  across two districts following the federal restructuring, and sources
  vary in whether they use the parenthetical or short form). An explicit
  9-entry correction map is used (see `DISTRICT_CORRECTIONS_RAW` in
  `build-dataset.py`) — this is disambiguating a known, verifiable
  naming variation, not inferring or fabricating data. 100% matched
  (77/77) after correction.
- **Local government matching (for English names only)**: matched by
  (Nepali base name with type suffix stripped, district). This matched
  445/753 (59%) cleanly. The remaining 308 do **not** get a fabricated
  or fuzzy-matched English name — `nameEnglish` is left `null`,
  explicitly, per the no-fabrication requirement. Root cause: the
  bibekoli dataset has genuine spelling drift from the official GPO
  spelling for a large fraction of local government names (e.g. GPO
  "फक्ताङ्लुङ्ग" vs. bibekoli "फाक्ताङलुङ" — different transliteration
  choices for the same place), and at least one outright data error was
  found in bibekoli (one record's `nepali_name` field contains the
  English text "Meringden" instead of Nepali). Attempting fuzzy
  string-distance matching to close this gap was considered and
  rejected: it would risk **wrong** cross-references (attaching one
  local government's English name to a different, similarly-spelled
  one), which is worse than a clean explicit gap. The **Nepali name from
  GPO is authoritative and 100% complete regardless** — English name is
  a display convenience, not the identity of the record.
- **Local government type** (Municipality/Rural Municipality/etc.) is
  derived directly from the GPO name's own suffix
  (गाउँपालिका/नगरपालिका/उपमहानगरपालिका/महानगरपालिका) — independent of
  the bibekoli cross-reference, so this field has 100% coverage.
- **Stable IDs**: `province-{slug}`, `district-{province-slug}-{english-slug}`,
  `lg-{govtCode}` (the GPO local-level code itself, globally unique),
  `ward-{govtCode}-{wardNumber, 2 digits}`. All deterministic and stable
  across re-imports.

## 6. Validation performed

Enforced in `build-dataset.py` (assertions fail the build) and re-checked
manually:

- Exactly 7 provinces, 77 districts, 753 local governments, 6,743 wards
  (matches independently-published totals from two sources).
- Sum of `wardCount` across all local governments == 6,743.
- No duplicate local-government codes; no duplicate ward postal codes
  (6,743 unique / 6,743 total).
- No orphaned wards (every ward's `parentLocationId` resolves to a real
  local government).
- Every province and district referenced by a district/local-government
  record resolves to a real parent record (no invalid parent-child
  references).
- Devichowk/Janakpur spot check: OSM ward tag (`Janakpur-09`) matches
  `ward-20315-09` under `lg-20315` (Janakpurdham Sub-Metropolitan City,
  Dhanusha district, Madhesh province) exactly.
- See `scripts/validate-locations.ts` for the automated Firestore-side
  checks (orphans, duplicates, parent-chain integrity) run after import.

## 7. Known limitations / remaining gaps

- **English names**: 308/753 (41%) local governments have no verified
  English name (`nameEnglish: null`); the UI must fall back to the
  Nepali `name` for these. Provinces and districts are 100% covered.
- **Locality/Area** (e.g. "Devichowk"): no official government catalog
  of these exists below ward level — confirmed by this research, not
  assumed. This dataset does not import any locality-level data. The
  application continues to use a free-text locality field scoped to a
  selected ward (as it did provisionally since M3), which is the
  correct approach given no authoritative enumerable source exists.
  OpenStreetMap was verified as a viable *future* enrichment/autocomplete
  source (see §1) but is not imported in this pass.
- **Coordinates**: not populated at any level. No coordinate source was
  imported in this pass (geoBoundaries has province/district/local-level
  polygons that could yield centroids, but extracting and validating
  those was out of scope for this pass — a legitimate follow-up, not a
  blocker for the structured-selection use case this milestone targets).
- **Postal code system transition**: the GPO page states 2025 codes
  replace a 1991 scheme; any external system or user still expecting
  old 5-digit district-based postal codes will see different values.
  This is a real-world transition, not a bug in this import.

## 8. Re-fetch / re-import procedure

1. Re-fetch `https://gpo.gov.np/pages/postal-code-1259614658/`, extract
   the `<table>` element, and re-run the parsing logic in
   `parse_gpo_table()` (`scripts/location-data/build-dataset.py`) to
   regenerate `raw/gpo-postal-code-table-2025.json`.
2. Re-fetch the 4 bibekoli JSON files from
   `https://raw.githubusercontent.com/bibekoli/local-levels-of-nepal/main/`.
3. Run `python3 scripts/location-data/build-dataset.py` from the repo
   root — regenerates `data/locations/processed/*.json`.
4. Run `pnpm import-locations` — idempotently upserts the processed
   dataset into Firestore (deterministic IDs; safe to re-run).
5. Run `pnpm validate-locations` — re-checks hierarchy integrity.
