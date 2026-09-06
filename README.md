<div align="center">

<img src="public/images/logo.svg" alt="Tuition Serve" width="220" />

# 🎓 Tuition Serve

**Admin-mediated home tuition matching platform**

Connecting verified tutors with families across Nepal — every match reviewed,
every step tracked, nothing left to chance.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![pnpm](https://img.shields.io/badge/pnpm-only-F69220?logo=pnpm&logoColor=white)](https://pnpm.io)
[![License](https://img.shields.io/badge/License-Proprietary-lightgrey)](#-license)

</div>

---

## 📖 Overview

**Tuition Serve** is a full-stack web application that matches home tutors
with students, with every request, application, and assignment mediated by
an admin — there is no unmoderated marketplace. Parents submit a request
without creating an account; tutors apply after completing a verified
onboarding profile; branch and super admins review, confirm, and assign.

The authoritative product, UX, domain, and technical specifications live in
[`docs/`](docs/) — those documents are the source of truth for product
behavior. This README covers the engineering side: stack, setup, and
day-to-day scripts.

## 📑 Table of Contents

- [✨ Features](#-features)
- [🏗️ Tech Stack](#️-tech-stack)
- [🔐 Security Model](#-security-model)
- [📁 Project Structure](#-project-structure)
- [🚀 Getting Started](#-getting-started)
- [🔑 Provisioning Admin Accounts](#-provisioning-admin-accounts)
- [🗺️ Location Data](#️-location-data)
- [📜 Scripts](#-scripts)
- [🧪 Testing & Quality](#-testing--quality)
- [☁️ Deployment](#️-deployment)
- [🧭 Implementation Status](#-implementation-status)
- [📄 License](#-license)

## ✨ Features

<table>
<tr><td valign="top" width="33%">

### 👨‍👩‍👧 For Parents & Schools
- No-account tuition request form — multiple children in one submission
- Typeable, multi-select subject picker (catalog + free text)
- Tutor gender preference, day-range availability picker
- School vacancy postings for institutions
- Province → District → Local Government → Ward location cascade

</td><td valign="top" width="33%">

### 👩‍🏫 For Tutors
- Guided onboarding wizard (personal, education, teaching, location, CV)
- Browse open opportunities with subject/grade/day/location filters
- Apply, track applications by status, and message admins directly
- Withdraw from an active assignment with admin-reviewed reason
- Notification bell with unread badges and deep links

</td><td valign="top" width="33%">

### 🛡️ For Admins
- Branch-scoped review queues (new, open, assigned, rejected, cancelled)
- Transactional, race-safe applicant assignment
- Super Admin can create branches and provision Branch Admins inline
- Full audit log for sensitive/unauthorized actions
- Realtime Admin ↔ Tutor messaging

</td></tr>
</table>

## 🏗️ Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server Actions) |
| Language | TypeScript, end to end |
| UI | React 19 + Tailwind CSS 4 (design tokens mirror the client's reference UI) |
| Validation | [Zod](https://zod.dev) schemas at every server boundary |
| Auth | Firebase Authentication (email/password + Google for tutors; provisioned-only for admins) |
| Database | Firestore — accessed **only** from server code via the Firebase Admin SDK |
| File storage | Firebase Storage (CVs, profile photos) — server-brokered only |
| Testing | [Vitest](https://vitest.dev) |
| Package manager | [pnpm](https://pnpm.io) — no workspaces/monorepo |
| Hosting | [Vercel](https://vercel.com) |

## 🔐 Security Model

- **No client-side Firestore access, ever.** [`firestore.rules`](firestore.rules)
  denies all direct client reads/writes; every query and mutation goes
  through server code using the Admin SDK. This is an explicit, enforced
  rule in the codebase — not a convention.
- **Server-verified sessions.** Login issues an httpOnly session cookie,
  verified on every request with revocation checks (`checkRevoked: true`),
  so a password change invalidates old sessions immediately.
- **Role + branch scoped guards.** Every admin/tutor route and server
  action re-checks role, branch ownership, and account status
  (suspended/active) server-side — never trusts the client.
- **Adversarial-tested.** Cross-branch and cross-tutor ID substitution,
  session-cookie tampering, and suspended-account access are all covered
  by live tests against the Firebase Emulator Suite, not just code review.
- **Intrusion deterrence.** A tutor or anonymous visitor deliberately
  probing admin-only URLs is redirected to a dedicated
  [`/access-denied`](src/app/access-denied) warning page and the attempt
  is written to a permanent audit log — see
  [`src/server/auth/guards.ts`](src/server/auth/guards.ts).

## 📁 Project Structure

```text
src/app/                 Routes — public site, tutor, admin, API routes
src/components/          UI components (public, tutor, admin, shared)
src/lib/firebase/        Firebase client SDK + Admin SDK initialization
src/server/domain/       Firestore collection access, types, UID generation, audit
src/server/actions/      Server Actions — validated mutations
src/server/queries/      Read-side data access, pagination, filters
src/server/auth/         Session cookies, role/branch guards, tutor provisioning
scripts/                 Out-of-band operational scripts (admin provisioning, location import)
data/                    Authoritative location dataset + provenance docs
docs/                    Product/UX/domain/technical specifications
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) (this project does not use npm or yarn)
- [Firebase CLI](https://firebase.google.com/docs/cli) for local emulators

### Install

```bash
pnpm install
cp .env.example .env.local   # then fill in Firebase project values
```

### Run locally

For local development, run the Firebase Emulator Suite (Auth + Firestore +
Storage) alongside the app — no real Firebase credentials are needed while
`NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`:

```bash
pnpm emulators   # terminal 1 — Auth :9099 · Firestore :8080 · Storage :9199 · UI :4000
pnpm dev         # terminal 2 — http://localhost:3000
```

To point at the real `tution-serve` Firebase project instead, set
`NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false` and fill in
`FIREBASE_ADMIN_PROJECT_ID` / `FIREBASE_ADMIN_CLIENT_EMAIL` /
`FIREBASE_ADMIN_PRIVATE_KEY` from a Firebase service account.

## 🔑 Provisioning Admin Accounts

Super Admin and Branch Admin accounts are **never** created through public
signup — they're provisioned out of band:

```bash
pnpm provision-admin --role=SUPER_ADMIN --email=admin@example.com --password=... --name="Ops Admin"

pnpm provision-admin --role=BRANCH_ADMIN --email=jp-admin@example.com --password=... \
  --name="Janakpur Admin" --branch-name="Janakpur" --branch-city="Janakpur"
```

A Super Admin can also create a new branch and its Branch Admin inline from
the **Admins** page in the dashboard.

## 🗺️ Location Data

The authoritative Nepal location hierarchy (Province → District → Local
Government → Ward, with official 2025 GPO postal codes) must be imported
before the Location step / parent request form will show options:

```bash
pnpm import-locations     # imports data/locations/processed/*.json into Firestore
pnpm validate-locations   # verifies hierarchy integrity, counts, postal-code uniqueness
```

See [`data/locations/SOURCES.md`](data/locations/SOURCES.md) for full
provenance, licensing, the source-reconciliation methodology, and known
limitations (English names cover 445/753 local governments; no
locality/tole-level catalog exists officially below ward, so that stays a
free-text field).

> `pnpm seed-locations` still exists but is **superseded** — it wrote the
> old provisional ~20-city dataset. Do not use it for new environments.

## 📜 Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | 🖥️ Start the dev server |
| `pnpm build` | 📦 Production build |
| `pnpm start` | ▶️ Run the production build |
| `pnpm lint` | 🧹 ESLint |
| `pnpm typecheck` | 🔎 `tsc --noEmit` |
| `pnpm test` | ✅ Unit tests (Vitest) |
| `pnpm test:watch` | 👀 Unit tests in watch mode |
| `pnpm emulators` | 🔥 Firebase Auth/Firestore/Storage emulators |
| `pnpm provision-admin --role=... --email=...` | 🔑 Create a Super Admin / Branch Admin account |
| `pnpm import-locations` | 🗺️ Import the authoritative Nepal location hierarchy |
| `pnpm validate-locations` | ✔️ Validate imported location hierarchy integrity |
| `pnpm seed-locations` | ⚠️ *(superseded)* Seed the old provisional province/city data |

## 🧪 Testing & Quality

```bash
pnpm typecheck   # TypeScript, zero errors
pnpm lint        # ESLint
pnpm test        # Vitest unit tests
pnpm build       # Production build — the final gate before every commit
```

Every server action is checked for role, branch, and ownership
authorization; every list page is paginated (cursor-based, 20/page) rather
than fetching full collections.

## ☁️ Deployment

Deployed on [Vercel](https://vercel.com) ([`vercel.json`](vercel.json)).
Production builds must have real Firebase Admin SDK credentials
(`FIREBASE_ADMIN_*`) and `NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false` set in
the project's environment variables — the emulator suite is local-only.

## 🧭 Implementation Status

Tracked in detail in
[`docs/07_Tuition_Serve_Implementation_Plan.md`](docs/07_Tuition_Serve_Implementation_Plan.md);
the commit history is the authoritative changelog. At a glance, the
platform covers the full lifecycle:

`Onboarding & Verification` → `Parent/School Requests` → `Opportunities & Applications`
→ `Assignment` → `Messaging & Notifications` → `Withdrawal / Reopen / Cancel`
→ `Security & Access Control`

along with branch-scoped admin roles, a real Nepal location hierarchy
(7,580 records), and full audit logging of sensitive actions.

## 📄 License

Proprietary — all rights reserved. This is a private client project; no
part of this repository may be reused, redistributed, or published without
explicit permission from the project owner.

---

<div align="center">

Built with ❤️ for connecting tutors and families across Nepal.

</div>
