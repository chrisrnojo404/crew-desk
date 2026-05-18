"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, ClipboardList, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GearStatusBadge } from "@/features/gear-desk/components/gear-status-badge";
import type { DamageReport, GearCheckout, GearRequest, GearRequestItem } from "@/features/gear-desk/types";

function personName(person: GearRequest["requested_by"]) {
  if (!person) return "Unassigned";
  return [person.first_name, person.last_name].filter(Boolean).join(" ") || person.email;
}

export function GearDashboard({
  requests,
  requestItems,
  checkouts,
  damageReports
}: {
  requests: GearRequest[];
  requestItems: GearRequestItem[];
  checkouts: GearCheckout[];
  damageReports: DamageReport[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const metrics = useMemo(() => {
    const pending = requests.filter((request) => request.status === "pending").length;
    const active = requests.filter((request) => request.status === "approved" || request.status === "checked_out").length;
    const overdue = checkouts.filter((checkout) => {
      if (!checkout.expected_return_at || checkout.returned_at) return false;
      return new Date(checkout.expected_return_at) < new Date();
    }).length;
    const damaged = damageReports.filter((report) => report.status !== "resolved").length;
    return { pending, active, overdue, damaged };
  }, [checkouts, damageReports, requests]);

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus = status === "all" || request.status === status;
      const haystack = [
        request.request_code,
        request.production_activity_type,
        request.location,
        request.status,
        personName(request.requested_by)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [query, requests, status]);

  const itemCounts = useMemo(() => {
    const counts = new Map<number, number>();
    for (const item of requestItems) {
      const requestId = item.request?.id;
      if (requestId) counts.set(requestId, (counts.get(requestId) ?? 0) + 1);
    }
    return counts;
  }, [requestItems]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Phase 4 gear desk module</p>
          <h1 className="text-2xl font-semibold tracking-normal">Gear Desk</h1>
        </div>
        <Button asChild>
          <Link href="/gear-desk/new">
            <Plus className="mr-2 h-4 w-4" />
            New request
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Pending Review" value={metrics.pending} icon={ClipboardList} />
        <Metric title="Active Requests" value={metrics.active} icon={CalendarClock} />
        <Metric title="Overdue Returns" value={metrics.overdue} icon={AlertTriangle} />
        <Metric title="Open Damage Reports" value={metrics.damaged} icon={AlertTriangle} />
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-6 md:grid-cols-[minmax(0,1fr)_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search requests, people, locations"
              className="pl-9"
            />
          </div>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="checked_out">Checked out</option>
            <option value="returned">Returned</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-md border bg-card">
        <div className="grid min-w-[920px] grid-cols-[1.1fr_1fr_1fr_1fr_110px_130px] border-b px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <div>Request</div>
          <div>Activity</div>
          <div>Requested By</div>
          <div>Schedule</div>
          <div>Items</div>
          <div>Status</div>
        </div>
        {filteredRequests.length ? (
          filteredRequests.map((request) => (
            <Link
              key={request.id}
              href={`/gear-desk/${request.id}`}
              className="grid min-w-[920px] grid-cols-[1.1fr_1fr_1fr_1fr_110px_130px] items-center border-b px-4 py-4 text-sm hover:bg-secondary/60 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{request.request_code ?? `REQ-${request.id}`}</p>
                <p className="truncate text-xs text-muted-foreground">{request.location ?? "No location"}</p>
              </div>
              <div className="truncate text-muted-foreground">{request.production_activity_type}</div>
              <div className="truncate text-muted-foreground">{personName(request.requested_by)}</div>
              <div className="truncate text-muted-foreground">{request.request_date ?? "Unscheduled"}</div>
              <div>
                <Badge variant="secondary">{itemCounts.get(request.id) ?? 0}</Badge>
              </div>
              <GearStatusBadge status={request.status} />
            </Link>
          ))
        ) : (
          <div className="p-8 text-sm text-muted-foreground">No gear requests match the current filters.</div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overdue & Damage Watch</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {checkouts
            .filter((checkout) => checkout.expected_return_at && !checkout.returned_at && new Date(checkout.expected_return_at) < new Date())
            .slice(0, 4)
            .map((checkout) => (
              <div key={checkout.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{checkout.checkout_code ?? `Checkout ${checkout.id}`}</p>
                <p className="text-muted-foreground">Expected back {checkout.expected_return_at}</p>
              </div>
            ))}
          {damageReports.slice(0, 4).map((report) => (
            <div key={report.id} className="rounded-md border p-3 text-sm">
              <p className="font-medium">{report.title}</p>
              <p className="text-muted-foreground">{report.item?.name ?? "Unlinked item"}</p>
            </div>
          ))}
          {!metrics.overdue && !damageReports.length ? (
            <p className="text-sm text-muted-foreground">No overdue returns or damage reports are currently open.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({
  title,
  value,
  icon: Icon
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-2xl font-semibold">{value}</CardContent>
    </Card>
  );
}
