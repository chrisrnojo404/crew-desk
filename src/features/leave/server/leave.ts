import { directusSessionFetch } from "@/features/admin/server/directus-admin";
import type { LeaveBalance, LeaveRequest, LeaveType } from "@/features/leave/types";

const leaveRequestFields = [
  "id",
  "request_code",
  "start_date",
  "end_date",
  "total_days",
  "reason",
  "status",
  "manager_status",
  "hr_status",
  "approval_notes",
  "leave_type.id",
  "leave_type.name",
  "leave_type.slug",
  "employee.id",
  "employee.first_name",
  "employee.last_name",
  "employee.email",
  "manager.id",
  "manager.first_name",
  "manager.last_name",
  "manager.email",
  "hr_reviewer.id",
  "hr_reviewer.first_name",
  "hr_reviewer.last_name",
  "hr_reviewer.email",
  "date_created",
  "date_updated"
].join(",");

export async function listLeaveRequests() {
  const result = await directusSessionFetch<{ data: LeaveRequest[] }>(
    `/items/leave_requests?fields=${leaveRequestFields}&sort=-date_created&limit=120`
  );
  return result.ok ? result.data.data : [];
}

export async function getLeaveRequest(id: string) {
  const result = await directusSessionFetch<{ data: LeaveRequest }>(`/items/leave_requests/${id}?fields=${leaveRequestFields}`);
  return result.ok ? result.data.data : null;
}

export async function listLeaveTypes() {
  const result = await directusSessionFetch<{ data: LeaveType[] }>(
    "/items/leave_types?fields=id,name,slug,annual_allowance,requires_attachment,status&filter[status][_neq]=archived&sort=name&limit=50"
  );
  return result.ok ? result.data.data : [];
}

export async function listLeaveBalances() {
  const result = await directusSessionFetch<{ data: LeaveBalance[] }>(
    "/items/leave_balances?fields=id,year,entitlement,used,pending,remaining,leave_type.id,leave_type.name,leave_type.slug,employee.id,employee.first_name,employee.last_name,employee.email&sort=-year,leave_type.name&limit=100"
  );
  return result.ok ? result.data.data : [];
}
