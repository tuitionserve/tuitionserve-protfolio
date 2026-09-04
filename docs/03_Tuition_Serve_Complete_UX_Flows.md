# **Tuition Serve**

**Complete UX Flow Specification**

*Screen-to-screen behavior and state handling*

| **Document** | **Value** |
| --- | --- |
| Version | 1.0 |
| Status | UX Flow Baseline |
| Primary users | Parent, Tutor, Branch Admin, Super Admin |

## Purpose

This document defines how users move through the application. It should be read with the Wireframe Specification and PRD.

# 1. Public Entry

```text
Home
 ├── Request a Tutor
 └── Become a Tutor

Login
 ├── Tutor
 └── Admin
```

The supplied UI already has "Request a Tutor" and "Become a Tutor" entry points. fileciteturn0file0L156-L164

# 2. Parent Tuition Flow

```text
Home
 ↓
Request a Tutor
 ↓
Parent information
 ↓
Student information
 ↓
Tuition requirements
 ↓
Location
 ↓
Availability
 ↓
Review
 ↓
Submit
 ↓
Success
```

Success should say that the requirement has been received and will be reviewed.

No parent account is created.

# 3. Parent Form UX

The form may be a single page or staged form.

Required conceptual groups:

1. Parent.
2. Student.
3. Tuition.
4. Location.
5. Availability.
6. Additional notes.
7. Review.

Location should use structured selectors where data exists.

Exact address must be stored privately.

# 4. Tutor Registration

```text
Become a Tutor
 ↓
Sign in / Create account
 ↓
Personal
 ↓
Education
 ↓
Teaching
 ↓
Location
 ↓
Availability
 ↓
CV
 ↓
Review
 ↓
Submit for Review
```

Progress should be visible.

# 5. Tutor Review States

## Submitted

Banner:

> Your profile has been submitted for review.

## Rejected

Display:

> Changes required

Then display mandatory admin reason.

CTA:

**Improve Profile**

## Approved

Display one-time approval banner:

> Your tutor profile has been approved.

Once the one-time display event is recorded, do not show the banner again.

# 6. Tutor Profile

```text
Profile
├── Personal
├── Education
├── Teaching
├── Availability
├── Experience
├── Location
├── CV
└── Advanced Edit
```

Approved locked fields should visually show a lock and explanation.

# 7. Advanced Edit

```text
Profile
 ↓
Advanced Edit
 ↓
Proposed changes
 ↓
Review changes
 ↓
Submit
 ↓
Pending
```

Admin:

```text
Pending change
 ↓
Review
 ├── Approve
 └── Reject + reason
```

Current approved values remain active until approval.

# 8. Tutor Dashboard

The tutor dashboard should be intentionally small.

Top area:

```text
Tutor Name
Tutor UID
✓ Verified / account status
```

Main area:

```text
Available Tuitions
My Applications
Assigned Tuition
Notifications
```

Do not put full profile editing on the dashboard.

# 9. Available Tuitions

```text
Available Tuitions
[ Search ]

[Subject] [Grade] [Location] [Day] [Time]

Tuition card
Tuition card
Tuition card
```

Opportunity card should show:

- Tuition UID.
- Grade.
- Subject.
- Tutor-visible locality.
- Days.
- Time.
- Home tuition.
- Safe requirement summary.

Do not show exact home address.

# 10. Location Filter UX

A tutor in Devichowk, Janakpur can:

```text
Location
Janakpur
  └── Devichowk
```

The tutor can choose Devichowk for filtering, but can also clear the filter and browse all Janakpur opportunities.

Preferred location is not an absolute visibility rule.

# 11. Opportunity Detail

```text
Grade 8 Mathematics
TS-TU-00482

Location:
Devichowk, Janakpur

Days:
Sun-Fri

Time:
5 PM - 7 PM

Mode:
Home Tuition

Requirements:
...

[Apply]
```

# 12. Apply Flow

```text
Opportunity
 ↓
Apply
 ↓
Review application summary
 ↓
Confirm
 ↓
Submitted
```

The application silently attaches the current CV reference and required snapshot data.

Do not force the tutor to re-upload the CV for every application.

# 13. My Applications

Display:

- Tuition UID.
- Subject.
- Grade.
- Area.
- Application date.
- Status.

Before selection:

**Withdraw Application**

After selection:

**View Assignment / Request Withdrawal**

# 14. Admin Dashboard

The admin dashboard should be queue-centric.

Top:

```text
Branch
New Requests
Pending Tutor Reviews
Open Tuitions
Applications Awaiting Selection
Profile Changes
Withdrawal Requests
```

The goal is to answer:

> What needs my attention now?

# 15. Admin Tuition Request

```text
Tuition Request
 ├── Parent
 ├── Student
 ├── Exact address
 ├── Structured location
 ├── Subject
 ├── Grade
 ├── Availability
 └── Notes

[Reject] [Confirm]
```

Reject requires reason.

Confirm moves the request into opportunity flow.

# 16. Admin Opportunity

```text
Tuition TS-TU-00482
Status: OPEN

Requirements
Applications: 11

Applicants
 ├── Tutor A [View] [Message] [Assign]
 ├── Tutor B [View] [Message] [Assign]
 └── ...
```

The applicant screen must make assignment easy.

# 17. Applicant Review

Tutor detail:

```text
Tutor UID
Verification
Subjects
Grades
Experience
Availability
Preferred area
Expected fee
CV
```

Actions:

- Message.
- Assign.

# 18. Assignment

Confirmation modal:

```text
Assign TS-T-000127 to TS-TU-00482?

This closes the opportunity to new applications.

[Cancel] [Assign]
```

After success:

- Assignment active.
- Opportunity closed.
- Tutor selected.
- Others marked appropriately.
- Notifications sent.

# 19. Pre-Selection Withdrawal

```text
My Application
 ↓
Withdraw
 ↓
Confirm
 ↓
WITHDRAWN
```

# 20. Post-Assignment Withdrawal

```text
Assigned Tuition
 ↓
Request Withdrawal
 ↓
Reason
 ↓
Submit
 ↓
Pending Admin Review
```

Admin:

```text
Withdrawal Request
[Reject] [Approve]
```

Approved withdrawal releases assignment.

# 21. Reopen

Admin sees released assignment:

```text
Previous Assignment
Tutor A
Withdrawn

[Reopen Tuition]
```

Reopen confirmation:

> This will make the tuition available to new tutor applicants.

Existing history remains.

# 22. Suspension

Admin:

```text
Tutor
 ↓
Suspend
 ↓
Reason
 ↓
Confirm
```

Tutor login:

```text
ACCOUNT SUSPENDED

Your tutor account is currently suspended.
Please contact support.

[Contact Support]
```

# 23. Reactivation

Admin:

```text
Suspended Tutor
 ↓
Reactivate
 ↓
Confirm
```

Tutor receives notification and normal account state returns.

# 24. Messaging

```text
Messages
 ├── Tutor A
 ├── Tutor B
 └── ...
```

Conversation:

```text
Header: Tutor UID / Name

Admin message
Tutor message
Admin message

[Type message................] [Send]
```

No parent-tutor chat.

# 25. Notifications

Notification click should navigate to the associated entity.

Examples:

```text
New tuition opportunity
 → Opportunity detail

Profile approved
 → Profile

New application
 → Tuition applicant list

Withdrawal request
 → Withdrawal review
```

# 26. UX State Rules

Every important screen needs:

- Loading.
- Success.
- Error.
- Empty.
- Permission denied.
- Suspended/blocked.
- Closed/unavailable state.

Examples:

Closed opportunity:

> This tuition is no longer accepting applications.

No action button should remain active.

# 27. One-Time Banner

Persist the one-time approval banner state in backend data.

Do not rely on localStorage alone because the event must survive device changes.

# 28. UX Acceptance Criteria

- No parent login.
- No public tutor directory.
- Tutor dashboard remains minimal.
- Advanced profile editing is not on dashboard.
- Exact address is not shown to tutors.
- Assignment closes application intake immediately.
- Post-assignment withdrawal requires admin action.
- Reopen preserves history.
- Notifications deep-link to relevant work.
