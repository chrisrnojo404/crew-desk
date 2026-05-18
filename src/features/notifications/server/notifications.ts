import { directusSessionFetch } from "@/features/admin/server/directus-admin";
import type { AutomationRule, InternalNotification, WorkflowEvent } from "@/features/notifications/types";

const notificationFields = [
  "id",
  "title",
  "message",
  "module",
  "event_type",
  "priority",
  "channel",
  "status",
  "action_url",
  "recipient.id",
  "recipient.first_name",
  "recipient.last_name",
  "recipient.email",
  "created_by.id",
  "created_by.first_name",
  "created_by.last_name",
  "created_by.email",
  "date_created",
  "date_updated"
].join(",");

export async function listNotifications() {
  const result = await directusSessionFetch<{ data: InternalNotification[] }>(
    `/items/internal_notifications?fields=${notificationFields}&sort=-date_created&limit=120`
  );
  return result.ok ? result.data.data : [];
}

export async function listAutomationRules() {
  const result = await directusSessionFetch<{ data: AutomationRule[] }>(
    "/items/automation_rules?fields=id,name,module,event_type,channel,enabled,description&sort=module,name&limit=120"
  );
  return result.ok ? result.data.data : [];
}

export async function listWorkflowEvents() {
  const result = await directusSessionFetch<{ data: WorkflowEvent[] }>(
    "/items/workflow_events?fields=id,module,event_type,entity_collection,entity_id,status,payload&sort=-id&limit=80"
  );
  return result.ok ? result.data.data : [];
}
