"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarDays, Clock, Plus, Search, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LeaveStatusBadge } from "@/features/leave/components/leave-status-badge";
import type { LeaveBalance, LeaveRequest } from "@/features/leave/types";

function personName(person: LeaveRequest["employee"]) {
  if (!person) return "Unassigned";
  return [person.first_name, person.last_name].filter(Boolean).join(" ") || person.email;
}

export function LeaveDashboard({ requests, balances }: { requests: LeaveRequest[]; balances: LeaveBalance[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const metrics = useMemo(() => {
    const pending = requests.filter((request) => request.status === "pending").length;
    const approved = requests.filter((request) => request.status === "approved").length;
    const daysPending = requests
      .filter((request) => request.status === "pending")
      .reduce((sum, request) => sum + Number(request.total_days ?? 0), 0);
    const remaining = balances.reduce((sum, balance) => sum + Number(balance.remaining ?? 0), 0);
    return { pending, approved, daysPending, remaining };
  }, [balances, requests]);

  const filteredRequests = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesStatus = status === "all" || request.status === status;
      const haystack = [
        request.request_code,
        request.leave_type?.name,
        request.reason,
        request.status,
        personName(request.employee)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!normalized || haystack.includes(normalized));
    });
  }, [query, requests, status]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Phase 5 leave management</p>
          <h1 className="text-2xl font-semibold tracking-normal">Leave Management</h1>
        </div>
        <Button asChild>
          <Link href="/leave/new">
            <Plus className="mr-2 h-4 w-4" />
            New leave request
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Pending Requests" value={metrics.pending} icon={Clock} />
        <Metric title="Approved Requests" value={metrics.approved} icon={UserCheck} />
        <Metric title="Pending Days" value={metrics.daysPending} icon={CalendarDays} />
        <Metric title="Remaining Balance" value={metrics.remaining} icon={CalendarDays} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardContent className="grid gap-3 pt-6 md:grid-cols-[minmax(0,1fr)_190px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search leave requests"
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
              <option value="cancelled">Cancelled</option>
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Balances</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {balances.slice(0, 5).map((balance) => (
              <div key={balance.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <span className="truncate">{balance.leave_type?.name ?? "Leave"}</span>
                <Badge variant="secondary">{balance.remaining} left</Badge>
              </div>
            ))}
            {!balances.length ? <p className="text-sm text-muted-foreground">No balances are configured yet.</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <div className="grid min-w-[900px] grid-cols-[1fr_1fr_1fr_1fr_110px_130px] border-b px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <div>Request</div>
          <div>Employee</div>
          <div>Type</div>
          <div>Dates</div>
          <div>Days</div>
          <div>Status</div>
        </div>
        {filteredRequests.length ? (
          filteredRequests.map((request) => (
            <Link
              key={request.id}
              href={`/leave/${request.id}`}
              className="grid min-w-[900px] grid-cols-[1fr_1fr_1fr_1fr_110px_130px] items-center border-b px-4 py-4 text-sm hover:bg-secondary/60 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{request.request_code ?? `LV-${request.id}`}</p>
                <p className="truncate text-xs text-muted-foreground">{request.reason ?? "No reason provided"}</p>
              </div>
              <div className="truncate text-muted-foreground">{personName(request.employee)}</div>
              <div className="truncate text-muted-foreground">{request.leave_type?.name ?? "Leave"}</div>
              <div className="truncate text-muted-foreground">
                {request.start_date} to {request.end_date}
              </div>
              <div>{request.total_days ?? "-"}</div>
              <LeaveStatusBadge status={request.status} />
            </Link>
          ))
        ) : (
          <div className="p-8 text-sm text-muted-foreground">No leave requests match the current filters.</div>
        )}
      </div>
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
