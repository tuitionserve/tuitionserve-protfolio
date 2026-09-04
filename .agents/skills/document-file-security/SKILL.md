# Document and File Security Skill

## Purpose

Secure tutor CVs and any other private uploaded documents.

## CV Requirements

CV is required for tutor registration/application according to the product specification.

When a tutor applies for tuition, the CV used by the application must be preserved as the application snapshot/version required by the data model.

## Storage

Private documents should use protected storage.

Do not expose permanent public URLs when the file is not public.

Use authorized access mechanisms such as signed/time-limited access where appropriate to the chosen storage architecture.

## Upload Validation

Validate:

- accepted file type
- MIME information
- maximum file size
- file name normalization
- upload completeness
- storage ownership

Do not trust a client-provided extension alone.

## File Names

Do not use user-provided filenames directly as trusted storage paths.

Generate safe server-controlled storage keys.

## Access Control

Tutor:

- can access own allowed CV

Authorized admin:

- can access CVs needed for review/application handling

Unauthorized tutor:

- cannot access another tutor's CV

Public:

- cannot access private CVs

## Replacement and Versioning

A tutor may replace their current CV where the product permits it.

Do not automatically rewrite an existing application snapshot.

Example:

```text
Current CV: v2
Application A used: v1
```

Application A must continue to reference the appropriate v1 snapshot.

## Download Security

Every private download should be authorization-checked.

Do not assume that a hidden download link provides security.

## Malware and Unsafe Content

Production implementation should use a reasonable file-security strategy for the selected infrastructure, including type validation and, where appropriate, malware scanning.

Do not silently skip security because the current requirement is "only CV."

## Cleanup

Unused temporary uploads should have a safe cleanup process.

Failed or abandoned uploads should not accumulate indefinitely.

## Audit

Material document replacement or deletion actions may require audit records based on the final TRD.
