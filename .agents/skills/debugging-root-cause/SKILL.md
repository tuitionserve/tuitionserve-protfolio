# Debugging Root Cause Skill

## Purpose

Resolve Tuition Serve defects by identifying the actual root cause instead of patching symptoms.

## Debugging Discipline

When a defect appears:

1. Reproduce it reliably.
2. Identify the exact user action and state.
3. Determine whether the failure is frontend, API, authorization, data, storage, notification, or infrastructure.
4. Inspect the persisted state.
5. Identify the first incorrect transition.
6. Fix the root cause.
7. Add a regression test.
8. Re-run related workflows.

## State-Machine Debugging

For lifecycle bugs, reconstruct:

```text
Previous state
→ requested action
→ permission check
→ validation
→ persistence
→ side effects
→ resulting state
→ notifications
```

Do not fix only the UI label when the underlying transition is wrong.

## Concurrency

Assume admins and tutors can act concurrently.

Investigate:

- stale forms
- duplicate submissions
- double assignment
- conflicting profile approvals
- notification duplication
- reopened opportunities receiving late applications

Use database constraints and transactional logic where appropriate.

## Data Bugs

Never repair a corrupted record by silently rewriting history.

Determine:

- How the invalid state was created.
- Whether other records were affected.
- Whether an audit or correction record is required.
- Whether a migration is necessary.

## Avoid Patch Stacking

Do not accumulate special cases such as:

```text
if status == X and user == Y and source == Z
```

without understanding why the state became invalid.

Prefer centralized domain rules and reusable validation.
