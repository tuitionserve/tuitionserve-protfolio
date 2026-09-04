# **Tuition Serve**

**Implementation Plan**

*Incremental engineering plan for V1*

| **Document** | **Value** |
| --- | --- |
| Version | 1.0 |
| Status | Implementation Baseline |
| Delivery approach | Vertical slices |
| Primary goal | Build product rules before polish |

## Purpose

This document turns the PRD, authorization model, UX flows, wireframes, domain model, and TRD into a practical build sequence.

# 1. Development Rule

A feature is not complete because its UI works.

A feature is complete when:

```text
UI
+
Validation
+
Authorization
+
Persistence
+
State transition
+
Error/empty/loading states
+
Notifications where required
+
Tests
```

# 2. Phase 0: Repository Foundation

Create:

- Next.js application.
- React/TypeScript setup.
- Tailwind.
- Linting/formatting.
- Environment configuration.
- CI.
- Test framework.
- Basic error handling.
- Logging baseline.

Acceptance:

- Local build succeeds.
- CI succeeds.
- Production build succeeds.

# 3. Phase 1: Authentication and Roles

Implement:

- Tutor email/password.
- Google login.
- UserAccount.
- Tutor account creation.
- Tutor UID.
- Super Admin provisioning.
- Branch Admin provisioning.
- Protected routes.
- Role resolution.
- Branch scope resolution.
- Suspended-account gate.

Acceptance:

- Tutor can authenticate.
- Admin cannot be publicly registered.
- Tutor UID is separate from provider UID.
- Suspended tutor cannot continue normal activity.

# 4. Phase 2: Tutor Profile Foundation

Implement:

- Personal data.
- Education.
- Subjects.
- Grades.
- Experience summary.
- Experience records.
- Preferred location.
- Availability.
- Expected monthly fee.
- Profile photo.
- CV upload.

Acceptance:

- Tutor can complete all required sections.
- Multiple availability slots work.
- CV is privately stored.
- Tutor UID is stable.

# 5. Phase 3: Tutor Verification

Implement:

- Submit for review.
- Admin review queue.
- Approval.
- Rejection with mandatory reason.
- Reapplication.
- Verification status.
- One-time approval banner.
- Notifications.
- Audit.

Acceptance:

- Rejection requires reason.
- Rejected tutor can resubmit.
- Approved tutor becomes verified.
- Approval banner is one-time.

# 6. Phase 4: Profile Editing

Implement:

- Direct experience editing.
- Profile photo update.
- Locked fields.
- Advanced Edit.
- Pending change request.
- Admin approval/rejection.
- Change reason.
- Notifications.
- Audit.

Acceptance:

- Controlled changes do not mutate approved profile before approval.
- Admin can reject with reason.
- Tutor sees resulting state.

# 7. Phase 5: Parent and Tuition Request

Implement:

- Parent form.
- Parent record reuse.
- Multiple students.
- Tuition request.
- Exact address.
- Structured location.
- Days/time slots.
- Tuition UID.
- Branch routing.

Acceptance:

- Parent does not need login.
- Multiple children work.
- Exact address is stored privately.
- Request reaches correct Branch Admin.

# 8. Phase 6: Location Data

Treat this as a dedicated engineering/data phase.

Tasks:

- Identify authoritative geographic sources.
- Identify postal-code data source.
- Verify licensing/usage.
- Normalize hierarchy.
- Normalize names.
- Add aliases.
- Generate stable internal IDs.
- Import canonical records.
- Build hierarchical selector.
- Build location search.
- Build public/tutor-visible formatter.
- Test common Nepal locality lookups.

Acceptance:

- Parent can find intended area.
- Tutor can search locality.
- Postal code is available where authoritative data supports it.
- Exact address remains separate.
- Dataset can be reimported/versioned.

# 9. Phase 7: Admin Tuition Operations

Implement:

- Request queue.
- Request detail.
- Confirm.
- Reject.
- Rejection reason.
- Open opportunity.
- Branch filtering.
- Audit.
- Notifications.

Acceptance:

- Confirm transitions request to open.
- Rejected request retains history.

# 10. Phase 8: Tutor Opportunities

Implement:

- Available Tuitions.
- Search.
- Subject filter.
- Grade filter.
- Location filter.
- Day/time filter.
- Detail page.

Acceptance:

- Only active approved tutors can apply.
- Preferred location does not hide every other opportunity.
- Exact address is not displayed.

# 11. Phase 9: Applications

Implement:

- Apply.
- Duplicate prevention.
- Snapshot.
- CV reference.
- My Applications.
- Withdraw before selection.
- Admin applicant list.

Acceptance:

- Many tutors can apply to one tuition.
- Duplicate active applications are blocked.
- Snapshot survives later profile changes.

# 12. Phase 10: Messaging

Implement:

- Conversation list.
- Conversation detail.
- Send message.
- Read state.
- Tuition context.
- Authorization.

Acceptance:

- Admin and tutor can communicate.
- Unauthorized conversation access is blocked.

# 13. Phase 11: Assignment

Implement:

- Applicant detail.
- Message action.
- Assign action.
- Confirmation modal.
- Assignment transaction.
- Opportunity closure.
- Selected/non-selected states.
- Notifications.
- Audit.

Acceptance:

- Exactly one active assignment per tuition.
- Opportunity closes immediately after assignment.
- Concurrent assignment attempts cannot create two active assignments.

# 14. Phase 12: Withdrawal and Reopen

Implement:

- Pre-selection withdrawal.
- Post-assignment withdrawal request.
- Admin withdrawal review.
- Admin release.
- Reopen.
- Assignment history.
- Notifications.

Acceptance:

- Post-assignment withdrawal requires admin approval.
- Reopen makes tuition available again without deleting history.

# 15. Phase 13: Notifications

Implement durable in-app notifications.

Event coverage:

- Tutor approval.
- Tutor rejection.
- Profile change result.
- New tuition.
- New application.
- Assignment.
- Withdrawal request.
- Withdrawal decision.
- Reopen.
- Message.
- Suspension.
- Reactivation.

Then integrate one external provider after provider evaluation.

# 16. Phase 14: Dashboard Polish

Tutor dashboard:

- Identity.
- Status.
- Available count.
- Application count.
- Assignment summary.
- Notifications.

Admin dashboard:

- New requests.
- Tutor reviews.
- Open tuitions.
- Selection queues.
- Profile changes.
- Withdrawal requests.

Do not add excessive analytics unless required.

# 17. Phase 15: Security and Audit Hardening

Verify:

- Server-side role checks.
- Branch checks.
- Exact-address protection.
- Private document access.
- Input validation.
- Rate limiting.
- Security headers.
- Audit logs.
- Session configuration.
- Secret handling.

# 18. Phase 16: Responsive Pass

Test:

- Parent mobile form.
- Tutor mobile dashboard.
- Tutor mobile opportunity search.
- Tutor mobile application.
- Tutor mobile messages.
- Desktop admin tables.
- Mobile fallback admin screens.

# 19. Phase 17: QA

Critical journey:

```text
Parent request
→ Admin confirm
→ Tutor opportunity
→ Tutor A apply
→ Tutor B apply
→ Admin review
→ Admin message
→ Assign Tutor A
→ Opportunity closes
→ Tutor A withdraw request
→ Admin approves
→ Reopen
→ Tutor B apply
→ Assign Tutor B
```

Also test:

- Rejected tutor.
- Reapplication.
- Advanced edit.
- Suspension.
- Reactivation.
- One-time approval banner.
- Exact address privacy.
- Branch authorization.
- Duplicate application race.
- Assignment race.

# 20. Phase 18: Production Readiness

Before launch verify:

- Production database.
- Migrations.
- Backups.
- Authentication.
- Google OAuth.
- Private storage.
- Notification provider.
- Domain/HTTPS.
- Error monitoring.
- Logs.
- Admin provisioning.
- Branch setup.
- Location dataset.
- Seed data removed.

# 21. Definition of Done

A workflow is production-ready when:

- Product rule is represented explicitly.
- UI is complete.
- Server validation exists.
- Authorization exists.
- Database constraints exist.
- Error/loading/empty states exist.
- Notifications work.
- Audit exists where required.
- Tests pass.
- Mobile behavior is acceptable.
- No known privacy leak exists.

# 22. AI Coding Agent Rules

The implementation AI must not:

1. Add parent accounts.
2. Add online payments.
3. Add a Staff role.
4. Create a public tutor directory.
5. Expose exact parent addresses to tutors.
6. Let tutors modify locked fields directly.
7. Use auth-provider UID as public Tutor UID.
8. Automatically assign tutors without admin action.
9. Allow applications after opportunity closure.
10. Allow suspended tutors to apply.
11. Delete historical applications when tutor status changes.
12. Replace approved profile data with pending advanced changes.
13. Use client-side authorization as the only protection.
14. Treat an AI-generated location dataset as authoritative.
15. Create a second active assignment for one tuition.
16. Repeatedly show the one-time approval banner.
17. Introduce payment tracking that the PRD does not require.

# 23. Milestone Sequence

```text
M1 Foundation
M2 Authentication + Roles
M3 Tutor Onboarding
M4 Verification
M5 Parent Requests
M6 Location
M7 Opportunities
M8 Applications
M9 Messaging
M10 Assignment
M11 Withdrawal/Reopen
M12 Notifications
M13 Security/QA
M14 Production
```
