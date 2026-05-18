import { Badge } from "@/components/ui/badge";
import type { ProductionStatus } from "@/features/productions/types";

const labels: Record<ProductionStatus, string> = {
  planned: "Planned",
  approved: "Approved",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled"
};

export function ProductionStatusBadge({ status }: { status: ProductionStatus }) {
  const variant = status === "active" || status === "approved" ? "default" : status === "cancelled" ? "outline" : "secondary";
  return <Badge variant={variant}>{labels[status] ?? status}</Badge>;
}
