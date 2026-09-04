# QA Adversarial Testing Skill

## Purpose

Actively try to break Tuition Serve workflows, especially state transitions, authorization boundaries, duplicate actions, privacy rules, and lifecycle edge cases.

## Testing Principle

Do not test only the expected happy path.

For every workflow, ask:

- What if the same action happens twice?
- What if the record changes between screen load and submit?
- What if the user loses connectivity?
- What if the user refreshes?
- What if two admins act at the same time?
- What if an invalid state is submitted directly to the API?
- What if the user changes a URL identifier manually?
- What if a suspended tutor tries an old form submission?
- What if an application is closed while a tutor submits it?

## Critical Adversarial Cases

### Tutor Approval

Test:

- Reject without a reason.
- Approve an already approved tutor.
- Reject an already approved tutor through an unauthorized route.
- Resubmit while another review is active.
- Reapply after approval.
- Modify locked fields through crafted requests.

### Advanced Profile Edit

Test:

- Change locked field directly through API.
- Submit multiple pending requests concurrently.
- Approve stale changes after the base profile has changed.
- Reject without a mandatory reason.
- Apply a pending change twice.
- Attempt to edit another tutor's profile.

### Tuition Opportunity

Test:

- Apply to a closed tuition.
- Apply after assignment.
- Apply while suspended.
- Apply twice.
- Apply immediately after reopening and then reopening again.
- Assign two tutors concurrently.
- Assign a tutor who no longer satisfies eligibility.
- Expose an exact parent address.

### Withdrawal

Test:

- Withdraw before selection.
- Withdraw after assignment.
- Attempt post-assignment withdrawal without required admin action.
- Admin approves an already approved withdrawal.
- Reopen an unrelated tuition.
- Preserve previous assignment history after reopening.

### Authorization

Test cross-role and cross-branch access:

- Super Admin to all data.
- Branch Admin to own branch.
- Branch Admin to another branch.
- Tutor to own data.
- Tutor to another tutor's data.
- Tutor to private parent address.
- Unauthenticated public access to private APIs.

### Notifications

Test:

- Duplicate notifications.
- Notification after failed transaction.
- Notification for unauthorized state transition.
- Read/unread consistency.
- Repeated delivery after retry.

## Data Integrity Attacks

Attempt:

- Duplicate identifiers.
- Duplicate applications.
- Orphaned applications.
- Multiple active assignments.
- Invalid foreign references.
- Impossible state transitions.
- Stale update overwrites.
- Deleting records that must remain for history.

## Test Output

Each discovered defect should include:

- Preconditions
- Exact reproduction
- Expected behavior
- Actual behavior
- Security/data impact
- Minimal fix recommendation
- Regression test requirement
