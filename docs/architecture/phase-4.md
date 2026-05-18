# Phase 4 Architecture

## Goal

Phase 4 adds the Gear Desk reservation workflow on top of the inventory module. Employees can request available equipment, Gear Desk officers can review and manage checkout lifecycle records, and the platform can track overdue returns and damage reports.

## Directus Collections

- `gear_requests`: production/activity type, location, schedule, return date, status, requester, reviewer, approval notes.
- `gear_request_items`: junction records linking requests to `inventory_items`.
- `gear_checkouts`: checkout code, expected return, returned date, digital signature, checkout status.
- `damage_reports`: damaged equipment records connected to requests and inventory items.

Run the bootstrap after Phase 3:

```bash
npm run directus:bootstrap:phase4
```

## Frontend Routes

- `/gear-desk`: request dashboard, KPIs, overdue/damage watch, filtering.
- `/gear-desk/new`: equipment reservation request form.
- `/gear-desk/[id]`: request detail, requested items, checkout state.

## Workflow

1. Employee creates a gear request.
2. Requested inventory items are stored in `gear_request_items`.
3. Gear Desk Officer reviews and moves requests through approved/rejected/checked out/returned states in Directus.
4. Checkout and damage records preserve return accountability and equipment condition.

## Permission Baseline

- Gear Desk Officer: full read/create/update/delete for gear desk collections.
- Employee: create/read own gear requests and attach requested items.
- Manager: read gear desk workflow records.

Inventory item status changes remain controlled by the Directus permissions from Phase 3 and will be automated further in later workflow phases.
