# Domain Data Integrity Skill

## Purpose

Protect the logical consistency of Tuition Serve's core domain data.

## Immutable Identifiers

The following identifiers are application identities and should not change:

- Tutor UID
- Tuition UID
- Application identity
- Assignment identity
- Notification identity
- Conversation identity as applicable

## Key Invariants

Enforce these rules in server-side logic and, where practical, with database constraints.

### Tutor

- Tutor UID is unique.
- One auth identity maps to the intended tutor account.
- Suspension does not delete the account.
- Approved profile is not silently overwritten by pending advanced edits.

### Tuition

- Tuition UID is unique.
- A tuition belongs to the correct branch/organizational scope.
- Closed tuition cannot accept new applications.
- At most one active assignment exists.

### Application

- One tutor cannot have duplicate active applications for the same tuition.
- Application references a valid tutor and tuition.
- Historical application data remains available as required.
- Application snapshot is not retroactively changed by current profile edits.

### Assignment

- Assignment references a valid tutor and tuition.
- Active assignment transitions are controlled.
- Historical assignments remain traceable.
- Reopening creates a new active opportunity without deleting old assignment history.

### Profile Change

- Pending changes are separate from approved profile values.
- Only authorized admin decisions can commit approved changes.
- Rejected requests do not partially alter the approved profile.

## State Transitions

Do not allow arbitrary status updates.

Every status transition must have:

- current-state validation
- role authorization
- required input validation
- persistence
- required side effects
- notification behavior where specified

## Concurrency

Protect against:

- two admins assigning different tutors at once
- two duplicate tutor applications
- two approval decisions on the same review
- stale advanced-edit approvals
- duplicate withdrawals

Use transactions or equivalent concurrency controls where needed.

## History

Do not hard-delete business history merely to simplify UI.

Use explicit cancellation, rejection, withdrawal, suspension, archival, or reversal states where the product requires history.

## Snapshot Principle

Whenever the product says that an application must preserve the state at application time, store or version the relevant data.

Current profile data must not rewrite historical application review context.
