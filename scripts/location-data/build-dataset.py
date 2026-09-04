#!/usr/bin/env python3
"""
Builds the canonical Nepal location dataset (Province -> District ->
Local Government -> Ward) from the raw source snapshots in
data/locations/raw/, and writes normalized JSON to
data/locations/processed/. See data/locations/SOURCES.md for full
provenance, licensing, and methodology notes.

This is a one-time/occasional maintenance script (re-run only when a
source is refreshed), not part of the Next.js app's runtime — Python is
used here because it was the tool used to originally develop and debug
this parse; the *import* into Firestore (scripts/import-locations.ts)
is TypeScript/Node, matching the app's runtime, and is what actually
needs to be re-run per environment.

Usage: python3 scripts/location-data/build-dataset.py
(Run from the repository root.)
"""
import re
import json
import html
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "data" / "locations" / "raw"
PROCESSED = ROOT / "data" / "locations" / "processed"

DEVANAGARI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")

TYPE_SUFFIXES = [
    ("उपमहानगरपालिका", "SUB_METROPOLITAN_CITY"),
    ("महानगरपालिका", "METROPOLITAN_CITY"),
    ("गाउँपालिका", "RURAL_MUNICIPALITY"),
    ("नगरपालिका", "MUNICIPALITY"),
]

# Known spelling/administrative-split variants between the GPO table and
# the cross-reference dataset's district names — verified by hand (see
# SOURCES.md "District name reconciliation"). These are the SAME real
# districts under alternate spellings, not different entities.
DISTRICT_CORRECTIONS_RAW = {
    "काठमाडौँ": "काठमाडौं",
    "नवलपरासी (बर्दघाट सुस्ता पूर्व)": "नवलपरासी पूर्व",
    "नवलपरासी (बर्दघाट सुस्ता पश्चिम)": "नवलपरासी पश्चिम",
    "स्याङजा": "स्याङ्जा",
    "प्यूठान": "प्युठान",
    "रुकुम (पश्चिम भाग)": "रुकुम पश्चिम",
    "रुकुम (पूर्वी भाग)": "रुकुम पूर्व",
    "डँडेलधुरा": "डडेलधुरा",
    "सिरहा": "सिराहा",
}

PROVINCE_SLUGS = {1: "koshi", 2: "madhesh", 3: "bagmati", 4: "gandaki", 5: "lumbini", 6: "karnali", 7: "sudurpashchim"}


def norm(s: str) -> str:
    """NFC-normalize + HTML-unescape. Devanagari text from different
    sources can be byte-different (NFC vs NFD encoding of matras) while
    rendering identically — comparing without this silently fails."""
    return unicodedata.normalize("NFC", html.unescape(s)).strip()


def slugify_en(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def parse_gpo_table(gpo_html_path: Path) -> list[dict]:
    gpo_html = gpo_html_path.read_text(encoding="utf-8", errors="ignore")
    idx = gpo_html.find("<table")
    end = gpo_html.find("</table>", idx)
    rows = re.findall(r"<tr>(.*?)</tr>", gpo_html[idx : end + 9], re.S)

    def cell_text(c: str) -> str:
        return norm(re.sub(r"<[^>]+>", "", c))

    def parse_row(r: str) -> list[str]:
        return [cell_text(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", r, re.S)]

    records = []
    cur_province = cur_district = None
    for i, r in enumerate(rows):
        cells = parse_row(r)
        if len(cells) < 8:
            continue
        sn, province, district, local_level, ward_count, office, ll_code, ward_code_range = cells[:8]
        if i == 0 and ("प्रदेश" in province or "जिल्ला" in district):
            continue
        if province:
            cur_province = province
        if district:
            cur_district = district
        if not local_level or not ll_code:
            continue  # province/district group-header row, not a local level
        wc = ward_count.translate(DEVANAGARI_DIGITS).strip()
        records.append(
            {
                "province_ne": cur_province,
                "district_ne": cur_district,
                "local_level_ne_full": local_level,
                "ward_count": int(wc),
                "ll_code": ll_code,
            }
        )
    return records


def strip_type(name: str) -> tuple[str, str | None]:
    for suf, code in TYPE_SUFFIXES:
        if name.endswith(suf):
            return name[: -len(suf)].strip(), code
    return name, None


def main():
    # The raw GPO snapshot is committed pre-parsed as JSON (produced by
    # parse_gpo_table() above against the live page's ~2MB HTML, which
    # is mostly inline-style noise not worth committing) — see
    # data/locations/SOURCES.md for the re-fetch procedure if the source
    # page is ever updated and needs re-parsing from scratch.
    records = json.loads((RAW / "gpo-postal-code-table-2025.json").read_text(encoding="utf-8"))

    provinces_raw = json.loads((RAW / "bibekoli-provinces.json").read_text(encoding="utf-8"))
    districts_raw = json.loads((RAW / "bibekoli-districts.json").read_text(encoding="utf-8"))
    local_levels_raw = json.loads((RAW / "bibekoli-local-levels.json").read_text(encoding="utf-8"))
    for lst in (provinces_raw, districts_raw, local_levels_raw):
        for it in lst:
            if "nepali_name" in it:
                it["nepali_name"] = norm(it["nepali_name"])

    district_corrections = {norm(k): norm(v) for k, v in DISTRICT_CORRECTIONS_RAW.items()}
    province_by_base = {norm(p["nepali_name"].replace("प्रदेश", "")): p for p in provinces_raw}
    district_id_by_ne = {d["nepali_name"]: d for d in districts_raw}
    ll_by_ne_district = {(ll["nepali_name"], ll["district_id"]): ll for ll in local_levels_raw}

    provinces_out = [
        {"id": f"province-{PROVINCE_SLUGS[p['province_id']]}", "name": p["nepali_name"], "nameEnglish": p["name"], "sourceCode": p["province_id"]}
        for p in provinces_raw
    ]

    districts_out = []
    district_key_to_id = {}
    for d in districts_raw:
        prov_slug = PROVINCE_SLUGS[d["province_id"]]
        did = f"district-{prov_slug}-{slugify_en(d['name'])}"
        district_key_to_id[d["district_id"]] = did
        districts_out.append(
            {"id": did, "name": d["nepali_name"], "nameEnglish": d["name"], "parentLocationId": f"province-{prov_slug}", "sourceCode": d["district_id"]}
        )

    local_govs_out, wards_out = [], []
    matched_en = 0
    seen_codes = set()
    for r in records:
        dist_ne = district_corrections.get(r["district_ne"], r["district_ne"])
        dist = district_id_by_ne[dist_ne]
        base, type_code = strip_type(r["local_level_ne_full"])
        ll_match = ll_by_ne_district.get((base, dist["district_id"]))
        name_en = None
        if ll_match:
            name_en = ll_match["name"]
            matched_en += 1
        lg_id = f"lg-{r['ll_code']}"
        assert r["ll_code"] not in seen_codes, f"duplicate ll_code {r['ll_code']}"
        seen_codes.add(r["ll_code"])
        local_govs_out.append(
            {
                "id": lg_id,
                "name": r["local_level_ne_full"],
                "nameEnglish": name_en,
                "localGovernmentType": type_code,
                "parentLocationId": district_key_to_id[dist["district_id"]],
                "wardCount": r["ward_count"],
                "sourceCode": r["ll_code"],
            }
        )
        for w in range(1, r["ward_count"] + 1):
            wards_out.append(
                {"id": f"ward-{r['ll_code']}-{w:02d}", "wardNumber": w, "parentLocationId": lg_id, "postalCode": f"{r['ll_code']}{w:02d}"}
            )

    assert len(provinces_out) == 7
    assert len(districts_out) == 77
    assert len(local_govs_out) == 753
    assert sum(l["wardCount"] for l in local_govs_out) == 6743
    assert len(wards_out) == 6743
    assert len({w["postalCode"] for w in wards_out}) == 6743, "postal codes must be unique"

    PROCESSED.mkdir(parents=True, exist_ok=True)
    (PROCESSED / "provinces.json").write_text(json.dumps(provinces_out, ensure_ascii=False, indent=2), encoding="utf-8")
    (PROCESSED / "districts.json").write_text(json.dumps(districts_out, ensure_ascii=False, indent=2), encoding="utf-8")
    (PROCESSED / "local-governments.json").write_text(json.dumps(local_govs_out, ensure_ascii=False, indent=2), encoding="utf-8")
    (PROCESSED / "wards.json").write_text(json.dumps(wards_out, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"provinces: {len(provinces_out)}")
    print(f"districts: {len(districts_out)}")
    print(f"local governments: {len(local_govs_out)} (English name matched: {matched_en}/{len(local_govs_out)})")
    print(f"wards: {len(wards_out)}")


if __name__ == "__main__":
    main()
