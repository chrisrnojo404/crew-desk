# Phase 1 Architecture

## Goal

Phase 1 establishes the production foundation for Crew Desk without implementing every business module. The result is a modular shell that can safely grow into leave management, inventory, gear reservations, production planning, approvals, notifications, and reporting.

## Runtime Architecture

- `web`: Next.js 16 application with TypeScript, TailwindCSS, ShadCN-style primitives, dark mode, and server-side auth routes.
- `directus`: Directus 11 CMS/API/auth service with REST, GraphQL, RBAC, files, flows, activity logs, and realtime support enabled.
- `postgres`: PostgreSQL 16 database for Directus and future module collections.

## Authentication Model

Directus remains the identity authority. The frontend posts credentials to `/api/auth/login`, which proxies to Directus and stores the returned access and refresh tokens as HTTP-only cookies.

This keeps JWTs out of browser-managed local storage and gives the Next.js app a single place to add refresh, logout, MFA, audit, and session policy later.

## Modular Frontend Layout

The frontend uses feature folders under `src/features`. Phase 1 includes only `auth`. Future phases should add:

- `src/features/inventory`
- `src/features/gear-desk`
- `src/features/leave`
- `src/features/productions`
- `src/features/notifications`
- `src/features/reports`
- `src/features/audit`

Shared UI stays under `src/components`, shared service clients under `src/lib`, and module registry metadata under `src/config`.

## Security Baseline

- HTTP-only cookies for Directus access and refresh tokens.
- Server-side Directus calls use `DIRECTUS_INTERNAL_URL`.
- Directus CORS is limited to the frontend dev origin.
- Directus admin credentials are environment-driven.
- Production must replace all development secrets, enforce TLS, set strict CORS origins, and place Directus behind a reverse proxy or private network.

## Phase 1 Acceptance Criteria

- Docker Compose starts PostgreSQL and Directus.
- Next.js app builds with TypeScript.
- User can log in with a Directus account.
- Authenticated users can access `/dashboard`.
- Unauthenticated users are redirected to `/login`.
- Dark mode and responsive application shell are present.
