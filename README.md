# Tuition Serve

Admin-mediated home tuition matching web application. See `docs/` for the
authoritative product/UX/domain/technical specifications and
`.agents/skills/` for implementation guardrails — those documents are the
source of truth for product behavior.

## Stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS (design tokens mirror the client-supplied public UI reference,
  `tuition_serve_home (3).html`)
- Firebase Authentication (email/password + Google) for tutors; provisioned
  accounts only for Super Admin / Branch Admin
- Firestore as the database of record, accessed only from server code via
  the Firebase Admin SDK — Firestore security rules deny all direct client
  access (`firestore.rules`), so every authorization/branch/lifecycle check
  happens on the server
- Firebase Storage for private documents (CVs, profile photos), also
  server-brokered only

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in Firebase project values
```

For local development, run the Firebase Emulator Suite (Auth + Firestore +
Storage) alongside the app — no real Firebase credentials are needed while
`NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true`:

```bash
pnpm emulators   # terminal 1 — Auth :9099, Firestore :8080, Storage :9199, UI :4000
pnpm dev         # terminal 2 — http://localhost:3000
```

To point at the real `tution-serve` Firebase project instead, set
`NEXT_PUBLIC_USE_FIREBASE_EMULATORS=false` and fill in
`FIREBASE_ADMIN_PROJECT_ID` / `FIREBASE_ADMIN_CLIENT_EMAIL` /
`FIREBASE_ADMIN_PRIVATE_KEY` from a Firebase service account.

## Provisioning admin accounts

Super Admin and Branch Admin accounts are never created through public
signup. Provision them out of band:

```bash
pnpm provision-admin --role=SUPER_ADMIN --email=admin@example.com --password=... --name="Ops Admin"

pnpm provision-admin --role=BRANCH_ADMIN --email=jp-admin@example.com --password=... \
  --name="Janakpur Admin" --branch-name="Janakpur" --branch-city="Janakpur"
```

## Location data

The authoritative Nepal location hierarchy (Province → District → Local
Government → Ward, with official 2025 GPO postal codes) must be imported
before the Location step / parent request form will show options:

```bash
pnpm import-locations     # imports data/locations/processed/*.json into Firestore
pnpm validate-locations   # verifies hierarchy integrity, counts, postal-code uniqueness
```

See `data/locations/SOURCES.md` for full provenance, licensing, the exact
source-reconciliation methodology, and known limitations (English names
cover 445/753 local governments; no locality/tole-level catalog exists
officially below ward — that stays a free-text field, as it did
provisionally since M3).

`pnpm seed-locations` still exists but is **superseded** — it wrote the
M3-era provisional ~20-city dataset, kept in Firestore (not deleted) only
until the application is fully validated against the M6 dataset above.
Do not use it for new environments.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm emulators` | Firebase Auth/Firestore/Storage emulators |
| `pnpm provision-admin --role=... --email=...` | Create a Super Admin / Branch Admin account |
| `pnpm import-locations` | Import the authoritative Nepal location hierarchy |
| `pnpm validate-locations` | Validate imported location hierarchy integrity |
| `pnpm seed-locations` | (superseded) Seed M3's provisional province/city data |

## Project structure

```text
src/app/                 Routes (public site, tutor, admin, API routes)
src/components/          UI components (public, tutor, admin, shared)
src/lib/firebase/        Firebase client SDK + Admin SDK initialization
src/server/domain/       Firestore collection access, types, UID generation, audit
src/server/auth/         Session cookies, role/branch guards, tutor provisioning
scripts/                 Out-of-band operational scripts (admin provisioning)
docs/                    Authoritative product/UX/domain/technical specs
.agents/skills/          Engineering guardrail skills
```

## Implementation status

Tracks `docs/07_Tuition_Serve_Implementation_Plan.md`. See project history /
commit log for what has landed:

- **M1 Foundation**, **M2 Authentication + Roles**
- **M3 Tutor Onboarding** — profile wizard (personal, education, teaching,
  preferred location, availability, CV, submit-for-review)
- **M4 Verification** — admin review queue, approve/reject with mandatory
  reason, reapplication after rejection, one-time approval banner
- **M5 Parent Requests** — public tuition request form (no account),
  Parent/Student/TuitionRequest records with private-address vs.
  tutor-visible-locality separation, branch routing, admin confirm/reject
  queue
- **M6 Location** — authoritative Province/District/Local
  Government/Ward hierarchy (7,580 records) sourced from the Government
  of Nepal's 2025 postal code table, with a Province → District → Local
  Government → Ward cascading selector replacing the M3 flat city
  picker everywhere. See `data/locations/SOURCES.md`.
- **M7 Opportunities** — confirming a request now transitions it
  straight to OPEN (the confirmed request *is* the opportunity); tutor
  Available Tuitions browser with subject/grade/day/location filters
  (never a hard location wall) and a detail page that never exposes the
  exact address.
- **M8 Applications** — apply/withdraw, duplicate-active-application
  prevention, a frozen profile+CV snapshot per application (verified:
  later profile edits do not retroactively change it), My Applications,
  and an admin applicant list with per-applicant CV access.
- **M9 Messaging** — simple Admin↔Tutor conversations (one per
  tutor/branch pair), poll-refreshed threads, unread counts, branch/
  ownership-scoped access.
- **M10 Assignment** — admin selects one applicant; transactional,
  race-safe (re-verified inside one Firestore transaction); closes the
  opportunity and rejects the other applicants atomically.
- **M11 Withdrawal/Reopen** — post-assignment withdrawal request +
  admin review, releasing an assignment without deleting it, and an
  explicit "Reopen Tuition" action — full assignment history (original +
  any later reassignment) is preserved and verified to coexist.
- **M12 Notifications** — a real notification list/bell (unread badge,
  mark read/mark all read, deep-links to the related entity) replacing
  the earlier static placeholder, plus admin suspend/reactivate (a gap
  from M4 surfaced while wiring this milestone's event coverage).
- Every list page across the app (tutor review queue, tuition request
  queues, opportunity browser, applications, conversations,
  notifications) is paginated (TRD NFR-008) rather than fetching full
  collections — 20 per page, cursor-based, "Showing X-Y of Z" + Previous/
  Next.

- **M13 Security/QA** — static review of every server action for
  auth/branch/ownership checks, plus live adversarial testing against the
  Emulator Suite: cross-branch and cross-tutor ID substitution on every
  mutating action and detail page, suspended-tutor gating enforced both
  server-side (in the action) and at the page level, session-cookie
  tampering fails closed, and `TuitionRequest.exactAddress` hardened
  into a type-excluded tutor-facing view (`MyApplicationTuitionView`),
  matching the pattern already used for opportunities/applicants.
- `robots.txt` / `sitemap.xml` added (public routes only — `/tutor` and
  `/admin` are disallowed); `ads.txt` is a placeholder pending the
  client's AdSense publisher ID; gender is Male/Female only per the
  client's request for a local-market platform.

Remaining: **M14 (Mobile/Performance/Motion)** — full mobile-responsive
pass, performance optimization, and Apple-style motion/animation on the
public homepage — and **M15 (Production)**, which is mostly configuration
and needs real credentials (Firebase service account, Storage Blaze
upgrade, Vercel deploy) rather than more code. Bilingual English/Nepali
UI is queued as its own follow-up pass.
