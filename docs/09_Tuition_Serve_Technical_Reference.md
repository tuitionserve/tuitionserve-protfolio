# Tuition Serve — Technical Reference

**Audience:** a developer or AI assistant picking up this codebase without prior context. This document is the fastest path to a working mental model of the system — read this first, then go to `docs/01`–`07` for the authoritative product/UX/domain specs when you need depth on a specific area, and to the inline code comments for the "why" behind a specific decision.

This document describes the system *as implemented*, not as originally planned — where implementation diverged from `docs/01`–`07` (there are a few places), this document and the code are correct; the numbered spec docs are the original brief.

---

## 1. What this system is, in one paragraph

Tuition Serve is an admin-mediated home tuition matching platform. Parents submit tuition requests through a public, account-free form. An admin (Branch Admin or Super Admin) reviews and confirms the request, which turns it into an open opportunity. Verified tutors (who *do* have accounts, gated by an admin approval workflow) apply. An admin selects one tutor and assigns them. There is no self-service tutor marketplace, no payment processing, and no public tutor directory anywhere in the app.

## 2. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router), React, TypeScript | Server Components by default; `"use client"` only where interactivity is needed. |
| Styling | Tailwind CSS v4 | Custom design tokens via `tailwind.config.ts` loaded through `@config` in `globals.css`. **See the gotcha in §8.** |
| Database | Cloud Firestore | Database of record. **No client SDK reads/writes anywhere** — `firestore.rules`/`storage.rules` deny all direct client access. Every read/write goes through server code using the Admin SDK. |
| Auth | Firebase Authentication | Email/password + Google for tutors; Super Admin/Branch Admin accounts are provisioned out-of-band, never via public signup. |
| File storage | Firebase Storage | Private CVs/photos; access only via short-lived signed URLs generated server-side. |
| Package manager | pnpm | No monorepo/workspace — this is a single Next.js app. |
| Motion | Framer Motion | Wrapped in `MotionProvider` (`reducedMotion="user"`) so `prefers-reduced-motion` strips transforms but keeps opacity fades. |

## 3. Directory map

```
src/app/                 Routes — public site, /tutor/*, /admin/*, /api/auth/*
src/components/          UI components, grouped by audience (public/tutor/admin/shared/ui)
src/lib/firebase/        Firebase client SDK + Admin SDK initialization
src/lib/                 Client-safe constants (catalog.ts, pagination.ts, location.ts) —
                          deliberately Firebase-free, see §8 for why this split exists
src/server/domain/       Firestore collection accessors, types.ts (the central schema),
                          ids.ts/uid-format.ts (UID generation), audit.ts, documents.ts
src/server/auth/         Session cookie handling, guards.ts (requireSession/requireRole/
                          requireActiveTutor/assertBranchScope), provisioning.ts
src/server/actions/      "use server" mutations — one file per feature area
src/server/queries/      Read-only data-fetching for pages (pagination, projections)
scripts/                 Out-of-band CLI scripts (provision-admin, import-locations, etc.)
docs/                    01-07: original product/UX/domain/TRD specs. 08: client handbook
                          (.docx). 09: this file.
```

## 4. Roles and authorization — the exact mechanics

### 4.1 Role values

The `Role` type (`src/server/domain/types.ts`) is exactly:

```ts
export type Role = "SUPER_ADMIN" | "BRANCH_ADMIN" | "TUTOR";
```

There is no `PARENT` or `STUDENT` role — parents and students are plain Firestore documents (`parents`, `students` collections) created when a tuition request is submitted; they never have a login.

### 4.2 Where a role lives

Every login identity has exactly one `UserAccount` document in the `userAccounts` collection, **keyed by the Firebase Auth UID** (i.e. the document ID *is* the UID — not a separate field to search for):

```ts
export interface UserAccount {
  id: string;                 // == Firebase Auth UID, and == the document ID
  authProviderUid: string;
  email: string | null;
  role: Role;
  branchId: string | null;    // required for BRANCH_ADMIN, null for SUPER_ADMIN/TUTOR
  accountStatus: "ACTIVE" | "DISABLED";
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

A `TUTOR` account additionally has a `tutors/{uid}` document (same ID) carrying `verificationStatus`, `branchId` (resolved by location, not chosen by the tutor), etc.

### 4.3 How a role is assigned

- **Public registration** (`ensureTutorAccount` in `src/server/auth/provisioning.ts`) hardcodes `role: "TUTOR"`. This is the *only* self-service path, and it cannot produce anything but a Tutor.
- **Admin accounts** (`SUPER_ADMIN`, `BRANCH_ADMIN`) are never created by any UI flow. They exist only via `scripts/provision-admin.ts`, run out-of-band:
  ```bash
  pnpm provision-admin --role=SUPER_ADMIN --email=... --password=... --name="..."
  pnpm provision-admin --role=BRANCH_ADMIN --email=... --password=... --name="..." \
    --branch-name="Kathmandu" --branch-city="Kathmandu"
  ```
  The Branch Admin variant creates the `Branch` document too if `--branch-name` doesn't already exist. This script creates **both** the Firebase Auth identity and the Firestore `userAccounts` document in one step — it is not a database edit, it's account creation.
- **Changing an existing user's role** (e.g. promoting a Branch Admin to Super Admin) *is* a direct Firestore edit — see `docs/08` (client handbook) §"Managing Accounts and Roles" for the console walkthrough. The short version: find the account by its Firebase Auth UID (Authentication tab → search by email → copy UID), open `userAccounts/{that UID}` in Firestore, edit the `role` field. If assigning `BRANCH_ADMIN`, also set `branchId` to a real document ID in the `branches` collection — a `BRANCH_ADMIN` with `branchId: null` will fail every branch-scoped check.

### 4.4 Enforcement — `src/server/auth/guards.ts`

Every protected Server Component and every server action starts with one of:

- `requireSession()` — any authenticated identity; returns `null`-safe session or redirects to `/login`.
- `requireRole(["SUPER_ADMIN", "BRANCH_ADMIN"])` — role allowlist.
- `requireActiveTutor()` — role must be TUTOR *and* `verificationStatus !== "SUSPENDED"`; redirects suspended tutors to `/suspended`.
- `assertBranchScope(session, resourceBranchId)` — throws unless `session.role === "SUPER_ADMIN"` or `session.branchId === resourceBranchId`. **This is the single choke point for every branch-isolation guarantee in the app** — a Branch Admin cannot see or act on another branch's tutors, tuition requests, applications, or conversations. Verified via live adversarial testing (cross-branch ID substitution on every mutating action) during the M13 security pass — see commit history / `docs/08` for the summary.

One nuance worth knowing: messaging (`startOrGetConversation` in `src/server/actions/messaging.ts`) scopes by the **tutor's own `branchId`**, not the tuition's branch. Since tutor applications are allowed to cross branches (no hard location wall), a Branch Admin reviewing applicants to their own confirmed tuition can hit "You cannot message a tutor outside your branch" for an applicant whose home branch differs from theirs. This is original M9 behavior, not a bug — flagged here because it's a common point of confusion.

## 5. The UID system

Two different identifiers exist for most entities — do not confuse them:

| | Firestore document ID | Public UID (`TS-...`) |
|---|---|---|
| Example | `dda11OI7pmfDA5xqo9gS` | `TS-B-000001` |
| Generated by | Firestore, opaque, random | `generateSequentialUid()`, sequential |
| Used for | Internal references (`tutorId`, `branchId` fields, URLs) | Display to users, support conversations, search-by-UID (e.g. the "Message a Tutor" form takes a Tutor UID) |
| Guessable / enumerable? | No | Yes (sequential) — this is fine, since the UID is never itself a secret or an access token; every read is still gated by `requireRole`/`assertBranchScope` |

Generation mechanism (`src/server/domain/ids.ts` + `uid-format.ts`): a Firestore **transaction** increments a per-kind counter document in the `counters` collection, then formats it as `{prefix}{number padded to 6 digits}`. The transaction is what makes it collision-safe under concurrent requests — two simultaneous tutor registrations cannot receive the same UID.

Full prefix table (`UID_PREFIXES` in `uid-format.ts`):

| Kind | Prefix | Example |
|---|---|---|
| Tutor | `TS-T-` | `TS-T-000127` |
| Branch | `TS-B-` | `TS-B-000001` |
| Tuition (request/opportunity) | `TS-TU-` | `TS-TU-000045` |
| Application | `TS-APP-` | `TS-APP-000312` |
| Assignment | `TS-ASG-` | `TS-ASG-000089` |
| Profile change (audit) | `TS-PC-` | `TS-PC-000004` |
| Conversation | `TS-CONV-` | `TS-CONV-000017` |
| Parent | `TS-P-` | `TS-P-000550` |

## 6. Data model — collections at a glance

See `docs/05_Tuition_Serve_Domain_Model_and_Database_Schema.md` for the authoritative schema. Quick orientation:

- `userAccounts`, `tutors`, `tutorProfiles`, `tutorDocuments` — identity, verification state, profile content, CV/photo metadata (files themselves live in Storage, not Firestore).
- `parents`, `students` — created only on tuition-request submission, no login.
- `tuitionRequests` — the core object; `status` moves `NEW → OPEN → ASSIGNED` (or `REJECTED`), with `assignedApplicationId` set once assigned. `exactAddress` is private (admin-only); `tutorVisibleLocality` is the free-text area shown to tutors.
- `tutorApplications` — one per (tutor, tuition) pair; carries a **frozen `snapshot`** of the tutor's profile at application time (`TutorApplicationSnapshot`) so a later profile edit never retroactively changes what an admin evaluated.
- `tuitionAssignments` — created when a tutor is assigned; tracks withdrawal requests/approvals; a tuition can have more than one assignment over its lifetime (reassignment after a withdrawal + reopen).
- `branches`, `geographicLocations` (Province → District → Local Government → Ward, ~7,580 records, see `data/locations/SOURCES.md` for provenance), `conversations`/`messages`, `notifications`, `auditEvents` (every significant admin decision, for accountability).

## 7. Pagination

Firestore has no numeric offset pagination. Every list page uses `fetchPage()` (`src/server/domain/pagination.ts`): cursor tokens of the form `${sortValueMillis}_${docId}`, with `.count()` aggregation queries for the "Showing X–Y of Z" total (never a full-collection read just to count). `DEFAULT_PAGE_SIZE` (20) lives in `src/lib/pagination.ts` specifically so it can be imported from Client Components — see §8.

## 8. Known gotchas (read this before you hit them again)

- **Client/server import boundary.** Any Client Component (`"use client"`) that imports a *value* (not just a type) from a module which also imports `firebase-admin` at module scope will break `pnpm build` with an obscure Turbopack bundling error — and `pnpm typecheck` will **not** catch it. Fix: client-safe constants/types live in `src/lib/` (Firebase-free); server modules re-export from there. Always run `pnpm build`, not just typecheck, before considering a change done.
- **Tailwind spacing-scale collision.** `tailwind.config.ts` extends `theme.spacing` with short keys (`sm`, `md`, `lg`, `xl`) for the design system's own gap/padding scale (`gap-lg`, `p-lg`, etc. — intentional). In Tailwind v4, extending the spacing scale silently redefines *every* utility that shares that scale across *every* property, including `max-w-sm/md/lg/xl`, `w-*`, `h-*`. If you write `max-w-lg` expecting Tailwind's standard ~32rem, you'll get 24px instead. Use an explicit arbitrary value (`max-w-[32rem]`) whenever you want Tailwind's own named size rather than the design system's spacing token.
- **`firebase-admin` + Turbopack production build.** `firebase-admin`'s auth module pulls in `jwks-rsa` → `jose` (pure ESM), which breaks at runtime on Vercel with `require() of ES Module ... not supported` because Turbopack bundles it into the serverless function by default. Fixed via `serverExternalPackages: ["firebase-admin"]` in `next.config.ts` — don't remove this.
- **File upload validation.** `src/server/domain/documents.ts` validates both the claimed MIME type *and* the actual file's magic bytes (not just `File.type`, which is client-supplied and trivially spoofable) before accepting a CV/photo upload. If you add a new accepted file type, add its signature to `MAGIC_BYTES` too, not just `LIMITS`.
- **Onboarding wizard hydration.** A `TutorProfile` Firestore document that hasn't reached later onboarding steps has `subjects`/`grades`/`availability` entirely *absent*, not `[]`. Anything that reads these fields — from either the server actions or the wizard's page-level hydration (`src/app/tutor/onboarding/page.tsx`) — must default with `?? []`, or a returning tutor resuming a partial profile will crash the wizard (`undefined.map()`/`undefined.includes()`).
- **Devtest routes.** Server Actions can't be invoked over plain `curl` (they require Next's internal `Next-Action` protocol). The established pattern for adversarial/integration testing against the Emulator Suite is a temporary `src/app/api/devtest-*/route.ts` handler that imports and calls the real action/query functions directly, using the real cookie-derived session from the incoming request (auth is never forged). **Always delete these before committing** — grep `git status` for `devtest-` before any commit.

## 9. Local development

```bash
pnpm install
pnpm emulators   # Auth :9099, Firestore :8080, Storage :9199, UI :4000
pnpm dev         # separate terminal — http://localhost:3000
```

`.env.local` with `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true` points every Firebase client (both browser SDK and Admin SDK, see `src/lib/firebase/admin.ts`) at the local emulators — no real credentials needed for local work. Seed location data with `pnpm import-locations` before testing anything location-dependent (tutor onboarding, parent request form).

## 10. Security posture (summary — full detail in the M13 commit and `docs/08`)

- Firestore/Storage security rules deny all direct client access unconditionally — every authorization decision happens in server code, never in rules.
- Every action that takes an ID as a parameter has been adversarially tested with a real cross-account/cross-branch ID substitution (not just reasoned about) — see the git log around the "M13" and "Fix two real production/crash bugs" commits for the specific battery.
- IDOR defense pattern: helpers that return an identical generic error ("not found") whether a resource doesn't exist or the caller isn't authorized to see it, so an attacker can't distinguish the two cases.
