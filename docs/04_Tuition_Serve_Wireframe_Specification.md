# **Tuition Serve**

**Wireframe Specification**

*Screen-by-screen structural specification*

| **Document** | **Value** |
| --- | --- |
| Version | 1.0 |
| Status | Wireframe Baseline |
| Primary reference | Client-supplied HTML UI |
| Primary devices | Desktop Web and Mobile Web |

## Purpose

This document describes screen structure before visual implementation. It is not a pixel specification.

The supplied UI establishes the public visual language, including Inter typography, emerald primary color, light surfaces, rounded cards, professional education imagery, and a top navigation system. fileciteturn0file0L13-L110

# 1. Public Header

```text
┌─────────────────────────────────────────────────────────────┐
│ Tuition Serve | Home | Find a Tutor | Become a Tutor | ... │
│                                         Login | Signup      │
└─────────────────────────────────────────────────────────────┘
```

Signup is a tutor entry point, not admin signup.

# 2. Home

The existing client UI contains Hero, trust section, audience cards, request section, process section, stats, testimonials, FAQ, and footer. fileciteturn0file0L147-L455

Keep this composition unless later client changes override it.

# 3. Parent Request Form

```text
┌─────────────────────────────────────────────────────────────┐
│ Request a Home Tutor                                        │
├─────────────────────────────────────────────────────────────┤
│ Parent                                                      │
│ [ Full name ] [ Phone ] [ Email ]                           │
│                                                             │
│ Student                                                     │
│ [ Student name ] [ Grade ] [ Subject ]                      │
│                                                             │
│ Location                                                    │
│ [ Province ] [ District ] [ Municipality ] [ Ward ]         │
│ [ Area ]                                                    │
│ [ Exact address ]                                           │
│                                                             │
│ Availability                                                │
│ [ Days ] [ Time slot ] [ + Add slot ]                      │
│                                                             │
│ Notes                                                       │
│ [.........................................................] │
│                                                             │
│                                      [ Submit Request ]      │
└─────────────────────────────────────────────────────────────┘
```

# 4. Tutor Registration

Use grouped steps:

```text
Personal → Education → Teaching → Location → Availability → CV → Review
```

A progress indicator is recommended.

# 5. Tutor Dashboard

```text
┌─────────────────────────────────────────────────────────────┐
│ Good morning, Tutor Name                     ✓ Verified      │
│ Tutor ID: TS-T-000127                                       │
├─────────────────────────────────────────────────────────────┤
│ Available      Applications        Assigned                  │
│   12               4                  1                      │
├─────────────────────────────────────────────────────────────┤
│ Assigned Tuition                                             │
│ Grade 8 Mathematics | Devichowk, Janakpur                   │
│ [View]                                                       │
├─────────────────────────────────────────────────────────────┤
│ Notifications                                                │
│ • New tuition opportunity                                    │
│ • Profile update approved                                   │
└─────────────────────────────────────────────────────────────┘
```

Keep whitespace. Do not turn this into an analytics dashboard.

# 6. Tutor Profile

```text
Profile                                       [Advanced Edit]
─────────────────────────────────────────────────────────────
[Photo] Tutor Name
Tutor ID: TS-T-000127
✓ Verified

Personal Information
Name        🔒
Email       🔒
Phone       🔒

Education
Qualification  🔒
Institution    🔒

Teaching
Subjects       🔒
Grades         🔒
Location      🔒
Availability  🔒

Experience
3 years ...
[Edit] [Add]

CV
CV.pdf [View]
```

# 7. Advanced Edit

```text
┌─────────────────────────────────────────────────────────────┐
│ Request Profile Change                                      │
├─────────────────────────────────────────────────────────────┤
│ Current                 Proposed                            │
│ Kathmandu               Lalitpur                            │
│                                                             │
│ Reason (optional/required per final policy)                 │
│ [.........................................................] │
│                                                             │
│ [Cancel]                         [Submit for Approval]       │
└─────────────────────────────────────────────────────────────┘
```

# 8. Available Tuitions

```text
┌─────────────────────────────────────────────────────────────┐
│ Available Tuitions                                          │
│ [Search]                                                    │
│ [Subject] [Grade] [Location] [Day] [Time]                  │
├─────────────────────────────────────────────────────────────┤
│ Grade 8 Mathematics                                         │
│ Devichowk, Janakpur | Sun-Fri | 5 PM - 7 PM                │
│ Home Tuition                                                │
│                                          [View Details]      │
├─────────────────────────────────────────────────────────────┤
│ Grade 10 Science                                            │
│ Janakpur | Sun-Thu | 6 PM - 8 PM                           │
│ Home Tuition                                                │
│                                          [View Details]      │
└─────────────────────────────────────────────────────────────┘
```

# 9. Tuition Detail

```text
Grade 8 Mathematics                         TS-TU-00482

Class: Grade 8
Subject: Mathematics
Location: Devichowk, Janakpur
Days: Sun-Fri
Time: 5 PM - 7 PM
Mode: Home Tuition

Requirements:
...

Exact address is not shown here.

[Apply for Tuition]
```

# 10. Admin Dashboard

```text
┌─────────────────────────────────────────────────────────────┐
│ Janakpur Branch                           🔔  Admin          │
├─────────────────────────────────────────────────────────────┤
│ New Requests │ Tutor Reviews │ Open Tuitions │ Selections   │
│      8       │       4       │      17       │      3       │
├─────────────────────────────────────────────────────────────┤
│ Needs Attention                                              │
│ • 4 tutor applications                                      │
│ • 2 advanced edits                                          │
│ • 1 withdrawal request                                      │
├─────────────────────────────────────────────────────────────┤
│ Recent Tuition Requests                                     │
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

# 11. Admin Tuition Request

```text
Tuition TS-TU-00482                      Status: NEW

Parent
Name / Phone / Email

Student
Name / Grade / Subject

Exact Address
[Private admin view]

Schedule
...

Requirements
...

[Reject]                                [Confirm]
```

Reject opens mandatory reason modal.

# 12. Admin Applicants

```text
Tuition TS-TU-00482
Applicants: 11

[Search] [Experience] [Availability]

TS-T-000127  ✓ Verified
Math | Grade 6-10 | 3 yrs
Devichowk | 5-8 PM
[View] [Message] [Assign]

TS-T-000144  ✓ Verified
...
```

# 13. Admin Tutor Detail

```text
Tutor TS-T-000127               ✓ Verified

Photo / Name / Contact
Subjects
Grades
Education
Experience
Location
Availability
Expected fee

Documents
CV.pdf [View]

[Message]                           [Assign]
```

# 14. Admin Profile Change

```text
Advanced Profile Change
Tutor: TS-T-000127

Field:
Preferred Location

Current:
Devichowk

Proposed:
Janakpur East

[Reject]                             [Approve]
```

# 15. Admin Withdrawal Request

```text
Withdrawal Request
Tutor: TS-T-000127
Tuition: TS-TU-00482

Reason:
...

[Reject]                             [Approve]
```

# 16. Messages

```text
┌───────────────┬─────────────────────────────────────────────┐
│ Tutor A       │ Tutor A / TS-T-000127                       │
│ Tutor B       │                                             │
│ Tutor C       │ Admin: ...                                  │
│               │ Tutor: ...                                  │
│               │                                             │
│               │ [Message.........................] [Send]   │
└───────────────┴─────────────────────────────────────────────┘
```

# 17. Notifications

```text
Notifications
──────────────────────────────────────────
● New tuition opportunity
  Grade 8 Math | Devichowk

● Profile change approved

● Selected for tuition

[Mark all as read]
```

# 18. Suspended Tutor

```text
┌─────────────────────────────────────────────────────────────┐
│                         Account Suspended                    │
│                                                             │
│ Your tutor account is currently suspended.                  │
│ Please contact support for assistance.                      │
│                                                             │
│                     [Contact Support]                       │
└─────────────────────────────────────────────────────────────┘
```

# 19. Mobile Tutor Navigation

Keep only core areas:

```text
[Home] [Tuitions] [Applications] [Notifications] [Profile]
```

Messages can be integrated with a top action or Profile depending on final information architecture.

# 20. Wireframe Rules

- Do not create a public tutor directory.
- Do not put full profile editing on dashboard.
- Use status badges consistently.
- Use clear locked-field treatment.
- Make Assign easy to reach.
- Keep exact address visibly admin-only.
- Keep tutor opportunity cards compact.
- Design mobile first for tutor opportunity browsing and application.
