# **Tuition Serve**

**Master Product Requirements Document**

*Admin-Mediated Home Tuition Matching Web Application*

| **Document** | **Value** |
| --- | --- |
| Version | 1.0 |
| Status | Product Requirements Baseline |
| Primary users | Parents, Tutors, Super Admins, Branch Admins |
| Deployment direction | Web application |
| Primary device | Desktop/Laptop Web Browser |
| Secondary access | Responsive Mobile Web Browser |
| Initial tuition mode | Home tuition only |
| Payment model | Payments remain outside the application |

## Purpose

This document defines what Tuition Serve must accomplish, the users and workflows it must support, the business rules it must enforce, the data it must capture, and the acceptance criteria for V1.

It is intentionally a product requirements document rather than a technical implementation specification. Database schema, API contracts, code organization, infrastructure, authentication provider configuration, notification providers, storage configuration, and deployment mechanics belong in the TRD.

The client-supplied HTML is the public UI reference. It establishes the visual direction, public navigation, tuition request concept, Become a Tutor entry point, verification messaging, and the general process of submitting requirements, getting matched, and starting learning. fileciteturn0file0L121-L172 fileciteturn0file0L274-L313

# Document Structure

1. Product Vision
2. Business Context
3. Product Goals
4. Product Principles
5. Users and Roles
6. Product Scope and Non-Goals
7. Core Information Model
8. End-to-End Lifecycle
9. Public Website
10. Parent and Student Workflow
11. Tutor Registration
12. Tutor Verification
13. Tutor Profile Editing
14. Tutor Dashboard
15. Tuition Opportunities
16. Tutor Applications
17. Tutor Selection and Assignment
18. Withdrawal and Reopening
19. Messaging
20. Notifications
21. Location System
22. Search and Matching
23. UID and Identity
24. Documents and CVs
25. Branch Model
26. Status Model
27. Auditability
28. Authentication and Account Lifecycle
29. Security and Privacy
30. Error Handling
31. Responsive Experience
32. Accessibility
33. Performance and Reliability
34. Roadmap
35. Functional Requirements
36. Non-Functional Requirements
37. Acceptance Criteria
38. Open Product Decisions
39. Product North Star

# 1. Product Vision

Tuition Serve is an admin-mediated home tuition service. Parents submit tuition requirements, Tuition Serve validates those requirements, verified tutors discover appropriate tuition opportunities, multiple tutors may apply, and an administrator selects and assigns the tutor.

The product is not a self-service marketplace where parents browse tutors and hire them directly.

The core loop is:

```text
Parent submits requirement
        ↓
Branch Admin reviews
        ↓
Confirm or reject
        ↓
Confirmed request becomes open tuition
        ↓
Eligible verified tutors discover it
        ↓
Multiple tutors apply
        ↓
Admin reviews applicants
        ↓
Admin communicates with applicants when needed
        ↓
Admin selects and assigns tutor
        ↓
Opportunity closes
        ↓
Tuition begins
        ↓
If assignment ends or is withdrawn:
Admin can reopen the tuition
```

# 2. Business Context

Tuition Serve acts as the intermediary between parents and tutors.

Parents may have multiple children and may submit multiple tuition requests.

Tutors register and submit a profile and CV. Their profile becomes verified only after administrative approval.

The business currently handles its service fee and tutor payments outside the application. V1 must not introduce ecommerce, checkout, payment gateways, tutor payouts, or financial settlement.

The client UI already presents home tuition and a location-oriented request flow. The production system must transform those visual concepts into actual operational workflows. fileciteturn0file0L185-L220 fileciteturn0file0L384-L419

# 3. Product Goals

- Make parent tuition submission simple and account-free.
- Make tutor onboarding professional and controlled.
- Ensure only approved tutors can participate in tuition applications.
- Preserve verified tutor profile integrity.
- Make tuition opportunities easy for tutors to search and filter.
- Allow multiple tutors to apply to one tuition.
- Make administrator selection and assignment fast.
- Protect exact parent address information.
- Build a structured geographic system suitable for Nepal.
- Give each tutor a stable human-readable application UID.
- Make notifications a core product capability.
- Preserve application and assignment history.
- Support branch-based operations with Super Admin and Branch Admin roles.
- Allow suspension and reactivation without deleting tutor accounts.

# 4. Product Principles

| **Principle** | **Requirement** |
| --- | --- |
| Admin-mediated | Admin remains responsible for confirmation, publication, and assignment. |
| Minimal tutor UX | Tutor dashboard should remain simple. |
| Verified means protected | Approved profile fields require controlled changes. |
| Privacy by design | Private address and tutor-visible location are separate concepts. |
| Search over hard blocking | Preferred location guides discovery but does not hide every other area. |
| Historical integrity | Application-time information must remain understandable later. |
| Explicit state | Critical actions are state transitions, not arbitrary edits. |
| No payment scope creep | Money remains outside V1. |
| Actionable notifications | Important events create navigable notifications. |
| No fake precision | Location and matching logic must not pretend to know what the data cannot support. |

# 5. Users and Roles

## Parent

No account. Uses the public tuition request form.

## Tutor

Authenticated account using email/password and Google login.

## Branch Admin

The operational administrator for an assigned branch/city. There is no separate Staff role.

## Super Admin

Platform-wide administrator with authority across branches.

# 6. Product Scope and Non-Goals

## In Scope

- Public website.
- Parent tuition request.
- Multiple children per parent.
- Tutor registration.
- Email/password and Google login for tutors.
- Tutor CV upload.
- Tutor profile review.
- Approval/rejection with mandatory rejection reason.
- Reapplication.
- Tutor UID.
- Experience and profile photo direct editing after approval.
- Advanced edit approval flow.
- Suspension and reactivation.
- Open tuition opportunities.
- Tutor search and filtering.
- Multiple applications per tuition.
- Application snapshots.
- CV attachment to applications.
- Admin-tutor messaging.
- Tutor selection and assignment.
- Tutor withdrawal.
- Admin withdrawal.
- Tuition reopening.
- In-app notifications.
- Structured location data.
- Branch-aware authorization.
- Audit history.
- Responsive web.

## Explicitly Out of Scope

- Parent accounts.
- Parent dashboard.
- Public tutor directory.
- Direct parent-tutor messaging.
- Online payments.
- Payment gateway.
- Ecommerce.
- Tutor payout system.
- Public exposure of exact parent address.
- Separate Staff role.
- AI-only autonomous tutor assignment.
- AI-generated canonical Nepal location database.
- Native mobile apps.

# 7. Core Information Model

The product revolves around:

- User Account
- Branch
- Tutor
- Tutor Profile
- Tutor Experience
- Tutor Availability
- Tutor Subject/Grade capability
- Tutor Document
- Parent
- Student
- Tuition Request
- Tutor Application
- Tuition Assignment
- Profile Change Request
- Conversation
- Message
- Notification
- Geographic Location
- Private Address
- Audit Event

# 8. End-to-End Lifecycle

```text
NEW TUITION REQUEST
        ↓
UNDER REVIEW
        ├── REJECTED
        └── CONFIRMED
                 ↓
               OPEN
                 ↓
          MULTIPLE APPLICATIONS
                 ↓
             ASSIGNED
                 ↓
              ONGOING
                 ↓
             COMPLETED

Assigned tutor withdrawal:
ASSIGNED/ONGOING
       ↓
WITHDRAWAL REQUEST
       ↓
ADMIN APPROVES
       ↓
RELEASED
       ↓
REOPEN
       ↓
OPEN
```

The exact persistent representation of REOPENED may be an OPEN state plus historical assignment cycles rather than a permanent status.

# 9. Public Website

The provided UI includes Home, Find a Tutor, Become a Tutor, For Schools, Courses, About Us, Login, and Signup. fileciteturn0file0L123-L145

For V1:

- Find a Tutor means requesting a tutor, not browsing public tutor profiles.
- Become a Tutor leads to tutor onboarding.
- Login supports tutors and authorized administrators.
- Signup must not expose admin signup.
- Existing marketing sections may remain informational.

The public visual system should remain close to the supplied UI: Inter typography, light surfaces, emerald primary styling, rounded cards, restrained shadows, and professional education presentation. fileciteturn0file0L13-L110

# 10. Parent and Student Workflow

Parent submits:

- Parent name
- Phone
- Email where collected
- Student name
- Grade/class
- Subject
- Home tuition requirement
- Structured location
- Exact address
- Days
- One or more time slots
- Additional requirements where needed

A parent can have multiple children. A student can have multiple historical tuition requests.

The system stores the exact address privately.

The system also stores a structured geographic reference and a tutor-visible locality.

# 11. Tutor Registration

Tutor registration must capture:

### Personal

- Full name
- Email
- Phone
- Gender
- Date of birth
- Address
- Profile photo

### Education

- Highest qualification
- Institution
- Graduation year
- Major/subject

### Teaching

- Subjects
- Grades
- Teaching experience
- Preferred location
- Availability
- Minimum/expected monthly tuition fee

### Documents

- CV

Tutor location must use structured area/locality information plus address rather than one free-text location.

Availability must support multiple time slots.

# 12. Tutor Verification

Tutor submits profile → Admin reviews.

Admin must:

- Approve, or
- Reject with mandatory reason.

Rejected tutors can improve and resubmit.

Approved tutors become verified.

The approval event should generate an approval notification and a one-time dashboard banner.

# 13. Tutor Profile Editing

After approval:

### Direct edits

- Experience
- Profile photo

### Controlled edits

All other profile fields use Advanced Edit.

Advanced Edit:

```text
Tutor proposes changes
      ↓
Pending request
      ↓
Admin reviews
      ↓
Approve → Apply changes
Reject  → Store reason
```

The current approved profile must not change before approval.

Recommended V1 constraint: one active advanced profile change request per tutor.

# 14. Tutor Dashboard

The dashboard is intentionally minimal.

It should show:

- Tutor name
- Tutor UID
- Verification/account status
- Available tuition summary
- Application summary
- Assigned tuition summary
- Notifications
- Important action items

Profile editing does not belong on the dashboard.

Experience and Advanced Edit live inside Profile.

## One-Time Approval Banner

After approval, show a banner such as:

> Your tutor profile has been approved.

Persist a seen/acknowledged state.

After the event has been recorded, the banner must never repeatedly appear.

# 15. Tuition Opportunities

A confirmed tuition becomes an open opportunity.

Tutor-visible fields may include:

- Tuition UID
- Grade
- Subject
- Area/locality
- Days
- Time
- Home tuition
- Relevant requirements
- Fee information only if the business chooses to expose it

Exact parent address is excluded.

# 16. Tutor Applications

Multiple tutors may apply to one open tuition.

The system must prevent duplicate active applications by the same tutor to the same opportunity.

An application automatically references:

- Tutor UID
- Tutor name
- Relevant profile information
- Experience
- CV
- Application date/time

The application must preserve a snapshot so later profile changes do not rewrite the information that the admin originally evaluated.

# 17. Tutor Selection and Assignment

Admin reviews applicants.

Admin may:

- Open applicant profile.
- View CV.
- Message tutor.
- Assign tutor.

Assignment must be simple.

When assigned:

- Tuition becomes closed to further applications.
- Selected tutor is marked selected.
- Other applicants receive the appropriate non-selected state.
- Assignment history is stored.
- Tutor receives notification.

The assignment operation must be concurrency-safe.

# 18. Withdrawal and Reopening

## Before selection

Tutor may withdraw their application.

## After selection

Tutor may request withdrawal.

The request requires admin approval.

## Admin

Admin can initiate/approve withdrawal and release the assignment.

## Reopen

Admin can reopen the tuition.

Reopening:

- Preserves old assignment.
- Preserves old applications.
- Creates a new opportunity cycle.
- Allows new applications.

# 19. Messaging

V1 supports:

**Admin ↔ Tutor**

V1 does not support parent-tutor messaging.

Messaging requires:

- Conversation list
- Conversation detail
- Message text
- Timestamp
- Read/unread state
- Authorization
- Optional tuition context

The chat UI should remain simple and task-oriented.

# 20. Notifications

Notifications are a core capability.

Tutor events include:

- Profile approved/rejected.
- Advanced edit approved/rejected.
- New matching tuition.
- New message.
- Application state change.
- Selected for tuition.
- Withdrawal decision.
- Tuition reopened.
- Account suspended/reactivated.

Admin events include:

- New tuition request.
- New tutor application.
- Tutor resubmission.
- Advanced edit request.
- New tuition application.
- Withdrawal request.
- New tutor message.

In-app notification storage is the durable baseline. External delivery can be added through adapters.

# 21. Location System

Location is a first-class product subsystem.

The system should support a hierarchy such as:

```text
Country
→ Province
→ District
→ Local Government
→ Municipality/City
→ Ward
→ Locality/Area
→ Postal Code
→ Coordinates where reliable
```

Do not use an ad hoc Nepal JSON file as the sole authoritative source.

AI may assist with normalization or validation tooling, but the canonical dataset must be grounded in reliable geographic sources.

## Privacy model

```text
Private exact address
        ↓
Structured location
        ↓
Tutor-visible locality
```

Example:

```text
Private:
Exact house/street address

Tutor:
Devichowk, Janakpur
```

# 22. Search and Matching

Tutor opportunity discovery should support:

- Keyword search
- Subject
- Grade
- Location
- Day
- Time

Matching should prioritize:

1. Subject compatibility.
2. Grade compatibility.
3. Availability overlap.
4. Location relevance.

Tutor preferred location is not a hard wall.

A tutor based in Devichowk can still browse Janakpur-wide opportunities and then filter/search for Devichowk.

Admin remains the final selector.

# 23. UID and Identity

Each tutor receives a stable application UID.

Example:

`TS-T-000127`

This is separate from the authentication provider UID.

Tuition and applications should also have product UIDs.

Example:

- `TS-TU-00482`
- `TS-APP-00931`

# 24. Documents and CVs

CV is required.

CVs must be private.

A tutor application automatically references the CV available at application time.

Historical application records must preserve the relevant CV reference.

Profile photos and CVs should not be exposed through public static assets.

# 25. Branch Model

There are two administrative roles only:

```text
Super Admin
    ↓
All branches

Branch Admin
    ↓
Assigned branch/city
```

A Branch Admin is the branch's operational staff member.

There is no separate Staff role.

Branch scope must be enforced server-side.

# 26. Status Model

## Tutor

```text
DRAFT
SUBMITTED
UNDER_REVIEW
REJECTED
RESUBMITTED
APPROVED
SUSPENDED
```

## Tuition

```text
NEW
UNDER_REVIEW
REJECTED
CONFIRMED
OPEN
ASSIGNED
ONGOING
COMPLETED
CANCELLED
```

## Application

```text
APPLIED
WITHDRAWN
SELECTED
REJECTED
```

## Advanced profile change

```text
SUBMITTED
UNDER_REVIEW
APPROVED
REJECTED
CANCELLED
```

# 27. Auditability

Record material actions:

- Tutor approval/rejection.
- Profile change decisions.
- Suspension/reactivation.
- Tuition confirmation/rejection.
- Applications.
- Assignment.
- Withdrawal.
- Reopening.
- Administrative messages where audit policy requires.
- Branch administrative changes.

Never destroy historical application or assignment records merely because the current state changed.

# 28. Authentication and Account Lifecycle

Tutor authentication:

- Email/password.
- Google sign-in.

Admin accounts are not created through public signup.

The application maps provider identity to internal UserAccount and Tutor records.

A suspended tutor can authenticate only far enough to receive the suspension state and support message, then must be blocked from normal tutor operations.

# 29. Security and Privacy

Minimum requirements:

- Server-side authorization.
- Branch authorization.
- Protected tutor/admin routes.
- Private CV storage.
- Exact address protection.
- Input validation.
- Secure sessions/tokens.
- No unnecessary authentication UID exposure.
- Rate limiting where appropriate.
- Security headers.
- Audit logging.
- Least privilege.

# 30. Error Handling

The system must reject:

- Applications from suspended tutors.
- Applications from unapproved tutors.
- Duplicate applications.
- Applications to closed tuition.
- Unauthorized profile changes.
- Unauthorized branch access.
- Assignment to non-open tuition.
- Rejection without reason.
- Invalid location selection.
- Missing required CV.
- Conflicting profile change requests.

Errors should explain the problem and recovery action.

# 31. Responsive Experience

Desktop is the primary admin experience.

Mobile web is highly important for tutors.

Tutor workflows must be comfortable on mobile:

- Opportunity browsing.
- Filtering.
- Application.
- Notifications.
- Messaging.
- Profile.

# 32. Accessibility

Requirements:

- Readable contrast.
- Keyboard-accessible actions.
- Visible focus.
- Form labels.
- Validation tied to fields.
- Accessible notification semantics.
- Clear state badges.
- No critical icon-only controls without accessible names.
- Touch-friendly controls.

# 33. Performance and Reliability

Important workflows must feel responsive.

Use:

- Pagination.
- Indexed queries.
- Debounced search.
- Optimistic UI only where failure can be safely reconciled.
- Atomic state transitions.
- Duplicate submission protection.

Critical races such as two admins assigning the same tuition must be prevented by server/database logic.

# 34. Roadmap

## Phase 1
Authentication, roles, Tutor UID, tutor registration, verification, parent request, branches, location foundation.

## Phase 2
Tuition opportunities, applications, application snapshots, CV handling, assignment.

## Phase 3
Messaging, notifications, advanced edits, suspension/reactivation, withdrawal/reopen.

## Phase 4
Search refinement, geographic intelligence, analytics, future modules.

# 35. Functional Requirements

| **ID** | **Requirement** |
| --- | --- |
| AUTH-001 | Tutor shall authenticate using email/password. |
| AUTH-002 | Tutor shall be able to sign in with Google. |
| AUTH-003 | Public admin registration shall not exist. |
| AUTH-004 | Suspended tutors shall remain stored and may later be reactivated. |
| ID-001 | Every tutor shall have a unique application Tutor UID separate from auth UID. |
| PARENT-001 | Parent shall submit tuition without an account. |
| PARENT-002 | Parent shall support multiple children. |
| PARENT-003 | Home tuition request shall capture exact address. |
| TUTOR-001 | Tutor registration shall capture personal, education, teaching, location, availability, fee, and CV data. |
| VERIFY-001 | Tutor approval shall be required before participation. |
| VERIFY-002 | Tutor rejection shall require a reason. |
| VERIFY-003 | Rejected tutor shall be able to improve and resubmit. |
| PROFILE-001 | Experience and profile photo may be directly edited after approval. |
| PROFILE-002 | Other profile changes shall require advanced approval. |
| PROFILE-003 | Pending profile changes shall not alter approved values before approval. |
| TUITION-001 | Admin shall be able to review tuition requests. |
| TUITION-002 | Confirmed requests shall become open opportunities. |
| TUITION-003 | Multiple tutors shall be able to apply to one open tuition. |
| APP-001 | Duplicate active applications shall be prevented. |
| APP-002 | Application shall preserve relevant tutor snapshot data. |
| APP-003 | Application shall include CV reference automatically. |
| ASSIGN-001 | Admin shall be able to assign one tutor. |
| ASSIGN-002 | Assignment shall close the opportunity. |
| WITHDRAW-001 | Tutor shall be able to withdraw before selection. |
| WITHDRAW-002 | Post-assignment withdrawal shall require admin approval. |
| REOPEN-001 | Admin shall be able to reopen a tuition after release. |
| MESSAGE-001 | Tutor and admin shall be able to message each other. |
| NOTIFY-001 | Critical workflow events shall create in-app notifications. |
| LOCATION-001 | Location shall be structured and hierarchical. |
| LOCATION-002 | Exact parent address shall be protected from tutors. |
| LOCATION-003 | Tutor shall be able to search/filter by locality without being hard-limited to it. |
| BRANCH-001 | Branch Admin shall be branch-scoped. |
| BRANCH-002 | Super Admin shall have platform-wide authority. |
| AUDIT-001 | Material actions shall be auditable. |

# 36. Non-Functional Requirements

| **ID** | **Category** | **Requirement** |
| --- | --- | --- |
| NFR-001 | Security | All private operations require server-side authorization. |
| NFR-002 | Privacy | Exact parent address shall not leak through tutor APIs. |
| NFR-003 | Integrity | Critical transitions shall be atomic. |
| NFR-004 | Reliability | Duplicate submissions shall not create duplicate business records. |
| NFR-005 | Usability | Tutor workflows shall remain simple and mobile-friendly. |
| NFR-006 | Maintainability | Domain modules should be independently testable. |
| NFR-007 | Historical Stability | Application snapshots shall not change retroactively. |
| NFR-008 | Performance | Common search and list operations shall be paginated and indexed. |
| NFR-009 | Observability | High-impact failures must be diagnosable. |

# 37. Acceptance Criteria

| **Area** | **Acceptance Criterion** |
| --- | --- |
| Parent | Parent submits home tuition without account. |
| Location privacy | Tutor receives area-level location, not exact address. |
| Tutor onboarding | Tutor can register, upload CV, and submit. |
| Verification | Admin approval is required. |
| Rejection | Rejection requires reason. |
| Reapplication | Rejected tutor can resubmit. |
| Profile | Locked profile fields cannot be changed directly. |
| Advanced edit | Proposed changes are pending until admin approval. |
| UID | Tutor UID remains stable and separate from auth UID. |
| Opportunity | Confirmed tuition becomes visible to eligible tutors. |
| Applications | Multiple tutors can apply. |
| Snapshot | Application remains historically understandable after later profile edits. |
| Assignment | Admin can assign one tutor and opportunity closes. |
| Withdrawal | Post-assignment withdrawal requires admin approval. |
| Reopen | Admin can reopen without deleting history. |
| Suspension | Suspended tutor cannot continue normal operations. |
| Notifications | Important state changes generate in-app notifications. |
| Branch | Branch Admin cannot access another branch's restricted data. |
| Dashboard | Tutor dashboard remains minimal. |
| Banner | Approval banner does not repeat after its one-time event. |

# 38. Open Product Decisions

| **Decision** | **Current Position** |
| --- | --- |
| Exact final parent field labels | To be finalized in wireframes. |
| Exact final tutor validation rules | To be finalized in TRD. |
| External notification provider | Evaluate during TRD. |
| Canonical Nepal location source | Must be verified before production. |
| Postal-code completeness | Must follow authoritative source availability. |
| Cross-branch tutor participation | Architecture should support it; policy must be explicitly configured. |
| Exact contact release moment | Admin-controlled; precise event must be encoded before production. |
| CV replacement/version policy | Historical application reference must remain stable. |
| Tuition completion trigger | Must be explicitly defined before status is finalized. |

# 39. Product North Star

**"Make it simple for parents to request tuition, simple for tutors to find suitable opportunities, and simple for admins to confidently make the right match while protecting privacy and preserving history."**
