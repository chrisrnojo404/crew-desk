# Directus Phase 1 Setup

Phase 1 uses Directus as the backend CMS, authentication provider, REST API, GraphQL API, file service, activity log, and RBAC foundation.

## Services

- PostgreSQL stores Directus system tables and future enterprise module collections.
- Directus runs on `http://localhost:8055`.
- The default admin user comes from `.env`.

## Initial Admin Steps

1. Start the stack with `docker compose up -d postgres directus`.
2. Open `http://localhost:8055`.
3. Sign in with `DIRECTUS_ADMIN_EMAIL` and `DIRECTUS_ADMIN_PASSWORD`.
4. Rotate the generated development passwords before any shared environment.
5. Create the Phase 1 roles:
   - Employee
   - Manager
   - HR
   - Gear Desk Officer
   - Inventory Officer
   - Production Coordinator
   - Admin

## Snapshot Strategy

Directus schema snapshots should be exported into `directus/snapshots` once collections and permissions are configured:

```bash
npx directus schema snapshot ./directus/snapshots/phase-1.yaml
```

In later phases, each module should ship a matching Directus schema snapshot plus a short migration note.
