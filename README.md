# Crew Desk

Crew Desk is a modular enterprise operations platform for internal HR, inventory, gear desk, production planning, approvals, notifications, and reporting workflows.

This repository currently contains **Phase 1 only**: project setup, Docker, Directus, PostgreSQL, frontend shell, and authentication plumbing.

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

6. Open:

- Frontend: `http://localhost:3000`
- Directus: `http://localhost:8055`

Use the Directus admin credentials from `.env` to sign in.

## Docker Full Stack

After `package-lock.json` exists, the full stack can run with:

```bash
docker compose up --build
```

## Phase Plan

1. Project setup, Docker, Directus, PostgreSQL, authentication
2. User management, roles, and permissions
3. Inventory module
4. Gear desk module
5. Leave management
6. Production planning
7. Notifications and workflows
8. Reporting and analytics
9. Testing and optimization
10. Deployment

## Documentation

- [Phase 1 Architecture](docs/architecture/phase-1.md)
- [Directus Setup](directus/README.md)
