# Crew Desk

Crew Desk is a modular enterprise operations platform for internal HR, inventory, gear desk, production planning, approvals, notifications, and reporting workflows.

This repository currently contains **Phases 1-4**: project setup, Docker, Directus, PostgreSQL, authentication plumbing, user management, roles, permissions, admin directory screens, inventory/asset management, and Gear Desk reservations.

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

9. Open:

- Frontend: `http://localhost:3000`
- Directus: `http://localhost:8055`

Use the Directus admin credentials from `.env` to sign in.

## Docker Full Stack

After `package-lock.json` exists, the full stack can run with:

```bash
docker compose up --build
```

## Phase Plan

1. Project setup, Docker, Directus, PostgreSQL, authentication - complete
2. User management, roles, and permissions - complete
3. Inventory module - complete
4. Gear desk module - complete
5. Leave management
6. Production planning
7. Notifications and workflows
8. Reporting and analytics
9. Testing and optimization
10. Deployment

## Documentation

- [Phase 1 Architecture](docs/architecture/phase-1.md)
- [Phase 2 Architecture](docs/architecture/phase-2.md)
- [Phase 3 Architecture](docs/architecture/phase-3.md)
- [Phase 4 Architecture](docs/architecture/phase-4.md)
- [Directus Setup](directus/README.md)
