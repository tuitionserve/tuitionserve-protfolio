# Security Audit Skill

## Purpose

Protect Tuition Serve accounts, tutor data, parent information, CVs, messages, branch data, and administrative operations.

## Threat Model

Treat these as sensitive:

- Authentication credentials
- Tutor personal information
- Tutor CVs
- Tutor phone/email
- Parent contact information
- Student information
- Exact home addresses
- Branch data
- Admin functions
- Messages
- Session/token data

## Authorization

Never rely on UI hiding.

Every protected operation must enforce authorization on the server.

Check:

- Role
- Branch scope
- Resource ownership
- Lifecycle state

## Required Security Cases

### Tutor

A tutor must not:

- Access another tutor's private profile.
- Approve/reject any profile.
- Change locked profile fields directly.
- Access parent exact address.
- Access another tutor's applications.
- Apply while suspended.
- Access private admin-only data.

### Branch Admin

A Branch Admin must not access another branch's protected operational data unless the permission model explicitly permits it.

### Super Admin

Super Admin may manage platform-wide data according to the role matrix.

## IDOR Prevention

Never trust a resource ID from the client.

For every request:

1. Load resource.
2. Determine resource branch/owner.
3. Verify the caller's role and scope.
4. Only then return or mutate data.

## Privacy

Exact parent address must never be exposed in tutor-facing opportunity APIs merely because it is hidden in the frontend.

Return only the tutor-visible location representation required by the product.

## File Security

Tutor CVs must not be public assets.

Validate:

- file type
- file size
- storage path ownership
- authorized access
- download authorization

## Input Security

Validate and normalize all client-controlled values.

Do not trust:

- role fields
- branch IDs
- tutor IDs
- tuition IDs
- status values
- approval decisions
- file metadata

## Audit

Security-sensitive actions should produce audit records where required, including:

- tutor approval/rejection
- suspension/reactivation
- advanced profile approval/rejection
- tuition assignment
- withdrawal decisions
- branch/admin changes
