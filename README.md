# Crew Desk

Crew Desk is a modular enterprise operations platform for internal HR, inventory, gear desk, production planning, approvals, notifications, and reporting workflows.

This repository currently contains **Phases 1-10**: project setup, Docker, Directus, PostgreSQL, authentication plumbing, user management, roles, permissions, admin directory screens, inventory/asset management, Gear Desk reservations, leave management, production planning, notifications/automation foundations, reporting analytics, testing/optimization foundations, and deployment preparation.

## Stack

- Next.js 16.2.6
- React 19.2.6
- TypeScript
- TailwindCSS 4
- ShadCN-style UI primitives
- Directus 11.17.4
- PostgreSQL 16
- Docker Compose

## Quick Start

1. Create an environment file:

```bash
cp .env.example .env
```

2. Update `.env` secrets and admin credentials.

3. Install dependencies:

```bash
npm install
```

4. Start Directus and PostgreSQL:

```bash
docker compose up -d postgres directus
```

5. Start the frontend:

```bash
npm run dev
```

6. Bootstrap Phase 2 roles and profile fields:

```bash
npm run directus:bootstrap:phase2
```

7. Bootstrap Phase 3 inventory collections:

```bash
npm run directus:bootstrap:phase3
```

8. Bootstrap Phase 4 Gear Desk collections:

```bash
npm run directus:bootstrap:phase4
```

9. Bootstrap Phase 5 leave collections:

```bash
npm run directus:bootstrap:phase5
```

10. Bootstrap Phase 6 production collections:

```bash
npm run directus:bootstrap:phase6
```

11. Bootstrap Phase 7 notifications and automation collections:

```bash
npm run directus:bootstrap:phase7
```

12. Bootstrap Phase 8 reporting collections:

```bash
npm run directus:bootstrap:phase8
```

13. Open:

- Frontend: `http://localhost:3000`
- Directus: `http://localhost:8055`

Use the Directus admin credentials from `.env` to sign in.

## Docker Full Stack

After `package-lock.json` exists, the full stack can run with:

```bash
docker compose up --build
```

## Production Deployment

Create `.env.production` from the production template, update all secrets, and start the hardened Compose overlay:

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

See the [Production Deployment Runbook](docs/deployment/production.md) for HTTPS, backup, restore, and go-live guidance.

## Quality Gate

Run the full local quality gate before committing production changes:

```bash
npm run quality
```

This runs type checking, linting, unit tests, and the production build.

## Phase Plan

1. Project setup, Docker, Directus, PostgreSQL, authentication - complete
2. User management, roles, and permissions - complete
3. Inventory module - complete
4. Gear desk module - complete
5. Leave management - complete
6. Production planning - complete
7. Notifications and workflows - complete
8. Reporting and analytics - complete
9. Testing and optimization - complete
10. Deployment - complete

## Documentation

- [Phase 1 Architecture](docs/architecture/phase-1.md)
- [Phase 2 Architecture](docs/architecture/phase-2.md)
- [Phase 3 Architecture](docs/architecture/phase-3.md)
- [Phase 4 Architecture](docs/architecture/phase-4.md)
- [Phase 5 Architecture](docs/architecture/phase-5.md)
- [Phase 6 Architecture](docs/architecture/phase-6.md)
- [Phase 7 Architecture](docs/architecture/phase-7.md)
- [Phase 8 Architecture](docs/architecture/phase-8.md)
- [Phase 9 Testing & Optimization](docs/architecture/phase-9.md)
- [Phase 10 Deployment](docs/architecture/phase-10.md)
- [Production Deployment Runbook](docs/deployment/production.md)
- [Directus Setup](directus/README.md)
