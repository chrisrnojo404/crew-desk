# Phase 3 Architecture

## Goal

Phase 3 adds the inventory and asset-management foundation. It creates the Directus data model for assets, vendors, locations, categories, and maintenance logs, plus frontend inventory screens for asset discovery and registration.

## Directus Collections

- `inventory_categories`: cameras, laptops, microphones, lighting, networking, office equipment, vehicles, accessories.
- `inventory_items`: asset code, serial, QR/barcode, status, condition, warranty, valuation, assignment, location, vendor.
- `vendors`: suppliers and service providers.
- `locations`: office, warehouse, studio, field, and storage locations.
- `maintenance_logs`: service, repair, warranty, inspection, and cost history.

Run the bootstrap after Phase 2:

```bash
npm run directus:bootstrap:phase3
```

## Frontend Routes

- `/inventory`: inventory dashboard, KPIs, filters, asset table, maintenance queue.
- `/inventory/new`: asset registration form.
- `/inventory/[id]`: asset detail profile.

## Status Model

Inventory assets support these lifecycle statuses:

- available
- assigned
- reserved
- in_repair
- damaged
- lost
- retired

## Permission Baseline

- Inventory Officer: read, create, update, delete for inventory collections.
- Manager, Gear Desk Officer, Employee: read access to categories, items, and locations.
- Admin access remains governed by the Directus Admin policy.

The frontend relies on server-side Directus requests with the active user JWT. Directus remains the enforcement layer for collection permissions.
