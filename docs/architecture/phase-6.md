# Phase 6 Architecture

## Goal

Phase 6 adds production and field operations planning. The module connects productions to employees, scheduled activities, gear requests, and inventory assets.

## Directus Collections

- `productions`: title, type, status, location, schedule, coordinator, linked gear request.
- `production_assignments`: employee assignments and production roles.
- `production_activities`: scheduled activities, locations, and status tracking.
- `production_assets`: assigned gear, vehicles, and inventory assets.

Run the bootstrap after Phase 4:

```bash
npm run directus:bootstrap:phase6
```

## Frontend Routes

- `/productions`: production dashboard, KPIs, filters, upcoming activities.
- `/productions/new`: production planning form.
- `/productions/[id]`: production detail, crew, schedule, assets, and notes.

## Production Types

The UI supports interviews, news coverage, events, documentaries, broadcasts, and livestreams. Directus stores this as a flexible string so organizations can add their own taxonomy later.

## Status Model

- planned
- approved
- active
- completed
- cancelled
