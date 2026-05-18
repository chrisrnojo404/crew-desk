# Phase 8 Architecture

## Goal

Phase 8 adds reporting and analytics across all active modules. It combines live Directus reads from leave, inventory, gear desk, productions, and notifications with Directus-managed report definitions and KPI snapshots.

## Directus Collections

- `report_definitions`: saved report catalog, module ownership, and report config metadata.
- `kpi_snapshots`: point-in-time metric values for trend history and dashboard cards.

Run the bootstrap after prior module bootstraps:

```bash
npm run directus:bootstrap:phase8
```

## Frontend Routes

- `/reports`: enterprise analytics dashboard with KPI cards, module health, report catalog, and KPI snapshots.

## Included Report Categories

- Leave reports
- Employee activity reports
- Equipment utilization reports
- Overdue equipment reports
- Maintenance reports
- Inventory valuation
- Production activity reports

## Analytics Strategy

The frontend computes current operational KPIs from Directus module collections. `kpi_snapshots` stores point-in-time values for historical reporting once automated capture is added in a later optimization pass.
