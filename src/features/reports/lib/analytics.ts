import type { ModuleSummary, ReportMetric } from "@/features/reports/types";

type InventoryAnalyticsItem = {
  status?: string | null;
  current_value?: number | string | null;
  purchase_cost?: number | string | null;
};

type GearRequestAnalyticsItem = {
  status?: string | null;
};

type GearCheckoutAnalyticsItem = {
  expected_return_at?: string | null;
  returned_at?: string | null;
};

type LeaveRequestAnalyticsItem = {
  status?: string | null;
  total_days?: number | string | null;
};

type LeaveBalanceAnalyticsItem = {
  remaining?: number | string | null;
};

type ProductionAnalyticsItem = {
  status?: string | null;
};

type NotificationAnalyticsItem = {
  status?: string | null;
  priority?: string | null;
};

export type ReportingAnalyticsInput = {
  inventory: InventoryAnalyticsItem[];
  maintenance: unknown[];
  gearRequests: GearRequestAnalyticsItem[];
  gearCheckouts: GearCheckoutAnalyticsItem[];
  damages: unknown[];
  leaveRequests: LeaveRequestAnalyticsItem[];
  balances: LeaveBalanceAnalyticsItem[];
  productions: ProductionAnalyticsItem[];
  activities: unknown[];
  notifications: NotificationAnalyticsItem[];
  now?: Date;
};

export function buildReportingAnalytics(input: ReportingAnalyticsInput) {
  const now = input.now ?? new Date();
  const inventoryValue = input.inventory.reduce(
    (sum, item) => sum + Number(item.current_value ?? item.purchase_cost ?? 0),
    0
  );
  const overdueCheckouts = input.gearCheckouts.filter(
    (checkout) => checkout.expected_return_at && !checkout.returned_at && new Date(checkout.expected_return_at) < now
  ).length;
  const pendingLeaveDays = input.leaveRequests
    .filter((request) => request.status === "pending")
    .reduce((sum, request) => sum + Number(request.total_days ?? 0), 0);

  const metrics: ReportMetric[] = [
    { label: "Inventory Value", value: formatMoney(inventoryValue), helper: `${input.inventory.length} tracked assets` },
    {
      label: "Equipment Utilization",
      value: percent(input.inventory.filter((item) => item.status !== "available").length, input.inventory.length),
      helper: "Assigned, reserved, or unavailable"
    },
    {
      label: "Pending Approvals",
      value:
        input.gearRequests.filter((request) => request.status === "pending").length +
        input.leaveRequests.filter((request) => request.status === "pending").length,
      helper: "Leave and Gear Desk"
    },
    { label: "Overdue Returns", value: overdueCheckouts, helper: "Open checkout records past expected return" },
    { label: "Pending Leave Days", value: pendingLeaveDays, helper: "Requested days awaiting approval" },
    {
      label: "Active Productions",
      value: input.productions.filter((production) => production.status === "active").length,
      helper: `${input.activities.length} scheduled activities`
    }
  ];

  const summaries: ModuleSummary[] = [
    {
      module: "Leave",
      primary: `${input.leaveRequests.length} requests`,
      secondary: `${input.balances.reduce((sum, balance) => sum + Number(balance.remaining ?? 0), 0)} days remaining`,
      status: input.leaveRequests.some((request) => request.status === "pending") ? "Action needed" : "Stable"
    },
    {
      module: "Inventory",
      primary: `${input.inventory.length} assets`,
      secondary: `${input.maintenance.length} maintenance logs`,
      status: input.inventory.some((item) => ["damaged", "lost"].includes(String(item.status))) ? "Risk" : "Stable"
    },
    {
      module: "Gear Desk",
      primary: `${input.gearRequests.length} requests`,
      secondary: `${input.damages.length} damage reports`,
      status: overdueCheckouts ? "Overdue" : "Stable"
    },
    {
      module: "Productions",
      primary: `${input.productions.length} productions`,
      secondary: `${input.activities.length} activities`,
      status: input.productions.some((production) => production.status === "active") ? "Active" : "Planned"
    },
    {
      module: "Notifications",
      primary: `${input.notifications.length} notifications`,
      secondary: `${input.notifications.filter((item) => item.status === "unread").length} unread`,
      status: input.notifications.some((item) => item.priority === "high" && item.status === "unread") ? "Attention" : "Stable"
    }
  ];

  return { metrics, summaries };
}

export function percent(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}
