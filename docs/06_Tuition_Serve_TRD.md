# **Tuition Serve**

**Technical Requirements Document**

*Technical architecture, security, API, database, location, notifications, messaging, and deployment requirements*

| **Document** | **Value** |
| --- | --- |
| Version | 1.0 |
| Status | Technical Requirements Baseline |
| Frontend direction | Next.js + React + TypeScript |
| Styling direction | Tailwind CSS |
| Authentication direction | Firebase Authentication compatible |
| Database direction | PostgreSQL recommended |
| Storage | Private object storage |
| Deployment | Managed web deployment |
| Primary clients | Desktop Web + Responsive Mobile Web |

## Purpose

The PRD defines what Tuition Serve must do. This TRD defines technical constraints and recommended architecture for implementing it.

Where this document says "recommended", an equivalent implementation may be selected only if it preserves the required behavior and security guarantees.

# 1. Architecture

```text
Browser
  ↓
Next.js / React application
  ↓
Server/API layer
  ├── Authentication verification
  ├── Authorization
  ├── Validation
  ├── Domain services
  ├── Notification orchestration
  └── Messaging
  ↓
PostgreSQL
  ↓
Private Object Storage
```

Authentication provider:

```text
Browser
 ↓
Firebase Authentication
 ↓
Provider UID
 ↓
Internal UserAccount
 ↓
Tutor UID
```

# 2. Frontend

Recommended:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Schema validation library
- Typed API/data client

The supplied client HTML already uses Tailwind and Inter, making Tailwind and the existing typography direction natural implementation choices. fileciteturn0file0L7-L10

# 3. Backend

Keep domain operations on the trusted server.

Server responsibilities:

- Verify identity.
- Resolve role.
- Resolve branch scope.
- Validate input.
- Enforce state transitions.
- Enforce privacy.
- Access database.
- Access private storage.
- Create notifications.
- Write audit events.

Do not rely on React route guards as authorization.

# 4. Authentication

Tutor authentication must support:

- Email/password.
- Google login.

Admin authentication must use provisioned accounts and must not be exposed through public signup.

Firebase/provider UID is an authentication identifier only.

The application generates Tutor UID separately.

# 5. Authorization

Use layers:

```text
Authenticated?
    ↓
Role permitted?
    ↓
Branch permitted?
    ↓
Resource ownership?
    ↓
State permits action?
```

All layers must run on the server for private operations.

# 6. Branch Authorization

Branch Admin request:

```text
authenticated user
→ branch scope
→ requested record
→ compare record branch
→ allow/deny
```

Never trust `branchId` directly from the browser for authorization.

# 7. Database

PostgreSQL is recommended because the application has strong relational constraints:

- one parent to many students
- one tuition to many applications
- one tuition to multiple historical assignments
- tutor capabilities
- branch scope
- notifications
- messages
- audit records

# 8. API Architecture

REST or typed RPC are acceptable.

Conceptual endpoints:

```text
POST /api/public/tuition-requests

GET  /api/tutor/opportunities
GET  /api/tutor/opportunities/:id
POST /api/tutor/opportunities/:id/apply

GET  /api/tutor/applications
POST /api/tutor/applications/:id/withdraw
GET  /api/tutor/assignments

GET  /api/tutor/profile
POST /api/tutor/profile/advanced-change

GET  /api/admin/tuition-requests
POST /api/admin/tuition/:id/confirm
POST /api/admin/tuition/:id/reject
POST /api/admin/tuition/:id/assign
POST /api/admin/tuition/:id/reopen

POST /api/admin/tutors/:id/approve
POST /api/admin/tutors/:id/reject
POST /api/admin/tutors/:id/suspend
POST /api/admin/tutors/:id/reactivate

GET  /api/notifications
POST /api/messages
```

Exact route names may change; domain protections must not.

# 9. Validation

All input is validated on the server.

Important validations:

- Required fields.
- Phone/email.
- Dates.
- Availability ranges.
- Fees.
- Location IDs.
- File metadata.
- Message size.
- Status transitions.

Client validation is for usability, not security.

# 10. Critical Transactions

## Tutor approval

Atomically:

- Set approved status.
- Store reviewer.
- Store timestamp.
- Set one-time banner state.
- Create notification.
- Write audit event.

## Tuition confirmation

Atomically:

- Transition request.
- Mark opportunity open.
- Store admin.
- Write audit event.
- Notify where appropriate.

## Application

Atomically:

- Verify tutor approved and active.
- Verify tuition open.
- Verify no duplicate active application.
- Create snapshot.
- Attach CV reference.
- Create application.
- Create admin notification.

## Assignment

Atomically:

- Verify tuition open.
- Verify tutor eligible.
- Create assignment.
- Change tuition to assigned.
- Close applications.
- Mark selected applicant.
- Update other applicants.
- Create notification.
- Write audit event.

# 11. State Transition Enforcement

Do not permit generic arbitrary status updates on critical entities.

Bad:

```text
PATCH /tuition/123
{ "status": "ASSIGNED" }
```

Preferred:

```text
assignTutor(tuitionId, tutorId)
```

The domain command validates all conditions.

# 12. Concurrency

Important races:

- Two admins assign the same tuition.
- Tutor applies while tuition closes.
- Tutor sends multiple applications quickly.
- Two profile change requests are created.
- Admin approves and suspends concurrently.

Use transaction and database constraints.

# 13. Tutor UID Generation

Recommended:

`TS-T-000001`

Generation must be concurrency-safe.

Do not derive Tutor UID from database row IDs by string formatting unless that mechanism is intentionally secured and stable.

# 14. Location Architecture

Location must be treated as structured data.

Recommended hierarchy:

```text
Country
→ Province
→ District
→ Local Government
→ Municipality/City
→ Ward
→ Locality
→ Postal Code
→ Coordinates
```

Canonical locations need stable internal IDs.

Search should support:

- Exact normalized name.
- Prefix.
- Alias.
- Parent hierarchy.
- Postal code where reliable.

# 15. Location Data Acquisition

Do not ask an LLM to invent the production Nepal geographic dataset.

Use reliable external geographic sources and verify:

- hierarchy
- locality completeness
- spelling
- postal codes
- identifiers
- licensing/usage terms

AI can assist with normalization scripts, alias generation, deduplication proposals, and validation reports.

The final canonical dataset must be evidence-based.

# 16. Location Privacy API

Create distinct response contracts:

```text
AdminTuitionDetails
TutorTuitionDetails
```

`TutorTuitionDetails` must not contain exact private address fields.

The backend must remove restricted fields before serialization.

# 17. Distance and Relevance

If coordinates are available from a reliable source, the system may calculate geographic relevance.

However, V1 should not require exact route distance to function.

Tutor preferred location should be a relevance signal and filter, not a hard eligibility wall.

# 18. Document Storage

Store CVs in private object storage.

Use server-authorized access.

Potential model:

```text
Authorized request
 ↓
Server authorization
 ↓
Short-lived signed URL
 ↓
Private object
```

Validate:

- file type
- MIME type
- size
- filename
- upload authorization

# 19. Application CV Snapshot

When applying, store the exact document reference/version used at application time.

A later CV upload must not alter the old application.

# 20. Messaging

Conversation model:

```text
Conversation
 ├── admin
 ├── tutor
 ├── branch
 ├── optional tuition
 └── messages
```

Use participant authorization.

The server must reject access by users who are not participants or authorized administrators.

# 21. Notifications

Recommended architecture:

```text
Domain event
 ↓
Notification service
 ↓
In-app notification
 ↓
External channel adapter
```

Example:

```text
TutorAssigned
 ↓
In-app notification
 ↓
Optional email/push
```

In-app notification is the durable source of truth.

A failed external delivery must not remove the in-app notification.

# 22. Free/Low-Cost Notification Direction

The implementation should evaluate services based on:

- current free tier
- browser support
- Nepal delivery support
- reliability
- rate limits
- setup complexity

Do not hardcode provider-specific business rules into the domain.

A provider abstraction should allow replacement.

# 23. Search

For V1, PostgreSQL search is likely sufficient.

Index:

- tuition status
- branch
- subject
- grade
- location
- created_at
- application tuition
- application tutor
- tutor verification
- notification recipient/read state
- conversation updated_at

Do not add a search engine without a demonstrated need.

# 24. Matching Service

Matching produces relevance, not assignment.

Conceptual inputs:

- Subject
- Grade
- Availability
- Preferred location
- Branch

Admin remains final selector.

# 25. Suspension

Suspend endpoint must:

- verify admin authorization.
- update tutor state.
- store reason.
- create notification.
- write audit event.

Tutor access middleware must deny normal protected operations when suspended.

# 26. Reopening

Reopen endpoint must:

- verify admin authorization.
- verify tuition is eligible for reopening.
- preserve old assignment.
- transition tuition to OPEN.
- reopen application intake.
- notify affected users.

# 27. Audit

Audit actions should include:

```text
TUTOR_APPROVED
TUTOR_REJECTED
TUTOR_SUSPENDED
TUTOR_REACTIVATED
PROFILE_CHANGE_APPROVED
PROFILE_CHANGE_REJECTED
TUITION_CONFIRMED
TUITION_REJECTED
APPLICATION_CREATED
ASSIGNMENT_CREATED
WITHDRAWAL_REQUESTED
WITHDRAWAL_APPROVED
TUITION_REOPENED
```

Do not store raw sensitive data unnecessarily in audit payloads.

# 28. One-Time Banner

The backend stores a durable state.

Recommended:

```text
approval_banner_seen_at
```

Once non-null, the banner is no longer returned as pending.

Do not rely only on local browser state.

# 29. Error Handling

Use typed domain errors such as:

```text
FORBIDDEN
BRANCH_SCOPE_VIOLATION
TUTOR_NOT_VERIFIED
TUTOR_SUSPENDED
TUITION_CLOSED
DUPLICATE_APPLICATION
ASSIGNMENT_EXISTS
PROFILE_CHANGE_PENDING
REJECTION_REASON_REQUIRED
INVALID_LOCATION
DOCUMENT_REQUIRED
```

The UI maps these to user-friendly messages.

# 30. Testing

## Unit

- UID generation.
- Status transitions.
- Eligibility.
- Matching relevance.
- Location normalization.
- Notification idempotency.

## Integration

- Auth.
- Branch authorization.
- Tutor approval.
- Advanced edit.
- Tuition confirmation.
- Application.
- Assignment.
- Withdrawal.
- Reopen.
- Suspension.

## E2E

Primary journey:

```text
Parent submits
→ Admin confirms
→ Tutor A applies
→ Tutor B applies
→ Admin reviews
→ Admin messages
→ Admin assigns Tutor A
→ Opportunity closes
→ Tutor A requests withdrawal
→ Admin approves
→ Admin reopens
→ Tutor B applies
→ Admin assigns Tutor B
```

# 31. Deployment

Required environments:

- Development
- Staging
- Production

Production must have:

- database backups
- secret management
- HTTPS
- authentication production configuration
- private storage
- error monitoring
- logging
- notification configuration

# 32. Environment Variables

Typical categories:

```text
DATABASE_URL
AUTH_PROVIDER_CONFIG
GOOGLE_OAUTH_CONFIG
STORAGE_CONFIG
NOTIFICATION_CONFIG
APP_BASE_URL
```

Never commit real values.

# 33. Performance

Use:

- pagination
- indexed queries
- debounced search
- lazy CV loading
- efficient dashboard aggregation
- message pagination

Do not load every tutor/application/message into the browser.

# 34. Security

Required:

- server-side authorization
- secure sessions
- secure cookies where applicable
- validation
- rate limiting
- security headers
- CSRF protection where relevant
- private storage
- audit
- no secrets in client bundle
- no unnecessary auth UID exposure

# 35. TRD Acceptance Criteria

- Provider UID and Tutor UID are separate.
- Branch authorization cannot be bypassed from the client.
- Exact parent address never appears in tutor response.
- CV is private.
- Applications are race-safe.
- Assignment is race-safe.
- Profile changes are staged before approval.
- Suspended tutors cannot act normally.
- Reopening preserves history.
- Notifications remain durable even when external delivery fails.
