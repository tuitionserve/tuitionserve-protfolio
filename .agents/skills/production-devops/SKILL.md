# Production DevOps Skill

## Purpose

Keep deployment, environments, secrets, migrations, storage, notifications, logging, and operational behavior production-safe.

## Environments

Separate:

- local/development
- test/preview
- production

Never use production credentials in local development.

## Secrets

Never commit:

- auth secrets
- database URLs
- service keys
- storage credentials
- notification provider secrets
- OAuth secrets

Use environment configuration.

## Database Migrations

Every schema change must be represented by a reproducible migration.

Before production:

1. Back up.
2. Verify migration ordering.
3. Test migration on representative data.
4. Apply migration.
5. Verify critical tables and constraints.

## Storage

Treat CVs and other private files as protected storage.

Do not use public buckets merely because public URLs are easier.

## Observability

Production should provide enough logging to diagnose:

- authentication failures
- authorization failures
- failed state transitions
- file upload failures
- notification failures
- message failures
- database errors

Do not log sensitive personal data unnecessarily.

## Deployment Safety

Before release:

- build succeeds
- type checks pass
- lint checks pass where configured
- tests pass
- migrations are ready
- environment variables are present
- authentication works
- critical E2E flows pass

## Rollback

Know how to:

- roll back application code
- recover from failed migrations
- disable a failing integration
- preserve database consistency

Do not roll back application code blindly across incompatible schema changes.
