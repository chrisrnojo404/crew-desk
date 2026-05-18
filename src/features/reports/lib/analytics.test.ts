import { describe, expect, it } from "vitest";

import { buildReportingAnalytics, percent } from "@/features/reports/lib/analytics";

describe("reporting analytics", () => {
  it("calculates enterprise KPI metrics from module data", () => {
    const analytics = buildReportingAnalytics({
      now: new Date("2026-05-18T12:00:00.000Z"),
      inventory: [
        { status: "available", purchase_cost: 1200 },
        { status: "reserved", current_value: 800 },
        { status: "damaged", current_value: 250 }
      ],
      maintenance: [{ id: 1 }],
      gearRequests: [{ status: "pending" }, { status: "approved" }],
      gearCheckouts: [
        { expected_return_at: "2026-05-17T12:00:00.000Z", returned_at: null },
        { expected_return_at: "2026-05-19T12:00:00.000Z", returned_at: null },
        { expected_return_at: "2026-05-16T12:00:00.000Z", returned_at: "2026-05-16T18:00:00.000Z" }
      ],
      damages: [{ id: 1 }, { id: 2 }],
      leaveRequests: [
        { status: "pending", total_days: 3 },
        { status: "pending", total_days: "2" },
        { status: "approved", total_days: 1 }
      ],
      balances: [{ remaining: 8 }, { remaining: "4" }],
      productions: [{ status: "active" }, { status: "planned" }],
      activities: [{ id: 1 }, { id: 2 }, { id: 3 }],
      notifications: [
        { status: "unread", priority: "high" },
        { status: "read", priority: "normal" }
      ]
    });

    expect(analytics.metrics).toEqual([
      { label: "Inventory Value", value: "$2,250", helper: "3 tracked assets" },
      { label: "Equipment Utilization", value: "67%", helper: "Assigned, reserved, or unavailable" },
      { label: "Pending Approvals", value: 3, helper: "Leave and Gear Desk" },
      { label: "Overdue Returns", value: 1, helper: "Open checkout records past expected return" },
      { label: "Pending Leave Days", value: 5, helper: "Requested days awaiting approval" },
      { label: "Active Productions", value: 1, helper: "3 scheduled activities" }
    ]);

    expect(analytics.summaries.map((summary) => [summary.module, summary.status])).toEqual([
      ["Leave", "Action needed"],
      ["Inventory", "Risk"],
      ["Gear Desk", "Overdue"],
      ["Productions", "Active"],
      ["Notifications", "Attention"]
    ]);
  });

  it("returns zero utilization when no inventory exists", () => {
    expect(percent(0, 0)).toBe("0%");
  });
});
