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
commit log for what has landed; M1 (Foundation) and M2 (Authentication +
Roles) are the current baseline. Later milestones (tutor onboarding,
verification, parent requests, location, opportunities, applications,
messaging, assignment, withdrawal/reopen, notifications) are not yet built.
