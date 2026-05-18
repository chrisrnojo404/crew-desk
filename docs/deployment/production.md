# Production Deployment

This runbook deploys Crew Desk with Docker Compose, PostgreSQL, Directus, and the standalone Next.js server.

## Prerequisites

- Docker Engine with the Compose plugin.
- A Linux host or container platform with persistent volumes.
- DNS records for the frontend and Directus admin/API URLs.
- A reverse proxy or load balancer that terminates HTTPS.

## Environment

Create a production environment file from the template:

```bash
cp .env.production.example .env.production
```

Update every secret before deployment:

- `DIRECTUS_KEY`
- `DIRECTUS_SECRET`
- `DIRECTUS_ADMIN_PASSWORD`
- `POSTGRES_PASSWORD`
- public frontend and Directus URLs
- CORS origin

Never commit real production secrets.

## Deploy

Build and start the production stack:

```bash
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

Run Directus bootstrap scripts after first deployment:

```bash
npm ci
npm run directus:bootstrap:phase2
npm run directus:bootstrap:phase3
npm run directus:bootstrap:phase4
npm run directus:bootstrap:phase5
npm run directus:bootstrap:phase6
npm run directus:bootstrap:phase7
npm run directus:bootstrap:phase8
```

## Health Checks

Check running services:

```bash
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 web
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 directus
```

Verify:

- frontend loads at `NEXT_PUBLIC_APP_URL`
- Directus loads at `DIRECTUS_PUBLIC_URL`
- login works
- file uploads persist
- reports page loads

## HTTPS and Reverse Proxy

Put both exposed services behind HTTPS:

- frontend: route public users to the `web` service port
- Directus: route admin/API traffic to the `directus` service port
- preserve websocket upgrade headers for Directus realtime features
- set request body limits high enough for asset uploads

## Backups

Run PostgreSQL backups from the deployment host:

```bash
BACKUP_DIR=/var/backups/crew-desk scripts/deploy/backup-postgres.sh
```

Restore a backup:

```bash
scripts/deploy/restore-postgres.sh /var/backups/crew-desk/crew-desk-YYYYMMDD-HHMMSS.sql.gz
```

Also back up the Directus uploads volume because database backups do not include uploaded files.

## CI/CD

The GitHub Actions quality workflow runs:

- `npm ci`
- `npm run typecheck`
- `npm run lint`
- `npm run test:run`
- `npm run build`

Production deployment should only happen after this workflow passes on `main`.

## Production Checklist

- [ ] Replace all default secrets.
- [ ] Configure DNS and HTTPS.
- [ ] Restrict PostgreSQL to the Docker network.
- [ ] Confirm Directus CORS origin matches the frontend URL.
- [ ] Run all Directus bootstrap scripts.
- [ ] Create the first admin account and rotate temporary passwords.
- [ ] Verify RBAC policies in Directus.
- [ ] Schedule database and uploads backups.
- [ ] Review npm audit findings before go-live.
- [ ] Monitor logs, disk usage, CPU, memory, and backup success.
