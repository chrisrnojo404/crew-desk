"use client";

import { useMemo, useState } from "react";
import { Bell, Mail, Search, Settings2, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NotificationStatusBadge } from "@/features/notifications/components/notification-status-badge";
import type { AutomationRule, InternalNotification, WorkflowEvent } from "@/features/notifications/types";

function personName(person: InternalNotification["recipient"]) {
  if (!person) return "Unassigned";
  return [person.first_name, person.last_name].filter(Boolean).join(" ") || person.email;
}

export function NotificationsDashboard({
  notifications,
  rules,
  events
}: {
  notifications: InternalNotification[];
  rules: AutomationRule[];
  events: WorkflowEvent[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");

  const metrics = useMemo(() => {
    const unread = notifications.filter((item) => item.status === "unread").length;
    const emailRules = rules.filter((rule) => rule.channel === "email" && rule.enabled).length;
    const enabledRules = rules.filter((rule) => rule.enabled).length;
    const failedEvents = events.filter((event) => event.status === "failed").length;
    return { unread, emailRules, enabledRules, failedEvents };
  }, [events, notifications, rules]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return notifications.filter((item) => {
      const matchesStatus = status === "all" || item.status === status;
      const haystack = [item.title, item.message, item.module, item.event_type, item.priority, personName(item.recipient)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && (!normalized || haystack.includes(normalized));
    });
  }, [notifications, query, status]);

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Phase 7 notifications & automation</p>
        <h1 className="text-2xl font-semibold tracking-normal">Notifications</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Unread" value={metrics.unread} icon={Bell} />
        <Metric title="Enabled Rules" value={metrics.enabledRules} icon={Settings2} />
        <Metric title="Email Rules" value={metrics.emailRules} icon={Mail} />
        <Metric title="Failed Events" value={metrics.failedEvents} icon={Workflow} />
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-6 md:grid-cols-[minmax(0,1fr)_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search notifications" className="pl-9" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm">
            <option value="all">All statuses</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="archived">Archived</option>
          </select>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-md border bg-card">
        <div className="grid min-w-[900px] grid-cols-[1.4fr_1fr_1fr_1fr_130px] border-b px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <div>Notification</div>
          <div>Recipient</div>
          <div>Module</div>
          <div>Channel</div>
          <div>Status</div>
        </div>
        {filtered.length ? (
          filtered.map((item) => {
            const content = (
              <>
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.message ?? item.event_type ?? "No message"}</p>
                </div>
                <div className="truncate text-muted-foreground">{personName(item.recipient)}</div>
                <div className="truncate text-muted-foreground">{item.module ?? "General"}</div>
                <div>
                  <Badge variant="secondary">{item.channel ?? "in_app"}</Badge>
                </div>
                <NotificationStatusBadge status={item.status} />
              </>
            );
            return item.action_url ? (
              <a
                key={item.id}
                href={item.action_url}
                className="grid min-w-[900px] grid-cols-[1.4fr_1fr_1fr_1fr_130px] items-center border-b px-4 py-4 text-sm hover:bg-secondary/60 last:border-b-0"
              >
                {content}
              </a>
            ) : (
              <div key={item.id} className="grid min-w-[900px] grid-cols-[1.4fr_1fr_1fr_1fr_130px] items-center border-b px-4 py-4 text-sm last:border-b-0">
                {content}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-sm text-muted-foreground">No notifications match the current filters.</div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Automation Rules</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {rules.slice(0, 8).map((rule) => (
              <div key={rule.id} className="flex items-center justify-between gap-4 rounded-md border p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{rule.name}</p>
                  <p className="truncate text-muted-foreground">{rule.module} · {rule.event_type}</p>
                </div>
                <Badge variant={rule.enabled ? "default" : "outline"}>{rule.channel ?? "in_app"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workflow Events</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {events.slice(0, 8).map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-4 rounded-md border p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{event.event_type ?? "Workflow event"}</p>
                  <p className="truncate text-muted-foreground">{event.entity_collection ?? event.module}</p>
                </div>
                <Badge variant="secondary">{event.status ?? "received"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
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
