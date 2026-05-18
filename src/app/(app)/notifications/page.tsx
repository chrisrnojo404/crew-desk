import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/features/auth/server/session";
import { NotificationsDashboard } from "@/features/notifications/components/notifications-dashboard";
import { listAutomationRules, listNotifications, listWorkflowEvents } from "@/features/notifications/server/notifications";

export default async function NotificationsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [notifications, rules, events] = await Promise.all([
    listNotifications(),
    listAutomationRules(),
    listWorkflowEvents()
  ]);

  return (
    <AppShell user={user}>
      <NotificationsDashboard notifications={notifications} rules={rules} events={events} />
    </AppShell>
  );
}
