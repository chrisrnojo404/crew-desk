import { BarChart3, FileText, PieChart, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KpiSnapshot, ModuleSummary, ReportDefinition, ReportMetric } from "@/features/reports/types";

export function ReportsDashboard({
  metrics,
  summaries,
  definitions,
  snapshots
}: {
  metrics: ReportMetric[];
  summaries: ModuleSummary[];
  definitions: ReportDefinition[];
  snapshots: KpiSnapshot[];
}) {
  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Phase 8 reporting & analytics</p>
        <h1 className="text-2xl font-semibold tracking-normal">Reports & Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{metric.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{metric.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Module Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-md border">
              <div className="grid min-w-[680px] grid-cols-[1fr_1fr_1fr_130px] border-b px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                <div>Module</div>
                <div>Primary</div>
                <div>Secondary</div>
                <div>Status</div>
              </div>
              {summaries.map((summary) => (
                <div key={summary.module} className="grid min-w-[680px] grid-cols-[1fr_1fr_1fr_130px] border-b px-4 py-4 text-sm last:border-b-0">
                  <div className="font-medium">{summary.module}</div>
                  <div className="text-muted-foreground">{summary.primary}</div>
                  <div className="text-muted-foreground">{summary.secondary}</div>
                  <Badge variant={summary.status === "Stable" || summary.status === "Active" ? "secondary" : "default"}>{summary.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Report Catalog
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {definitions.map((definition) => (
              <div key={definition.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{definition.name}</p>
                  <Badge variant={definition.enabled ? "default" : "outline"}>{definition.module ?? "general"}</Badge>
                </div>
                <p className="mt-1 text-muted-foreground">{definition.description ?? "Saved report definition"}</p>
              </div>
            ))}
            {!definitions.length ? <p className="text-sm text-muted-foreground">No report definitions configured yet.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            KPI Snapshots
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {snapshots.slice(0, 8).map((snapshot) => (
            <div key={snapshot.id} className="rounded-md border p-3 text-sm">
              <p className="font-medium">{snapshot.metric_label}</p>
              <p className="mt-2 text-xl font-semibold">
                {snapshot.value ?? 0}
                {snapshot.unit ? <span className="text-sm text-muted-foreground"> {snapshot.unit}</span> : null}
              </p>
              <p className="mt-1 text-muted-foreground">{snapshot.module ?? "general"}</p>
            </div>
          ))}
          {!snapshots.length ? <p className="text-sm text-muted-foreground">No KPI snapshots captured yet.</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}
