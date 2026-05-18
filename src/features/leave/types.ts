export type LeaveRequestStatus = "draft" | "pending" | "approved" | "rejected" | "cancelled";

export type LeaveType = {
  id: number;
  name: string;
  slug: string;
  annual_allowance?: number | null;
  requires_attachment?: boolean | null;
  status?: string | null;
};

export type LeaveBalance = {
  id: number;
  year: number;
  entitlement: number;
  used: number;
  pending: number;
  remaining: number;
  leave_type?: LeaveType | null;
  employee?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
  } | null;
};

export type LeaveRequest = {
  id: number;
  request_code?: string | null;
  start_date: string;
  end_date: string;
  total_days?: number | null;
  reason?: string | null;
  status: LeaveRequestStatus;
  manager_status?: string | null;
  hr_status?: string | null;
  approval_notes?: string | null;
  leave_type?: LeaveType | null;
  employee?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
  } | null;
  manager?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
  } | null;
  hr_reviewer?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
  } | null;
  date_created?: string | null;
  date_updated?: string | null;
};
