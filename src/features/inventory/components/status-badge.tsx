import { Badge } from "@/components/ui/badge";
import type { InventoryStatus } from "@/features/inventory/types";

const labels: Record<InventoryStatus, string> = {
  available: "Available",
  assigned: "Assigned",
  reserved: "Reserved",
  in_repair: "In repair",
  damaged: "Damaged",
  lost: "Lost",
  retired: "Retired"
};

export function InventoryStatusBadge({ status }: { status: InventoryStatus }) {
  const variant = status === "available" ? "default" : status === "damaged" || status === "lost" ? "outline" : "secondary";
  return <Badge variant={variant}>{labels[status] ?? status}</Badge>;
}
