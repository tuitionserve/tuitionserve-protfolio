# Tutor Lifecycle Skill

## Purpose

Enforce the exact tutor account, profile, verification, suspension, reapplication, and profile-change lifecycle.

## Canonical Concepts

A tutor has:

- Authentication identity
- Immutable in-app Tutor UID
- Profile
- Experiences
- CV/document records
- Verification status
- Application history
- Profile change requests
- Suspension state

The Firebase/auth provider UID is internal authentication identity. It is not the public Tutor UID.

## Tutor UID

Generate a unique immutable application-level Tutor UID.

Example format:

```text
TS-T-000127
```

The exact generated value format is implementation-defined unless specified elsewhere, but it must be:

- unique
- immutable
- safe to display
- independent of auth provider UID

Do not expose raw provider UIDs as the product's recognition identifier.

## Profile Lifecycle

Preferred lifecycle:

```text
ACCOUNT_CREATED
→ PROFILE_INCOMPLETE
→ SUBMITTED
→ UNDER_REVIEW
→ APPROVED
```

Alternative path:

```text
UNDER_REVIEW
→ REJECTED
→ EDIT
→ RESUBMITTED
→ UNDER_REVIEW
```

A verified tutor may later become:

```text
APPROVED/VERIFIED
→ SUSPENDED
→ REACTIVATED
```

## Approval/Rejection

Approval and rejection are mutually exclusive decisions for a review event.

Rejection requires a mandatory reason.

Do not allow "Reject" without persisted reason.

## Post-Approval Editing

Immediately editable:

- Experience
- Profile photo

Other verified profile fields require an advanced edit request.

Do not write pending advanced edits directly into the approved profile.

Use:

```text
Approved profile
+
Pending change request
```

Only approved changes modify the official profile.

## Advanced Edit

A change request must capture:

- tutor
- requested fields
- previous values
- proposed values
- submission time
- status
- reviewer
- decision time
- rejection reason when rejected

## Suspension

Suspension must not delete the tutor.

When suspended:

- account remains stored
- historical applications remain
- assignments remain historically traceable
- tutor cannot access prohibited operational functions
- tutor sees an explicit suspended-account message

Reactivation returns the tutor to an allowed active state without recreating the account.

## Verification Revocation

Revoking verification must be a deliberate admin action.

Do not equate revocation with deletion.

## One-Time Approval Banner

A newly approved tutor may receive a dashboard approval banner.

Persist a "seen" state.

Once seen, the banner must not reappear on later dashboard visits.

The implementation must not derive this solely from `status == APPROVED`.

## Experience

Experience is a separately editable area.

Preserve experience history where the data model requires it. Do not overwrite application snapshots when the tutor changes current experience.

## CV

The tutor's current CV is used for future applications.

An application must snapshot/reference the CV version used at application time according to the approved data model.
