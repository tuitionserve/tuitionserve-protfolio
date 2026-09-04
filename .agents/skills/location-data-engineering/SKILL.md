# Location Data Engineering Skill

## Purpose

Build an accurate, structured Nepal location subsystem suitable for tutor preferences, parent addresses, search/filtering, privacy-safe display, postal codes, and future distance logic.

## Core Principle

Do not treat location as a free-text string.

Use structured geographic entities and stable identifiers.

## Desired Hierarchy

The final hierarchy should support the country's real administrative/geographic structure, with exact levels selected during data research and technical design.

A conceptual hierarchy is:

```text
Country
→ Province
→ District
→ Local Government / Municipality
→ Ward
→ Locality / Area
→ Postal Code
→ Coordinates
```

Do not assume every level exists or is uniform for every record.

## Source Quality

The authoritative location dataset must come from a reliable source or a clearly validated composite dataset.

Do not fabricate:

- locality names
- postal codes
- ward mappings
- coordinates
- administrative relationships

AI may assist with transformation, normalization, duplicate detection, validation scripts, and data tooling, but AI output is not authoritative geographic truth.

## Tutor Location

Tutor registration should support:

- structured area/locality selection
- address information
- geographic identifiers
- optional coordinates where appropriate

The tutor's preferred location should be searchable and filterable.

## Parent Location

Parent submits:

- structured geographic location
- exact address required for home tuition

The exact address is private.

## Search and Filter

Tutors should not be hard-limited to one locality merely because it is their preferred location.

The Available Tuitions experience should support:

- broad browsing
- search
- location filters
- other eligibility filters

Example:

```text
Tutor preference:
Devichowk, Janakpur

Available tuitions:
Janakpur-wide matching opportunities

Tutor can filter:
Devichowk
Other areas
```

## Postal Codes

Postal codes should be stored as structured location data where supported by the authoritative dataset.

Do not infer a postal code from a name alone.

## Coordinates

If coordinates are used:

- distinguish area centroid from exact address coordinates
- do not expose exact parent coordinates to tutors
- define precision and privacy rules
- do not pretend an approximate coordinate is an exact address

## Normalization

Normalize:

- spelling
- casing
- duplicate labels
- administrative identifiers
- multilingual/local naming where required by the data source

Keep canonical identifiers separate from display names.

## Data Validation

Before production:

- test parent form selections
- test tutor location selections
- test postal-code relationships
- test locality search
- test branch/location filtering
- detect orphaned geographic records
- detect duplicate geographic records

## Change Management

Location datasets can change.

Keep source/version metadata where practical so updates are traceable.

Do not silently rewrite historical application location snapshots if the product requires historical context.
