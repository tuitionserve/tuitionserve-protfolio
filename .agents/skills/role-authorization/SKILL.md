# Role Authorization Skill

## Purpose

Enforce Tuition Serve's four access contexts:

1. Public
2. Tutor
3. Branch Admin
4. Super Admin

There is no separate Staff role.

## Public

Public users may:

- browse public website content
- submit parent tuition request forms
- access tutor registration entry points
- use allowed public authentication flows

Public users must not access private tutor, parent, application, message, or branch data.

## Tutor

A tutor may:

- manage authentication
- complete and submit their own tutor profile
- view their own profile
- edit experience and profile photo according to lifecycle rules
- submit advanced profile change requests
- view allowed tuition opportunities
- search/filter opportunities
- apply to eligible open opportunities
- view their own applications
- request withdrawal according to workflow
- view assigned tuition information allowed by the product
- message authorized admin users
- view notifications
- see their own Tutor UID and status

A tutor may not:

- approve themselves
- approve another tutor
- alter verified fields directly
- see parent exact address unless explicitly released by the admin-controlled workflow
- access another tutor's private application data
- access another branch's admin data
- apply while suspended

## Branch Admin

Branch Admin is the operating staff for that branch.

A Branch Admin may perform the branch-scoped operational actions defined in the role matrix, including:

- review parent tuition requests
- confirm/reject tuition requests
- review tutor applications
- approve/reject tutor applications
- provide rejection reasons
- review advanced profile edits
- approve/reject advanced edits
- suspend/reactivate tutors within permitted branch scope
- review applications
- communicate with tutors
- assign tutors
- handle withdrawals
- reopen tuition opportunities
- manage branch-level operational records

Branch Admin must not act on records outside their permitted branch scope.

## Super Admin

Super Admin has platform-wide control and can manage all branches and global administrative functions according to the role matrix.

## Server-Side Enforcement

Role checks must occur on the server.

Branch scope checks must occur on every protected resource access.

Do not trust:

- client role
- client branch ID
- hidden buttons
- route naming
- URL IDs

## Cross-Branch Isolation

For a Branch Admin request:

```text
caller.branch_id == resource.branch_id
```

must be enforced wherever branch-scoped access is required.

## Suspended Tutor

Suspension overrides ordinary tutor operational access.

Authentication may still succeed if needed to show the suspension message, but protected tutor features must remain inaccessible until reactivation.

## Security Review

Every new route or server action must answer:

- Who can call it?
- Which branch can they access?
- Which record owners can they access?
- Which lifecycle states are allowed?
- What data can the response contain?
