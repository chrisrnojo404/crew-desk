import { Badge } from "@/components/ui/badge";
import type { NotificationStatus } from "@/features/notifications/types";

export function NotificationStatusBadge({ status }: { status: NotificationStatus }) {
  return <Badge variant={status === "unread" ? "default" : status === "archived" ? "outline" : "secondary"}>{status}</Badge>;
}
