import { listGearCheckouts, listGearRequests, listDamageReports } from "@/features/gear-desk/server/gear-desk";
import { listInventoryItems, listMaintenanceLogs } from "@/features/inventory/server/inventory";
import { listLeaveBalances, listLeaveRequests } from "@/features/leave/server/leave";
import { listNotifications } from "@/features/notifications/server/notifications";
import { listProductionActivities, listProductions } from "@/features/productions/server/productions";
import { directusSessionFetch } from "@/features/admin/server/directus-admin";
import { buildReportingAnalytics } from "@/features/reports/lib/analytics";
import type { KpiSnapshot, ReportDefinition } from "@/features/reports/types";

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

  return buildReportingAnalytics({
    inventory,
    maintenance,
    gearRequests,
    gearCheckouts,
    damages,
    leaveRequests,
    balances,
    productions,
    activities,
    notifications
  });
}
