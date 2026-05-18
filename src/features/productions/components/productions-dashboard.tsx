"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, Factory, Plus, Search, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ProductionStatusBadge } from "@/features/productions/components/production-status-badge";
import type { Production, ProductionActivity, ProductionAssignment } from "@/features/productions/types";

function personName(person: Production["coordinator"]) {
  if (!person) return "Unassigned";
  return [person.first_name, person.last_name].filter(Boolean).join(" ") || person.email;
}

export function ProductionsDashboard({
  productions,
  assignments,
  activities
}: {
  productions: Production[];
  assignments: ProductionAssignment[];
  activities: ProductionActivity[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const metrics = useMemo(() => {
    const active = productions.filter((production) => production.status === "active").length;
    const planned = productions.filter((production) => production.status === "planned" || production.status === "approved").length;
    const assignedPeople = new Set(assignments.map((assignment) => assignment.employee?.id).filter(Boolean)).size;
    const upcomingActivities = activities.filter((activity) => activity.starts_at && new Date(activity.starts_at) >= new Date()).length;
    return { active, planned, assignedPeople, upcomingActivities };
  }, [activities, assignments, productions]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return productions.filter((production) => {
      const matchesStatus = status === "all" || production.status === status;
      const haystack = [
        production.production_code,
        production.title,
        production.production_type,
        production.location,
        production.status,
        personName(production.coordinator)
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!normalized || haystack.includes(normalized));
    });
  }, [productions, query, status]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Phase 6 field operations</p>
          <h1 className="text-2xl font-semibold tracking-normal">Production Planning</h1>
        </div>
        <Button asChild>
          <Link href="/productions/new">
            <Plus className="mr-2 h-4 w-4" />
            New production
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Active" value={metrics.active} icon={Factory} />
        <Metric title="Planned" value={metrics.planned} icon={CalendarClock} />
        <Metric title="Assigned People" value={metrics.assignedPeople} icon={UserCheck} />
        <Metric title="Upcoming Activities" value={metrics.upcomingActivities} icon={CalendarClock} />
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-6 md:grid-cols-[minmax(0,1fr)_190px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search productions, locations, coordinators"
              className="pl-9"
            />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="all">All statuses</option>
            <option value="planned">Planned</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-md border bg-card">
        <div className="grid min-w-[940px] grid-cols-[1.2fr_1fr_1fr_1fr_1fr_130px] border-b px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <div>Production</div>
          <div>Type</div>
          <div>Coordinator</div>
          <div>Location</div>
          <div>Schedule</div>
          <div>Status</div>
        </div>
        {filtered.length ? (
          filtered.map((production) => (
            <Link
              key={production.id}
              href={`/productions/${production.id}`}
              className="grid min-w-[940px] grid-cols-[1.2fr_1fr_1fr_1fr_1fr_130px] items-center border-b px-4 py-4 text-sm hover:bg-secondary/60 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{production.title}</p>
                <p className="truncate text-xs text-muted-foreground">{production.production_code ?? `PRD-${production.id}`}</p>
              </div>
              <div className="truncate text-muted-foreground">{production.production_type}</div>
              <div className="truncate text-muted-foreground">{personName(production.coordinator)}</div>
              <div className="truncate text-muted-foreground">{production.location ?? "No location"}</div>
              <div className="truncate text-muted-foreground">{production.start_date ?? "Unscheduled"}</div>
              <ProductionStatusBadge status={production.status} />
            </Link>
          ))
        ) : (
          <div className="p-8 text-sm text-muted-foreground">No productions match the current filters.</div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Activities</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {activities.slice(0, 6).map((activity) => (
            <div key={activity.id} className="flex items-center justify-between gap-4 rounded-md border p-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{activity.title}</p>
                <p className="truncate text-muted-foreground">{activity.production?.title ?? activity.location ?? "No production"}</p>
              </div>
              <Badge variant="secondary">{activity.status ?? "planned"}</Badge>
            </div>
          ))}
          {!activities.length ? <p className="text-sm text-muted-foreground">No production activities are scheduled yet.</p> : null}
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
