import { Badge } from "@/components/ui/badge";
import type { GearRequestStatus } from "@/features/gear-desk/types";

const labels: Record<GearRequestStatus, string> = {
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  checked_out: "Checked out",
  returned: "Returned",
  cancelled: "Cancelled"
};

export function GearStatusBadge({ status }: { status: GearRequestStatus }) {
  const variant = status === "approved" || status === "checked_out" ? "default" : status === "rejected" ? "outline" : "secondary";
  return <Badge variant={variant}>{labels[status] ?? status}</Badge>;
}
