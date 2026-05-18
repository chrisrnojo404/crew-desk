# Phase 5 Architecture

## Goal

Phase 5 adds employee leave management. Directus stores leave types, employee leave requests, approval workflow fields, and annual balances. The frontend adds a self-service leave dashboard, request form, and request detail view.

## Directus Collections

- `leave_types`: vacation, sick leave, emergency leave, unpaid leave, maternity leave.
- `leave_requests`: employee, leave type, date range, reason, status, manager/HR review state, approval notes.
- `leave_balances`: annual entitlement, used, pending, and remaining days by employee and leave type.

Run the bootstrap after Phase 2:

```bash
npm run directus:bootstrap:phase5
```

## Frontend Routes

- `/leave`: leave dashboard with KPIs, balances, filters, and request history.
- `/leave/new`: employee leave request form.
- `/leave/[id]`: request details and approval state.

## Workflow State

Requests support these statuses:

- draft
- pending
- approved
- rejected
- cancelled

Manager and HR review state is stored separately with `manager_status` and `hr_status`, preparing the model for Directus Flows automation in Phase 7.
