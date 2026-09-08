# 🎓 Tuition Serve — The Client Handbook

**Second Edition — Updated September 2026**

> *A complete guide to understanding, operating, and maintaining the Tuition Serve platform — written for the person running the business, not the person who built the code.*

---

## 📑 Table of Contents

- [Preface](#preface)
- [Part I: Understanding Tuition Serve](#part-i-understanding-tuition-serve)
  - [Chapter 1 — What Tuition Serve Is](#chapter-1--what-tuition-serve-is)
  - [Chapter 2 — Who Uses the App](#chapter-2--who-uses-the-app)
  - [Chapter 3 — The Journey From Request to Placement](#chapter-3--the-journey-from-request-to-placement)
- [Part II: Running the Platform Day to Day](#part-ii-running-the-platform-day-to-day)
  - [Chapter 4 — Branches and How Routing Works](#chapter-4--branches-and-how-routing-works)
  - [Chapter 5 — Tutor Verification and Suspension](#chapter-5--tutor-verification-and-suspension)
  - [Chapter 6 — Messaging and Notifications](#chapter-6--messaging-and-notifications)
- [Part III: Managing Accounts, Roles, and Data](#part-iii-managing-accounts-roles-and-data)
  - [Chapter 7 — The Role Codes](#chapter-7--the-role-codes)
  - [Chapter 8 — Finding One Person Among Thousands](#chapter-8--finding-one-person-among-thousands)
  - [Chapter 9 — Changing an Existing Person's Role](#chapter-9--changing-an-existing-persons-role)
  - [Chapter 10 — Creating a Brand-New Admin Account](#chapter-10--creating-a-brand-new-admin-account)
- [Part IV: Understanding the Codes You'll See](#part-iv-understanding-the-codes-youll-see)
  - [Chapter 11 — What TS-T-000127 and Codes Like It Mean](#chapter-11--what-ts-t-000127-and-codes-like-it-mean)
- [Part V: Security and What Was Tested](#part-v-security-and-what-was-tested)
  - [Chapter 12 — What Is Protected, and How](#chapter-12--what-is-protected-and-how)
- [Part VI: Hosting and Deployment](#part-vi-hosting-and-deployment)
  - [Chapter 13 — What's Needed to Go Live](#chapter-13--whats-needed-to-go-live)
- [Appendix A — Technical Glossary](#appendix-a--technical-glossary)
- [Appendix B — Getting Help](#appendix-b--getting-help)

---

## Preface

This handbook exists so that you can run Tuition Serve without needing to read code, and without needing a developer standing next to you for every routine decision — who counts as an administrator, how to find one person's account among thousands, what those strange codes like TS-T-000127 mean, and what actually happens when a parent submits a request.

It is organized like a book on purpose, rather than as one long page you have to scroll through. The Table of Contents on the next page is clickable in Word (hold Ctrl and click a line to jump there) — use it. If a section title mentions something you don't currently need, skip it; nothing here assumes you read it front to back.

A short note on scope: this book covers what you, as the person operating the business, need to know. It deliberately does not explain how the code itself is written — that belongs in a separate technical reference intended for a developer (or an AI coding assistant) picking up the project, which ships alongside this one. A short glossary of the few technical terms that do come up is at the very back, in Appendix A, precisely so it doesn't get in the way of the parts you'll actually use.

Use the Table of Contents to jump straight to what you need:

- Trying to understand what the product actually does — start at Part I.
- Need to promote someone to admin, or find a specific person's account — go straight to Part III.
- Saw a code like “TS-TU-000045” somewhere and want to know what it means — Part IV.
- Wondering what's already been tested for security — Part V.

# PART I

Understanding Tuition Serve

## Chapter 1 — What Tuition Serve Is

Tuition Serve connects parents looking for a home tutor with verified, independent tutors — but every match is reviewed by an admin, not left to a parent browsing profiles and picking one themselves. Parents submit a request; an admin reviews it; verified tutors apply; an admin makes the final selection.

This admin-in-the-loop model is deliberate. It guarantees every tutor a parent meets has actually been vetted, lets requests be routed to the right regional team, and keeps a full record of who approved what and when.

Payments are handled entirely outside the app — this version does not process money in any way.

## Chapter 2 — Who Uses the App

There are exactly four kinds of people who touch the system:

| Who | Has a login? | What they do |
| --- | --- | --- |
| Parent | No — public form only | Submits a request through a public web form. No account, no password. |
| Tutor | Yes — signs up themselves | Builds a profile, gets verified, applies to tuitions, messages admins. |
| Branch Admin | Yes — created for them, never self-signup | Manages tutors, requests, and assignments for their own region only. |
| Super Admin | Yes — created for them, never self-signup | Everything a Branch Admin can do, everywhere, plus creating branches and other admin accounts. |
| School / Institution | No — public form or direct contact | Submits partnership enquiries; can have teacher vacancies posted on their behalf by an admin. |

The exact codes the system uses for these roles — which matter once you start assigning or changing them — are covered in Part III, Chapter 7.

#### Account Self-Service: Passwords and Email

Tutors and admins no longer need you to intervene for routine account changes. On the sign-in page, a “Forgot password?” link sends a password-reset email directly through Firebase — you are not involved, and you can never see or set anyone's password yourself.

Once signed in, every role's own Profile page has a Security section where they can change their password (after confirming their current one) or change their email address. A change of email takes effect immediately and becomes their login email from that point on.

Accounts that signed up with Google instead of a password see a note pointing them to their Google Account instead — there's no password on file here for them to change.

## Chapter 3 — The Journey From Request to Placement

### Step 1: Parent Submits a Request

Families can submit tuition requests for one or multiple children in a single unified submission. For each child, the parent specifies their grade level (Play Group through Grade 12, or Bachelor Level — which captures their specific degree program and current year/semester) and subjects using a flexible multi-select picker (catalog subjects, custom subjects, or "All Subjects"). The form also captures tutor gender preference (Male, Female, or No Preference), day-range availability (e.g. Sunday to Friday, 5:00 PM – 7:00 PM), and location down to the municipality and ward level. The exact home address and contact phone number are collected securely and kept private from public and tutor browsing. No account creation is required.

### Step 2: Routed to Admin Queue

Automatically routed to the Branch Admin covering that location, or the Super Admin if no branch covers it yet.

### Step 3: Admin Confirms or Rejects

Confirming instantly turns it into an open opportunity tutors can see. Rejecting requires a reason, which is recorded.

### Step 4: Verified Tutors Browse & Apply

The opportunity appears in Available Tuitions, automatically scoped to the tutor's own branch city so tutors only see jobs in their reachable area. Location filters default to the tutor's preferred locality. At this stage, tutors see only general area information (e.g. "Devichowk, Janakpur"); the parent's exact home address and contact details remain strictly hidden.

### Step 5: Admin Evaluates & Assigns One Tutor

Every applicant is reviewed — including a frozen snapshot of their profile at the moment they applied, so a later profile edit never changes what was evaluated. The admin assigns one; every other applicant is automatically marked not selected.

### Step 6: Tuition Becomes Active & Details Disclosed

Both the admin and the assigned tutor see the placement as active. Crucially, once formally assigned, the tutor's assignment screen reveals the parent's full contact name, phone number, and exact home address, providing the tutor with everything needed to contact the family and travel to conduct classes.

### Step 7: Changes, Withdrawals, Reopening, or Cancellation

A tutor who can no longer continue submits a withdrawal request with an explanatory reason; an admin reviews and approves or rejects it. On approval, the admin has two choices: they can either Reopen the tuition for fresh tutor applications, or Cancel Tuition (with a mandatory reason) if the family decides not to continue. Cancelled tuitions move to a dedicated Cancelled queue and remain on file permanently for audit records.

#### Requests an Admin Enters Directly

Not every parent uses the website — some call or message the branch directly. An admin can enter that request on the parent's behalf from Tuition Requests → Post Tuition; it lands in the same New Requests queue as a normal submission and goes through the same confirm/reject flow. The equivalent exists for schools: Admin → School Contact → Post School Enquiry creates a school partnership enquiry exactly as if the school had used the For Schools page themselves.

#### Posting School Vacancies

In addition to home tuitions, institutions often contact Tuition Serve to recruit teachers. Admins can post school vacancies directly via Tuition Requests → Post School Vacancy. These vacancies flow through the same pipeline as home tuitions (New → Open → Applications → Assignment) and appear in tutors' Available Tuitions feed with a distinctive "School" badge, allowing tutors to apply for institutional classroom positions alongside private home tuitions.

#### Rejected Requests Clean Themselves Up

A rejected request is kept for 30 days, in case anyone needs to review why, then deleted automatically by a scheduled job. An admin can also clear all of a branch's rejected requests immediately from the Rejected tab, without waiting.

# PART II

Running the Platform Day to Day

## Chapter 4 — Branches and How Routing Works

A Branch represents a regional office (e.g. “Kathmandu Branch”). Every Branch Admin belongs to exactly one branch. When a request or a tutor profile comes in, the system matches the location's Local Government name against each branch's recorded city — an exact or partial name match, not a guarantee. If nothing matches, the record is left unrouted, visible only to the Super Admin. When adding a new branch, make sure its recorded city closely matches the real place name it should cover.

A Branch Admin cannot see or act on another branch's tutors, requests, applications, or conversations — this is enforced everywhere on the server, not just hidden in the menu, and it was directly, adversarially tested (see Part V).

## Chapter 5 — Tutor Verification and Suspension

| Status | Meaning |
| --- | --- |
| Profile Incomplete | Just signed up, still filling out their profile. |
| Submitted | Submitted for review for the first time. |
| Under Review | An admin has started reviewing it. |
| Changes Required | Rejected with a mandatory reason; the tutor can edit and resubmit. |
| Resubmitted | Fixed and resubmitted after a rejection. |
| Verified | Approved — can now apply to open tuitions. |
| Suspended | Blocked from every action until an admin reactivates them. |

Suspension is a hard stop: it's enforced on every action the tutor could take, not just on the pages they see — confirmed directly during testing by attempting to bypass the visible screens entirely.

## Chapter 6 — Messaging and Notifications

There is one conversation per tutor/branch pair — a focused thread, not a general chat system. Either side can start it, from either the Applicants list on a tuition request or the Messages section directly. Messages arrive in real time on both sides — nothing needs refreshing — and the Messages section itself is a single page split into a conversation list and the open thread, side by side on a wide screen and one at a time on a phone, the way a modern chat app works.

One nuance: an admin can only message a tutor who belongs to their own branch. Since a tutor can apply to a tuition in a different branch, an admin occasionally can't message an applicant to their own request if that applicant's home branch is elsewhere — this is intentional current behavior, not a bug, and can be revisited if it becomes a real problem in practice.

Notifications are a real in-app bell for both tutors and admins — new submissions, approvals, new messages, assignments — each linking to the relevant page.

#### Tracking Applications and Mobile Navigation

Tutors track all active and past applications in My Applications, categorized into clear status tabs: All, Assigned, Applied, Not Selected, and Withdrawn. For administrators using mobile phones, the bottom tab bar features a "More" menu that opens a sliding drawer for one-tap access to all administrative actions (Post Tuition, Post School Vacancy, School Contact, Branches, Profile, and Sign Out).

#### Contact Queries and School Enquiries

Separate from tutor messaging, two public forms feed their own admin inboxes: the general Contact Us form (Admin → Contact Queries) and the For Schools partnership form (Admin → School Contact). Both let an admin reply by email and are marked read once opened. An admin can also log one of these on someone's behalf — see “Requests an Admin Enters Directly” above.

# PART III

Managing Accounts, Roles, and Data

This is the part of the book you'll come back to most often. It walks through exactly how to find one person's account among thousands, and exactly how to change what they're allowed to do — both without touching any code.

## Chapter 7 — The Role Codes

Every login in the system — every Tutor, every Branch Admin, every Super Admin — has a role stored as one of exactly three text values. These are the literal values stored in the database; you'll need the exact spelling (capital letters, underscore) when you edit one directly, which Chapter 9 walks through.

| Role code (exact) | Who this is |
| --- | --- |
| SUPER_ADMIN | Full access — every branch, can create new branches and new admin accounts. |
| BRANCH_ADMIN | Access to one branch only — also needs a Branch assigned (see Chapter 9). |
| TUTOR | A registered tutor. This is the only role anyone can ever get by signing up on the website themselves. |

There is deliberately no self-service way for anyone to make themselves a Branch Admin or Super Admin through the website — the public sign-up screen can only ever produce a Tutor account. This is a security decision, not an oversight: it means the only way someone becomes an admin is because you (or your developer) made a specific decision to grant it, either by having a Super Admin create their admin account (Chapter 10) or by editing an existing account's role directly (Chapter 9).

There is also no “Parent” or “Student” login of any kind — parents never create accounts. A parent's and student's information exists only as records tied to the request they submitted, not as something anyone signs into.

## Chapter 8 — Finding One Person Among Thousands

The database behind Tuition Serve (Cloud Firestore) is not a spreadsheet or a SQL database — there's no simple search box that searches everything at once the way you might expect. But finding one specific account, even with ten thousand people in the system, is fast and reliable once you know the trick:

look the person up by email in Authentication first, not by scrolling through Firestore.

Here is the exact, reliable path:

### 1. Go to console.firebase.google.com and open the project.

### 2. In the left sidebar, click Authentication, then the Users tab.

### 3. At the top of the users table there is a search box. Type the person's email address exactly. This searches instantly, even across thousands of users.

### 4. Click on the matching row. You'll see a field called User UID — a long string of letters and numbers. Copy it.

### 5. Now click Firestore Database in the left sidebar, then open the userAccounts collection.

### 6. You do not need to scroll or search this list — every document in this collection is named exactly after the User UID you just copied. Paste it into the document-ID search at the top, or scroll to find that exact ID. That document is that person's account.

This works no matter how many accounts exist, because you're not searching Firestore at all in the way you might expect — you're using Authentication's fast email search to get an exact key, then jumping straight to the one document with that key. That's the trick.

#### If you don't know their email

If you only know, say, a tutor's name or their Tutor UID (like TS-T-000127 — see Part IV) rather than their email, Firestore's own Data view has a filter tool: open the tutors collection, click the funnel/filter icon near the top of the document list, and add a condition — for example tutorUid == "TS-T-000127". This is slower to set up than the email-search method above but works when email isn't what you have.

## Chapter 9 — Changing an Existing Person's Role

Once you've found the account's document (Chapter 8), changing their role is a direct edit:

### 1. With the userAccounts/{their UID} document open, click the role field to edit it.

### 2. Type the exact new role code — one of SUPER_ADMIN, BRANCH_ADMIN, or TUTOR — capital letters and the underscore matter.

### 3. If you're assigning BRANCH_ADMIN, you must also set the branchId field on the same document to the ID of the branch they should manage. Open the branches collection in another tab to find the right branch's document ID, and paste it in. A Branch Admin with no branchId set will not be able to do anything, since every action they take is checked against it.

### 4. Save. The change takes effect on their very next action — they don't need to log out and back in for it to apply, since this is checked fresh from the database on every request.

A word of caution: this is a direct, unvalidated database edit — the app's own screens would normally stop you from, say, typing a role that doesn't exist. Double-check your spelling before saving.

## Chapter 10 — Creating a Brand-New Admin Account

Chapter 9 covers changing an existing account's role. This chapter covers creating a brand-new administrator account from scratch — including their branch assignment and initial password.

Super Admins can provision new Branch Admins directly from within the web application, with built-in security protections:

### 1. In-Dashboard Creation (Super Admin):
- **Sign in as Super Admin and navigate to Admin → Admins in the sidebar (or via the "More" menu on mobile).
- Click **Add Admin**.
- Enter the new admin's **Full Name** and **Email address**.
- Under **Branch**, select an existing branch from the dropdown, or choose **"+ Create a new branch..."** to enter a new Branch Name and Branch City right there.
- Click **Create Admin**.
- A secure, system-generated **temporary password** is displayed. Copy and provide this password to the new administrator.

### 2. Forced Password Change on First Login:
The temporary password only grants access to a mandatory first-login screen (/change-password-required). The new admin cannot access the admin dashboard or any system data until they choose and confirm their own permanent password. Once submitted, their session is updated immediately and they enter their branch dashboard.

### 3. Command-Line Setup (For Developers):
The terminal provisioning script remains available for developers during initial server deployment or out-of-band setup:
```bash
pnpm provision-admin --role=SUPER_ADMIN --email=name@example.com --password=... --name="Their Name"

pnpm provision-admin --role=BRANCH_ADMIN --email=name@example.com --password=... --name="Their Name" \
  --branch-name="Pokhara" --branch-city="Pokhara"
```

As with in-dashboard creation, any admin provisioned via CLI is also required to update their password on first sign-in. Public website sign-up can only ever create Tutor accounts; only an existing Super Admin or server CLI can create administrators.

# PART IV

Understanding the Codes You'll See

## Chapter 11 — What TS-T-000127 and Codes Like It Mean

Throughout the app and the database, you'll see short codes like TS-T-000127 or TS-TU-000045 attached to tutors, tuition requests, and other records. These are simple, permanent, human-readable reference numbers — the equivalent of an order number or a ticket number. They count up one at a time as new records are created, they never repeat, and they're what you'd read out loud or quote in an email — never the long random internal database ID you saw in Chapter 8, which is just for the system's own internal use.

| Code starts with | What it identifies | Example |
| --- | --- | --- |
| TS-T- | A tutor | TS-T-000127 |
| TS-B- | A branch | TS-B-000001 |
| TS-TU- | A tuition request / opportunity | TS-TU-000045 |
| TS-APP- | One tutor's application to a tuition | TS-APP-000312 |
| TS-ASG- | An assignment (a confirmed placement) | TS-ASG-000089 |
| TS-CONV- | A conversation thread | TS-CONV-000017 |
| TS-P- | A parent | TS-P-000550 |
| TS-CQ- | A public contact inquiry | TS-CQ-000012 |
| TS-SC- | A school partnership enquiry | TS-SC-000008 |

One practical use: the “Message a Tutor” screen in the admin panel asks for a Tutor UID (the TS-T-... code) rather than a name, precisely because it's guaranteed unique and typo-resistant in a way a name isn't.

# PART V

Security and What Was Tested

## Chapter 12 — What Is Protected, and How

- Exact addresses are private until assignment. A parent's exact home address and contact phone number are hidden from tutors browsing opportunities (tutors see only the general locality and branch city). Once an admin formally assigns a tutor to that tuition, the assigned tutor is granted access to the exact address and parent contact details needed to teach. If the tuition is reopened or cancelled, this access is revoked.
- Branch data and opportunities are isolated. A Branch Admin cannot view, message, approve, reject, assign, or suspend anything belonging to another branch — tested live and confirmed blocked, every time. Furthermore, Available Tuitions are strictly scoped to the tutor's own branch city.
- Tutors can't see each other's private data. A tutor cannot view another tutor's CV, withdraw another tutor's application, or read or send messages in a conversation that isn't theirs — tested directly in both directions.
- Suspension is enforced everywhere. A suspended tutor is blocked from every action on the server, not just hidden from the menus they see — tested by attempting to bypass the visible screens entirely.
- Broken logins fail safely. A corrupted or expired login always redirects safely to the sign-in page — it never crashes or shows data it shouldn't.
- No public tutor directory. There is no public page anywhere that lists tutors or lets anyone browse the pool of tutors — the only way to see a specific tutor's details is as an authorized admin, or as the parent an admin has already matched them with.
- Uploaded files are verified, not just trusted. Uploaded CVs and photos are checked against their actual file content, not just the label the browser sent — this specifically closes a known trick where a harmful file is disguised with a “.pdf” name to fool a human reviewer.
- Intrusion attempts are blocked and audited. Anyone attempting to snoop on admin-only routes (/admin/*) without authorization — whether an unauthenticated visitor or a registered tutor — is immediately blocked, redirected to a dedicated /access-denied warning page, and an UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT security event is written to the audit log.
- Revoking access works immediately. Removing someone's access (disabling their account, or forcibly revoking their login) takes effect on their very next action — not just the next time they try to log in.

# PART VI

Hosting and Deployment

## Chapter 13 — What's Needed to Go Live

| Item | Who provides it |
| --- | --- |
| A Firebase project on the Blaze (pay-as-you-go) plan | You / the client — needed for file storage; the rest works on the free plan. |
| A Firebase service account key | Generated from the Firebase Console — kept secret, never shared publicly. |
| A Vercel account with the code repository connected | Whoever manages hosting — Vercel detects this is a Next.js project automatically. |
| A domain name (optional) | You / the client, if a custom web address is wanted. |
| A Google AdSense publisher ID (optional) | You / the client, once an AdSense account exists. |

The tool used to install and build the code (“pnpm”) requires no special knowledge from you — the hosting platform detects and runs it automatically.

## Appendix A — Technical Glossary

You are very unlikely to need these day to day — they're here for completeness, and so you have a reference if a developer uses one of these words and you want to know what they mean, not because you'll need to act on any of it yourself.

| Term | Plain-language meaning |
| --- | --- |
| Firestore | The database — where every piece of information (tutors, requests, messages...) actually lives. |
| Firebase Authentication | The system that handles passwords and logins. |
| Collection / Document | Firestore's version of a folder and a file inside it — e.g. the userAccounts collection holds one document per login. |
| Server action | A piece of code on the app's own server that performs one specific job (like confirming a request) — the website's buttons trigger these rather than talking to the database directly. |
| Emulator Suite | A local, offline copy of Firebase used only for testing during development — never real data, never seen by real users. |
| Session cookie | A small, secure token your browser holds after logging in, so you don't have to log in again on every page. |
| Branch scope / branch-scoped | Restricted to one region's data — what makes a Branch Admin unable to see other branches. |
| Repository / repo | The complete set of the app's code, stored in one place (GitHub) so it can be tracked and deployed. |
| Deploy / deployment | Publishing a new version of the code so real users see it. |
| Environment variable | A setting (like a password or a project ID) kept outside the code itself, so it can differ between your test setup and the real, live site. |

## Appendix B — Getting Help

This handbook, together with a separate technical reference document written for developers (and for AI coding assistants picking up the project), should be enough for someone new to continue this project without you having to explain it from scratch.

If something is behaving unexpectedly and you want to understand what happened before asking a developer, the fastest first check is the auditEvents collection in Firestore (reachable the same way as Chapter 8) — every significant admin decision is logged there with who did it and when.
