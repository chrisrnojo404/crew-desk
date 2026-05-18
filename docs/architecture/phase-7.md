# Phase 7 Architecture

## Goal

Phase 7 adds notifications and automation foundations. Directus stores in-app notifications, automation rule metadata, and normalized workflow events. Directus Flows can use these collections to trigger in-app, email, and future WhatsApp notifications.

## Directus Collections

- `internal_notifications`: recipient-facing notification records with module, event type, channel, status, and action URL.
- `automation_rules`: configurable automation catalog for leave, gear desk, inventory, maintenance, and production events.
- `workflow_events`: event ledger for approval and automation activity.

Run the bootstrap after Phase 2:

```bash
npm run directus:bootstrap:phase7
```

## Frontend Routes

- `/notifications`: notification inbox, automation rule summary, workflow event summary.

## Seed Automation Rules

- Leave approval notification
- Leave HR confirmation
- Gear request notification
- Overdue equipment alert
- Maintenance reminder
- Production assignment notification

## Directus Flows Strategy

Directus Flows should create `workflow_events` and `internal_notifications` when module records change status. Email delivery can be attached by adding a Flow operation after the notification row is created. WhatsApp can be added later as a channel-specific operation without changing the frontend model.
