# Phase 2 Architecture

## Goal

Phase 2 adds the people administration layer: reusable role definitions, profile fields, departments, permission baselines, and admin-facing user management screens.

## Directus Model

Phase 2 extends Directus with:

- Roles: Employee, Manager, HR, Gear Desk Officer, Inventory Officer, Production Coordinator, Admin.
- `directus_users` profile fields: employee ID, phone number, department, job title, manager.
- `departments` collection for organizational segmentation.
- Baseline Directus permissions for self-service user access, HR administration, and manager read visibility.

Run the bootstrap after Directus is available:

```bash
npm run directus:bootstrap:phase2
```

## Frontend Model

The frontend now includes an admin module:

- `/admin/users`: searchable user directory with role and department filtering.
- `/admin/roles`: role cards and enterprise permission matrix.
- Role-aware navigation based on Directus role metadata.

Access is limited to Admin, Administrator, or HR roles. Directus remains the source of truth for permissions; frontend checks are only a usability layer.

## Security Notes

- User and role reads are performed server-side with the current Directus JWT.
- Admin routes redirect unauthenticated users to `/login`.
- Non-admin/non-HR users are redirected to `/dashboard`.
- The bootstrap script is idempotent and should be run by an operator with Directus admin credentials.
