# Location Privacy Skill

## Purpose

Prevent disclosure of a parent's exact home address while still providing enough area information for tutors to evaluate a tuition opportunity.

## Privacy Model

Maintain two conceptual representations:

```text
Private exact location
+
Tutor-visible area location
```

The exact location may contain:

- street/address
- house information
- exact coordinates
- detailed directions

The tutor-visible location may contain:

- locality/area
- municipality/city
- district
- appropriate postal or geographic label if useful

## Required Rule

Before tutor selection, the tutor must not receive the parent's exact home address.

Example:

Allowed:

```text
Devichowk, Janakpur
```

Not allowed:

```text
Exact house/street/location details near the parent's home
Exact coordinates
Detailed private directions
```

## API-Level Enforcement

Do not merely hide exact location fields in React.

The server/API response for tutor opportunity views must omit private fields unless the workflow explicitly authorizes release.

## Search

Location search should use structured location identifiers rather than comparing raw private addresses.

A tutor can search/filter by broad or area-level location without receiving the underlying exact address.

## Assignment

After admin-controlled contact/location release, the system may provide the exact information that the business workflow authorizes.

The release event should be deliberate and auditable where the architecture supports audit records.

## Coordinates

If parent exact coordinates exist, never expose them to general tutor opportunity results.

If distance calculations are required, perform them server-side using protected data and return only the result or area information needed by the UI.

## Testing

Security testing must verify:

- direct API calls cannot retrieve exact parent addresses
- changing URL IDs does not reveal another parent's address
- list endpoints are sanitized
- search responses are sanitized
- application details are sanitized
- cached client data does not unintentionally expose private location
