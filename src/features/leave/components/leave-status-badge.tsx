import { Badge } from "@/components/ui/badge";
import type { LeaveRequestStatus } from "@/features/leave/types";

const labels: Record<LeaveRequestStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled"
};

export function LeaveStatusBadge({ status }: { status: LeaveRequestStatus }) {
  const variant = status === "approved" ? "default" : status === "rejected" || status === "cancelled" ? "outline" : "secondary";
  return <Badge variant={variant}>{labels[status] ?? status}</Badge>;
}
