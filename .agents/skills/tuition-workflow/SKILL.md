# Tuition Workflow Skill

## Purpose

Enforce the parent request, admin confirmation, tutor opportunity, application, selection, assignment, withdrawal, reopening, and completion lifecycle.

## Core Business Model

Tuition Serve is an intermediary.

Parents submit requirements.

Admins validate and confirm requests.

Confirmed requests become tuition opportunities.

Matching tutors can discover and apply.

Admins select and assign the tutor.

No in-app ecommerce or payment processing is part of this workflow.

## Tuition Lifecycle

A suitable conceptual lifecycle is:

```text
PARENT_SUBMITTED
→ ADMIN_REVIEW
→ CONFIRMED
→ OPEN
→ ASSIGNED
→ ONGOING
→ COMPLETED
```

Alternative paths include:

```text
ADMIN_REVIEW
→ REJECTED
```

and:

```text
ASSIGNED/ONGOING
→ WITHDRAWAL_REQUESTED
→ ADMIN_DECISION
→ REOPENED
→ OPEN
```

Exact status names must match the Domain Model/TRD once finalized.

## Parent Submission

Parents do not create accounts.

A parent request must be recorded as a durable internal record.

A parent may have multiple children and multiple tuition requests.

## Admin Confirmation

A parent request does not become visible to tutors merely because it was submitted.

Admin must confirm it first.

Rejected requests are not tutor opportunities.

## Opportunity Visibility

A confirmed open tuition can be discoverable by tutors who satisfy the product's matching criteria:

- subject compatibility
- grade compatibility
- reasonable availability compatibility
- other explicit eligibility rules

Location is a search/filter dimension and should not create an unnecessarily rigid tutor-only locality boundary.

## Multiple Applications

Many tutors may apply to one open tuition.

Example:

```text
Tuition TS-TU-00482
├── Tutor TS-T-001
├── Tutor TS-T-009
├── Tutor TS-T-014
└── Tutor TS-T-027
```

The admin reviews the applicant pool.

## Application

An application should capture a profile/CV snapshot at application time.

The application must retain enough data to understand what the admin reviewed, even if the tutor later changes their current profile or CV.

A tutor must not apply twice to the same active opportunity.

## Selection and Assignment

Admin selects one tutor.

The assignment must be transactionally protected so two admins cannot create two simultaneous active assignments.

After assignment:

- opportunity closes
- new applications are blocked
- existing application history remains
- selected tutor gets the appropriate status/notification
- the exact parent contact data remains admin-controlled

## Admin Communication

Admin and tutor may communicate through the web messaging system.

Messaging is not a substitute for assignment state.

An assignment must still be persisted as a structured business relationship.

## Withdrawal Before Selection

Tutor may withdraw an application before selection.

This should remove their active candidacy without deleting application history.

## Withdrawal After Assignment

Tutor may request withdrawal after selection/assignment.

Post-assignment withdrawal requires admin handling/approval.

Admin panel must have an explicit withdrawal workflow.

Do not automatically erase the assignment.

## Reopening

When an assignment ends through approved withdrawal:

- preserve the old assignment history
- preserve the old application
- reopen the tuition when the admin chooses to do so
- allow eligible tutors to apply again
- allow a new assignment
- maintain the full assignment chain

## One Active Assignment Rule

At most one active tutor assignment may exist for a tuition at a time.

Historical assignments may be multiple.

## Closing Conditions

A tuition opportunity must stop accepting applications when:

- assigned
- cancelled
- otherwise closed by the authorized admin workflow

A closed tuition must not accept applications through a direct API request even if the UI page was previously open.
