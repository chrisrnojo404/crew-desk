import { listGearCheckouts, listGearRequests, listDamageReports } from "@/features/gear-desk/server/gear-desk";
import { listInventoryItems, listMaintenanceLogs } from "@/features/inventory/server/inventory";
import { listLeaveBalances, listLeaveRequests } from "@/features/leave/server/leave";
import { listNotifications } from "@/features/notifications/server/notifications";
import { listProductionActivities, listProductions } from "@/features/productions/server/productions";
import { directusSessionFetch } from "@/features/admin/server/directus-admin";
import type { KpiSnapshot, ModuleSummary, ReportDefinition, ReportMetric } from "@/features/reports/types";

export async function listReportDefinitions() {
  const result = await directusSessionFetch<{ data: ReportDefinition[] }>(
    "/items/report_definitions?fields=id,name,slug,module,description,enabled&sort=module,name&limit=100"
  );
  return result.ok ? result.data.data : [];
}

export async function listKpiSnapshots() {
  const result = await directusSessionFetch<{ data: KpiSnapshot[] }>(
    "/items/kpi_snapshots?fields=id,metric_key,metric_label,module,value,unit,captured_at&sort=-captured_at&limit=100"
  );
  return result.ok ? result.data.data : [];
}

export async function getReportingAnalytics() {
  const [inventory, maintenance, gearRequests, gearCheckouts, damages, leaveRequests, balances, productions, activities, notifications] =
    await Promise.all([
      listInventoryItems(),
      listMaintenanceLogs(),
      listGearRequests(),
      listGearCheckouts(),
      listDamageReports(),
      listLeaveRequests(),
      listLeaveBalances(),
      listProductions(),
      listProductionActivities(),
      listNotifications()
    ]);

  const inventoryValue = inventory.reduce((sum, item) => sum + Number(item.current_value ?? item.purchase_cost ?? 0), 0);
  const overdueCheckouts = gearCheckouts.filter((checkout) => checkout.expected_return_at && !checkout.returned_at && new Date(checkout.expected_return_at) < new Date()).length;
  const pendingLeaveDays = leaveRequests
    .filter((request) => request.status === "pending")
    .reduce((sum, request) => sum + Number(request.total_days ?? 0), 0);

  const metrics: ReportMetric[] = [
    { label: "Inventory Value", value: formatMoney(inventoryValue), helper: `${inventory.length} tracked assets` },
    { label: "Equipment Utilization", value: percent(inventory.filter((item) => item.status !== "available").length, inventory.length), helper: "Assigned, reserved, or unavailable" },
    { label: "Pending Approvals", value: gearRequests.filter((request) => request.status === "pending").length + leaveRequests.filter((request) => request.status === "pending").length, helper: "Leave and Gear Desk" },
    { label: "Overdue Returns", value: overdueCheckouts, helper: "Open checkout records past expected return" },
    { label: "Pending Leave Days", value: pendingLeaveDays, helper: "Requested days awaiting approval" },
    { label: "Active Productions", value: productions.filter((production) => production.status === "active").length, helper: `${activities.length} scheduled activities` }
  ];

  const summaries: ModuleSummary[] = [
    {
      module: "Leave",
      primary: `${leaveRequests.length} requests`,
      secondary: `${balances.reduce((sum, balance) => sum + Number(balance.remaining ?? 0), 0)} days remaining`,
      status: leaveRequests.some((request) => request.status === "pending") ? "Action needed" : "Stable"
    },
    {
      module: "Inventory",
      primary: `${inventory.length} assets`,
      secondary: `${maintenance.length} maintenance logs`,
      status: inventory.some((item) => ["damaged", "lost"].includes(item.status)) ? "Risk" : "Stable"
    },
    {
      module: "Gear Desk",
      primary: `${gearRequests.length} requests`,
      secondary: `${damages.length} damage reports`,
      status: overdueCheckouts ? "Overdue" : "Stable"
    },
    {
      module: "Productions",
      primary: `${productions.length} productions`,
      secondary: `${activities.length} activities`,
      status: productions.some((production) => production.status === "active") ? "Active" : "Planned"
    },
    {
      module: "Notifications",
      primary: `${notifications.length} notifications`,
      secondary: `${notifications.filter((item) => item.status === "unread").length} unread`,
      status: notifications.some((item) => item.priority === "high" && item.status === "unread") ? "Attention" : "Stable"
    }
  ];

  return { metrics, summaries };
}

function percent(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
