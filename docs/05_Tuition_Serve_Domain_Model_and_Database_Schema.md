# **Tuition Serve**

**Domain Model and Database Schema Specification**

*Conceptual data model and integrity rules*

| **Document** | **Value** |
| --- | --- |
| Version | 1.0 |
| Status | Domain Baseline |
| Database direction | Relational database recommended |
| Authentication | External authentication provider |
| Public tutor identity | Application-generated Tutor UID |

## Purpose

This document defines the business entities, relationships, identifiers, historical snapshots, and data integrity rules required by Tuition Serve.

# 1. Domain Map

```text
Branch
 ├── Branch Admin
 ├── Tutors
 └── Tuition Requests
       ├── Parent
       │    └── Students
       ├── Applications
       │      └── Tutor
       └── Assignments
              └── Tutor

Tutor
 ├── Profile
 ├── Experiences
 ├── Availability
 ├── Subjects
 ├── Grades
 ├── Documents
 └── Profile Change Requests

Conversation
 └── Messages

User
 └── Notifications
```

# 2. UserAccount

Represents authentication-linked users.

Conceptual fields:

- id
- auth_provider_uid
- email
- role
- account_status
- created_at
- updated_at

Roles:

- SUPER_ADMIN
- BRANCH_ADMIN
- TUTOR

Parents do not require UserAccount.

# 3. Branch

Conceptual fields:

- id
- branch_uid
- name
- city
- status
- created_at
- updated_at

# 4. Tutor

Conceptual fields:

- id
- tutor_uid
- user_account_id
- verification_status
- suspension_reason
- suspended_at
- reactivated_at
- created_at
- updated_at

Tutor UID is immutable.

# 5. TutorProfile

Conceptual fields:

- tutor_id
- full_name
- email
- phone
- gender
- date_of_birth
- address
- profile_photo_reference
- highest_qualification
- institution
- graduation_year
- major_subject
- teaching_experience_summary
- preferred_location_id
- minimum_expected_monthly_fee
- approved_at
- updated_at

Approved values are authoritative.

# 6. TutorExperience

Conceptual fields:

- id
- tutor_id
- organization
- position
- subject
- grades
- start_date
- end_date
- description
- created_at
- updated_at

# 7. TutorAvailability

One tutor may have multiple time slots per day.

Fields:

- id
- tutor_id
- day_of_week
- start_time
- end_time

# 8. TutorCapabilities

Recommended normalized relationships:

```text
Tutor ↔ Subject
Tutor ↔ Grade
```

Use join structures rather than comma-separated text.

# 9. TutorDocument

Fields:

- id
- tutor_id
- document_type
- storage_reference
- file_name
- mime_type
- size_bytes
- uploaded_at
- status

Current type:

`CV`

# 10. Parent

Fields:

- id
- parent_uid
- full_name
- phone
- email
- created_at
- updated_at

Parent UID is internal.

# 11. Student

Fields:

- id
- student_uid
- parent_id
- full_name
- grade_id
- school_name if collected
- created_at
- updated_at

# 12. TuitionRequest

Core fields:

- id
- tuition_uid
- branch_id
- parent_id
- student_id
- status
- subject_id
- grade_id
- private_address_id
- structured_location_id
- tutor_visible_location_id
- preferred_days
- time_slots
- notes
- created_at
- confirmed_at
- rejected_at
- rejection_reason
- updated_at

A confirmed TuitionRequest becomes an opportunity through its lifecycle rather than requiring a duplicate opportunity table unless implementation proves otherwise.

# 13. TutorApplication

Fields:

- id
- application_uid
- tuition_id
- tutor_id
- status
- applied_at
- withdrawn_at
- withdrawal_reason
- selected_at
- cv_document_id_at_application
- snapshot_reference

Recommended constraint:

```text
One active application per tutor per tuition.
```

# 14. TutorApplicationSnapshot

Snapshot should preserve relevant information at application time.

Suggested fields:

- application_id
- tutor_uid
- full_name
- qualification
- institution
- major_subject
- subjects
- grades
- experience_summary
- preferred_location
- availability
- expected_monthly_fee
- cv_reference
- captured_at

This prevents future profile edits from changing historical application meaning.

# 15. TuitionAssignment

Fields:

- id
- assignment_uid
- tuition_id
- tutor_id
- assigned_by_user_id
- assigned_at
- status
- withdrawal_requested_at
- withdrawal_reason
- withdrawal_reviewed_by
- withdrawal_reviewed_at
- ended_at
- end_reason

Rule:

**At most one active assignment per tuition.**

Historical assignments are allowed.

# 16. ProfileChangeRequest

Fields:

- id
- request_uid
- tutor_id
- status
- requested_changes
- reason
- submitted_at
- reviewed_at
- reviewed_by
- rejection_reason

The requested values remain separate from the current approved profile until approval.

# 17. Conversation

Fields:

- id
- conversation_uid
- tutor_id
- admin_user_id
- branch_id
- tuition_id nullable
- created_at
- updated_at

# 18. Message

Fields:

- id
- conversation_id
- sender_user_id
- body
- sent_at
- edited_at if later supported
- read state strategy

# 19. Notification

Fields:

- id
- recipient_user_id
- type
- title
- body
- related_entity_type
- related_entity_id
- read_at
- created_at

# 20. Address

Private exact address should be represented separately.

Possible fields:

- id
- address_line_1
- address_line_2
- landmark
- geographic_location_id
- postal_code
- latitude
- longitude
- privacy_class

# 21. GeographicLocation

Canonical location hierarchy.

Fields:

- id
- parent_location_id
- country
- province
- district
- local_government
- municipality
- ward
- locality
- postal_code
- latitude
- longitude
- normalized_name
- source_reference

The authoritative source must be verified before production.

# 22. UID Strategy

Recommended:

| Entity | Example |
| --- | --- |
| Tutor | TS-T-000127 |
| Tuition | TS-TU-00482 |
| Application | TS-APP-00931 |
| Assignment | TS-ASG-00321 |
| Profile Change | TS-PC-00074 |
| Conversation | TS-CONV-00412 |

These are product identifiers, not database primary keys.

# 23. Relationships

```text
UserAccount 1 ── 0..1 Tutor
Branch 1 ── N Tutor
Branch 1 ── N TuitionRequest
Parent 1 ── N Student
Student 1 ── N TuitionRequest
Tutor 1 ── 1 TutorProfile
Tutor 1 ── N TutorExperience
Tutor 1 ── N TutorAvailability
Tutor 1 ── N TutorApplication
TuitionRequest 1 ── N TutorApplication
TuitionRequest 1 ── N TuitionAssignment
Tutor 1 ── N TuitionAssignment
Tutor 1 ── N ProfileChangeRequest
Conversation 1 ── N Message
UserAccount 1 ── N Notification
```

# 24. Location Privacy

Do not store only:

`location = "Devichowk, Janakpur"`

Instead maintain:

```text
Private Address
+
Canonical Location
+
Tutor-visible Area
```

Tutor API response must exclude private address.

Admin response can include it according to authorization.

# 25. State Integrity

Critical state transitions must be implemented as domain commands.

Examples:

```text
approveTutor
rejectTutor
suspendTutor
reactivateTutor
approveProfileChange
rejectProfileChange
confirmTuition
rejectTuition
applyToTuition
withdrawApplication
assignTutor
requestAssignmentWithdrawal
approveAssignmentWithdrawal
reopenTuition
```

# 26. One-Time Banner Data

Store a backend state such as:

`approval_banner_seen`

Do not rely only on browser local state.

# 27. Historical Integrity

Do not modify application snapshots when:

- Tutor changes experience.
- Tutor changes photo.
- Admin approves a later profile change.
- Tutor uploads a new CV.

The historical application remains tied to the original snapshot/reference.

# 28. Soft Deactivation

Tutor accounts and historical business records should normally be deactivated/statused, not physically deleted.

This is essential for:

- applications
- assignments
- messages
- audits

# 29. Database Integrity Rules

- Unique Tutor UID.
- Unique Tuition UID.
- Unique Application UID.
- Unique active tutor assignment per tuition.
- Unique active application per tutor and tuition.
- Foreign-key integrity.
- Valid state transitions.
- Branch scope available for authorization.
- Pending profile changes cannot directly overwrite approved profile.
- Private address has restricted access.

# 30. Domain Acceptance Criteria

- Historical applications survive profile edits.
- Exact address can be stored without appearing in tutor responses.
- Multiple applications can exist for one tuition.
- Only one active assignment exists at a time.
- Reopening creates a new application opportunity without deleting history.
- Tutor UID is stable.
