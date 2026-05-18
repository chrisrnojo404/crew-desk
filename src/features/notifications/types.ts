export type NotificationStatus = "unread" | "read" | "archived";
export type NotificationChannel = "in_app" | "email" | "whatsapp";

export type InternalNotification = {
  id: number;
  title: string;
  message?: string | null;
  module?: string | null;
  event_type?: string | null;
  priority?: string | null;
  channel?: NotificationChannel | null;
  status: NotificationStatus;
  action_url?: string | null;
  recipient?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
  } | null;
  created_by?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    email: string;
  } | null;
  date_created?: string | null;
  date_updated?: string | null;
};

export type AutomationRule = {
  id: number;
  name: string;
  module?: string | null;
  event_type?: string | null;
  channel?: NotificationChannel | null;
  enabled?: boolean | null;
  description?: string | null;
};

export type WorkflowEvent = {
  id: number;
  module?: string | null;
  event_type?: string | null;
  entity_collection?: string | null;
  entity_id?: string | null;
  status?: string | null;
  payload?: Record<string, unknown> | null;
};
