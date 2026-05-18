# Phase 10 - Deployment

Phase 10 prepares Crew Desk for production deployment with Docker Compose, environment templates, operational backup scripts, and a deployment runbook.

## Deployment Assets

- `.env.production.example` defines production-only URLs, secrets, CORS, and service ports.
- `docker-compose.prod.yml` overlays the development Compose file with production environment wiring.
- `.dockerignore` keeps local build artifacts, secrets, uploads, and Git metadata out of Docker builds.
- `docs/deployment/production.md` documents deployment, health checks, HTTPS, backups, CI/CD, and go-live checks.

## Runtime Topology

- `web` runs the Next.js standalone server.
- `directus` provides authentication, CMS collections, REST, GraphQL support, permissions, flows, and file uploads.
- `postgres` stores Directus system tables and all operations module collections.
- A reverse proxy should terminate HTTPS and route traffic to the frontend and Directus services.

## Backup Strategy

- PostgreSQL is backed up with `scripts/deploy/backup-postgres.sh`.
- Database restores use `scripts/deploy/restore-postgres.sh`.
- Directus uploads must be backed up separately from the uploads volume.
- Production operators should schedule backups and periodically perform restore tests.

## Release Gate

Before deployment, run:

```bash
npm run quality
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml config
```

Production releases should only proceed when the local quality gate and GitHub Actions quality workflow pass.
