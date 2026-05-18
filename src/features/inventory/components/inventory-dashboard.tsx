"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Plus, Search, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InventoryStatusBadge } from "@/features/inventory/components/status-badge";
import type { InventoryCategory, InventoryItem, MaintenanceLog } from "@/features/inventory/types";

function ownerName(item: InventoryItem) {
  if (!item.assigned_to) return "Unassigned";
  return [item.assigned_to.first_name, item.assigned_to.last_name].filter(Boolean).join(" ") || item.assigned_to.email;
}

export function InventoryDashboard({
  items,
  categories,
  maintenanceLogs
}: {
  items: InventoryItem[];
  categories: InventoryCategory[];
  maintenanceLogs: MaintenanceLog[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  const metrics = useMemo(() => {
    const available = items.filter((item) => item.status === "available").length;
    const activeRisk = items.filter((item) => ["in_repair", "damaged", "lost"].includes(item.status)).length;
    const totalValue = items.reduce((sum, item) => sum + Number(item.current_value ?? item.purchase_cost ?? 0), 0);

    return { total: items.length, available, activeRisk, totalValue };
  }, [items]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory = category === "all" || String(item.category?.id) === category;
      const matchesStatus = status === "all" || item.status === status;
      const haystack = [
        item.asset_code,
        item.name,
        item.serial_number,
        item.category?.name,
        item.vendor?.name,
        item.location?.name,
        ownerName(item)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && matchesStatus && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [category, items, query, status]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Phase 3 inventory module</p>
          <h1 className="text-2xl font-semibold tracking-normal">Inventory & Assets</h1>
        </div>
        <Button asChild>
          <Link href="/inventory/new">
            <Plus className="mr-2 h-4 w-4" />
            Register asset
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Assets</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.total}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.available}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" />
              Risk Items
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{metrics.activeRisk}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Valuation</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
              metrics.totalValue
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-6 md:grid-cols-[minmax(0,1fr)_220px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search assets, serials, vendors, locations"
              className="pl-9"
            />
          </div>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="reserved">Reserved</option>
            <option value="in_repair">In repair</option>
            <option value="damaged">Damaged</option>
            <option value="lost">Lost</option>
            <option value="retired">Retired</option>
          </select>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-md border bg-card">
        <div className="grid min-w-[980px] grid-cols-[1.2fr_1fr_1fr_1fr_1fr_120px] border-b px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <div>Asset</div>
          <div>Category</div>
          <div>Location</div>
          <div>Assigned To</div>
          <div>Vendor</div>
          <div>Status</div>
        </div>
        {filteredItems.length ? (
          filteredItems.map((item) => (
            <Link
              key={item.id}
              href={`/inventory/${item.id}`}
              className="grid min-w-[980px] grid-cols-[1.2fr_1fr_1fr_1fr_1fr_120px] items-center border-b px-4 py-4 text-sm hover:bg-secondary/60 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{item.name}</p>
                <p className="truncate text-xs text-muted-foreground">{item.asset_code}</p>
              </div>
              <div className="truncate text-muted-foreground">{item.category?.name ?? "Uncategorized"}</div>
              <div className="truncate text-muted-foreground">{item.location?.name ?? "No location"}</div>
              <div className="truncate text-muted-foreground">{ownerName(item)}</div>
              <div className="truncate text-muted-foreground">{item.vendor?.name ?? "No vendor"}</div>
              <InventoryStatusBadge status={item.status} />
            </Link>
          ))
        ) : (
          <div className="p-8 text-sm text-muted-foreground">No assets match the current filters.</div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance Queue
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {maintenanceLogs.length ? (
            maintenanceLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-4 rounded-md border p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{log.title}</p>
                  <p className="truncate text-muted-foreground">{log.item?.name ?? "Unlinked asset"}</p>
                </div>
                <Badge variant="secondary">{log.status}</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No maintenance work is currently queued.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
