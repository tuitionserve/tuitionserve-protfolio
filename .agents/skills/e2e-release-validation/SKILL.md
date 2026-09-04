# End-to-End Release Validation Skill

## Purpose

Validate the complete Tuition Serve product as a user would experience it across public website, tutor workflows, and administration workflows.

## Core E2E Journeys

### Parent Tuition Journey

1. Open public website.
2. Open tuition request form.
3. Enter parent information.
4. Enter student information.
5. Enter structured location.
6. Provide tuition requirements.
7. Submit.
8. Verify admin receives the request.
9. Confirm or reject request.
10. Verify status transition.

### Tutor Registration Journey

1. Open Become a Tutor.
2. Register using email/password or Google login.
3. Complete personal information.
4. Complete education information.
5. Complete teaching information.
6. Configure location.
7. Configure multiple availability slots.
8. Upload CV.
9. Submit.
10. Verify pending/review state.
11. Admin approves or rejects.
12. If rejected, verify mandatory reason.
13. Tutor corrects and resubmits.
14. If approved, verify verified state and one-time dashboard approval banner.

### Tuition Application Journey

1. Admin confirms tuition.
2. Eligible opportunity becomes visible to matching tutors.
3. Tutor searches and filters opportunities.
4. Tutor opens opportunity.
5. Tutor sees allowed area-level location, not exact private address.
6. Tutor applies.
7. CV and profile snapshot are attached to application.
8. Admin receives application.
9. Multiple tutors can apply.
10. Admin reviews and communicates with applicants.
11. Admin assigns one tutor.
12. Verify opportunity closes.
13. Verify unselected tutors can no longer apply.

### Withdrawal/Reopening Journey

1. Assigned tutor requests withdrawal.
2. Admin sees pending withdrawal.
3. Admin approves or handles withdrawal.
4. Previous assignment remains in history.
5. Tuition is reopened.
6. Eligible tutors can apply again.
7. New tutor is assigned.
8. Historical assignment chain remains intact.

### Suspension Journey

1. Admin suspends verified tutor.
2. Tutor account remains.
3. Tutor signs in.
4. Suspended screen appears.
5. Tutor cannot access protected operational functionality.
6. Admin reactivates.
7. Tutor can sign in and resume permitted activity.

## Release Criteria

Release only when:

- Critical E2E journeys pass.
- Role isolation passes.
- Location privacy passes.
- File security passes.
- State transitions are consistent.
- Notification events are correct.
- No critical or high-severity known defects remain.
- Production environment variables are configured.
- Database migrations run cleanly.
- Seed/reference data is valid.
- Error and empty states are usable.

## Regression

After changes to a shared domain component, rerun all workflows that depend on it.

Do not assume a local fix cannot break downstream assignment, notification, authorization, or reporting behavior.
