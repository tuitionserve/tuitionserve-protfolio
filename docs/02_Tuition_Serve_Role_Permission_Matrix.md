# **Tuition Serve**

**Role and Permission Matrix**

*Super Admin, Branch Admin, Tutor, and public Parent access*

| **Document** | **Value** |
| --- | --- |
| Version | 1.0 |
| Status | Authorization Baseline |
| Administrative roles | Super Admin, Branch Admin |
| Tutor access | Authenticated |
| Parent access | Public form only |

## Purpose

This document defines what each role may see and do. UI visibility is not authorization. Every permission in this document must be enforced server-side.

# 1. Roles

## Super Admin

Platform-wide control across branches.

## Branch Admin

Operational administrator for one assigned branch/city. Branch Admin is the branch staff role.

## Tutor

Authenticated service provider with limited access to their own records and approved tuition workflows.

## Parent

Unauthenticated public user. Can submit tuition requirements only.

# 2. Core Permission Matrix

| **Action** | **Super Admin** | **Branch Admin** | **Tutor** | **Parent** |
| --- | ---: | ---: | ---: | ---: |
| View public website | ✓ | ✓ | ✓ | ✓ |
| Submit tuition request | ✓ | ✓ | ✕ | ✓ |
| Register as tutor | ✓ | ✓ | ✓ | ✓ |
| Create public admin account | ✕ | ✕ | ✕ | ✕ |
| Sign in as tutor | ✓ | ✓ | ✓ | ✕ |
| Review tutor application | ✓ | B | ✕ | ✕ |
| Approve tutor | ✓ | B | ✕ | ✕ |
| Reject tutor | ✓ | B | ✕ | ✕ |
| Reapply after rejection | ✕ | ✕ | O | ✕ |
| Suspend tutor | ✓ | B | ✕ | ✕ |
| Reactivate tutor | ✓ | B | ✕ | ✕ |
| Edit approved tutor directly | ✓ | B | ✕ | ✕ |
| Edit own experience | ✕ | ✕ | O | ✕ |
| Edit own profile photo | ✕ | ✕ | O | ✕ |
| Submit advanced edit | ✕ | ✕ | O | ✕ |
| Approve advanced edit | ✓ | B | ✕ | ✕ |
| Reject advanced edit | ✓ | B | ✕ | ✕ |
| Review tuition request | ✓ | B | ✕ | ✕ |
| Confirm tuition | ✓ | B | ✕ | ✕ |
| Reject tuition | ✓ | B | ✕ | ✕ |
| Browse open tuitions | R | R | ✓ | ✕ |
| Search/filter tuitions | ✓ | ✓ | ✓ | ✕ |
| Apply to tuition | ✕ | ✕ | O | ✕ |
| Withdraw own application | ✕ | ✕ | O | ✕ |
| Review applicants | ✓ | B | ✕ | ✕ |
| View tutor CV | ✓ | B | O | ✕ |
| Message tutor | ✓ | B | ✓ | ✕ |
| Select tutor | ✓ | B | ✕ | ✕ |
| Assign tutor | ✓ | B | ✕ | ✕ |
| Request post-assignment withdrawal | ✕ | ✕ | O | ✕ |
| Approve withdrawal | ✓ | B | ✕ | ✕ |
| Reopen tuition | ✓ | B | ✕ | ✕ |
| View exact parent address | ✓ | B | ✕ | ✕ |
| View tutor-visible locality | ✓ | B | ✓ | ✕ |
| Manage branches | ✓ | ✕ | ✕ | ✕ |
| Manage Branch Admins | ✓ | ✕ | ✕ | ✕ |
| View cross-branch data | ✓ | ✕ | ✕ | ✕ |
| View branch data | ✓ | B | ✕ | ✕ |
| View audit logs | ✓ | B/C | ✕ | ✕ |

**Legend:** B = permitted within branch scope. O = own record only. C = conditional policy.

# 3. Parent Permissions

Parent has no account.

Parent may:

- Open public pages.
- Submit a tuition request.
- Provide parent/student details.
- Provide exact home address.
- Provide availability and requirements.

Parent may not:

- Access admin data.
- Access tutor profiles.
- Browse tutor accounts.
- View competitor applications.
- Access platform dashboard.

# 4. Tutor Permissions

Tutor may:

- Manage their account authentication.
- Complete profile.
- Upload CV.
- Submit profile for review.
- Correct rejected profile.
- Edit experience after approval.
- Edit profile photo after approval.
- Submit advanced profile changes.
- Browse available tuitions.
- Search/filter opportunities.
- Apply.
- Withdraw an unselected application.
- Request post-assignment withdrawal.
- Message authorized administrators.
- Read their notifications.
- View own applications and assignments.

Tutor may not:

- Approve themselves.
- Assign themselves.
- View other applicants.
- View exact parent address.
- Directly edit controlled approved fields.
- Apply while suspended.
- Apply to a closed tuition.
- Create branch records.
- Alter another user's profile.

# 5. Tutor Profile Permission Matrix

| **Field** | **Tutor Direct Edit After Approval** | **Advanced Edit Request** |
| --- | ---: | ---: |
| Full name | ✕ | ✓ |
| Email | ✕ | ✓ |
| Phone | ✕ | ✓ |
| Gender | ✕ | ✓ |
| Date of birth | ✕ | ✓ |
| Address | ✕ | ✓ |
| Profile photo | ✓ | Not needed |
| Highest qualification | ✕ | ✓ |
| Institution | ✕ | ✓ |
| Graduation year | ✕ | ✓ |
| Major/subject | ✕ | ✓ |
| Subjects | ✕ | ✓ |
| Grades | ✕ | ✓ |
| Experience | ✓ | Not needed for normal edit |
| Preferred location | ✕ | ✓ |
| Availability | ✕ | ✓ |
| Expected monthly fee | ✕ | ✓ |

# 6. Admin Approval Rules

Admin rejection requires a reason.

Admin approval/rejection should create:

- Status change.
- Reviewer identity.
- Timestamp.
- Notification where appropriate.
- Audit event.

# 7. Suspension Rules

Admin can suspend a tutor.

Suspension:

- Does not delete the account.
- Blocks normal tutor operations.
- Preserves applications and history.
- Shows a suspension state at login.
- Can be reversed by authorized admin.

# 8. Branch Scope

Branch Admin must be prevented from:

- Reading another branch's private parent addresses.
- Reviewing another branch's restricted tutor application.
- Assigning another branch's tuition.
- Managing another branch's Branch Admin.
- Accessing global system controls.

Do not rely on the frontend to hide cross-branch records.

# 9. Assignment Permissions

Only admin roles may assign.

Assign requires:

- Authorized branch context.
- Tuition in OPEN state.
- Tutor eligible and active.
- No existing active assignment.
- Transactional consistency.

# 10. Withdrawal Permissions

Tutor can request withdrawal after assignment.

Admin decides.

Admin can also initiate assignment release according to policy.

A tutor cannot force a completed withdrawal transition by changing their own status.

# 11. Security Acceptance Criteria

- Role checks are server-side.
- Branch checks are server-side.
- Tutor ownership checks are server-side.
- Exact address cannot be returned from tutor endpoints.
- CV access is authorized.
- Suspended tutor requests are rejected.
- Closed tuition applications are rejected.
