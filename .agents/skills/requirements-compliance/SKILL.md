# Requirements Compliance Skill

## Purpose

Keep implementation continuously aligned with the authoritative Tuition Serve product documents and prevent the coding agent from inventing product behavior.

## Authority Order

When making product decisions, use this order:

1. `01_Tuition_Serve_Master_PRD.md`
2. `02_Tuition_Serve_Role_Permission_Matrix.md`
3. `03_Tuition_Serve_Complete_UX_Flows.md`
4. `04_Tuition_Serve_Wireframe_Specification.md`
5. `05_Tuition_Serve_Domain_Model_and_Database_Schema.md`
6. `06_Tuition_Serve_TRD.md`
7. `07_Tuition_Serve_Implementation_Plan.md`
8. Existing code, only when it does not conflict with the documents
9. Developer convenience or personal design preference

If two documents conflict, do not silently choose one. Identify the conflict and preserve the more authoritative requirement while recording the discrepancy for resolution.

## Core Rule

Do not invent business rules merely because a conventional SaaS pattern seems reasonable.

Examples of forbidden silent invention:

- Creating parent accounts when the PRD says parents use public forms only.
- Adding payment processing because the product mentions tutor fees.
- Allowing tutors to directly edit verified fields when advanced edit approval is required.
- Showing a parent's exact address to tutors.
- Adding a Staff role when only Super Admin and Branch Admin exist.
- Automatically reopening a tuition when the workflow requires admin handling.
- Allowing multiple simultaneous active assignments for one tuition.

## Requirement Traceability

For every material feature, be able to trace implementation to:

- Requirement ID
- Business rule
- UX flow
- Role permission
- Data model
- Acceptance criterion

When a feature cannot be traced, treat it as a candidate for review.

## Change Control

When requirements change:

1. Identify all impacted documents and code paths.
2. Update the relevant specification before implementing broad changes.
3. Check database, authorization, API, UX, notifications, and tests for impact.
4. Do not leave old behavior silently active.

## Implementation Behavior

Before coding a workflow:

1. Read the relevant product specification.
2. Identify actors and permissions.
3. Identify state transitions.
4. Identify stored data.
5. Identify side effects.
6. Identify failure and edge cases.
7. Identify notification events.
8. Implement only the required behavior.

## Acceptance Gate

A feature is not complete merely because its happy path works.

Verify:

- Unauthorized roles cannot perform it.
- Invalid states are rejected.
- Required reasons are enforced.
- Historical records are preserved where required.
- User-facing status matches backend status.
- Notifications are generated only when required.
- Relevant automated tests exist.
- The implementation does not introduce undocumented scope.

## Explicit Product Boundaries

Do not add V1 capabilities unless the product documents are later updated:

- Parent accounts
- Online payments or ecommerce checkout
- Parent-tutor direct web messaging
- Staff role
- Public tutor profiles
- Native mobile apps
- AI-generated geographic truth
- Automatic financial settlement
- Unapproved public exposure of private parent information

## Done Definition

A requirement is implementation-ready only when its intended behavior, permission boundary, data implications, and failure behavior are understood.
