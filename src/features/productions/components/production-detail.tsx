import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductionStatusBadge } from "@/features/productions/components/production-status-badge";
import type { Production, ProductionActivity, ProductionAsset, ProductionAssignment } from "@/features/productions/types";

function personName(person: Production["coordinator"]) {
  if (!person) return "Unassigned";
  return [person.first_name, person.last_name].filter(Boolean).join(" ") || person.email;
}

export function ProductionDetail({
  production,
  assignments,
  activities,
  assets
}: {
  production: Production;
  assignments: ProductionAssignment[];
  activities: ProductionActivity[];
  assets: ProductionAsset[];
}) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{production.production_code ?? `PRD-${production.id}`}</p>
          <h1 className="text-2xl font-semibold tracking-normal">{production.title}</h1>
        </div>
        <ProductionStatusBadge status={production.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Production Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm md:grid-cols-2">
            <Field label="Type" value={production.production_type} />
            <Field label="Coordinator" value={personName(production.coordinator)} />
            <Field label="Location" value={production.location} />
            <Field label="Start date" value={production.start_date} />
            <Field label="End date" value={production.end_date} />
            <Field label="Gear request" value={production.gear_request?.request_code} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Crew</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{personName(assignment.employee)}</p>
                  <p className="truncate text-muted-foreground">{assignment.role ?? "Crew"}</p>
                </div>
                <Badge variant="secondary">{assignment.status ?? "assigned"}</Badge>
              </div>
            ))}
            {!assignments.length ? <p className="text-sm text-muted-foreground">No crew assigned yet.</p> : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {activities.map((activity) => (
              <div key={activity.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{activity.title}</p>
                <p className="text-muted-foreground">{activity.starts_at ?? "No start time"} · {activity.location ?? "No location"}</p>
              </div>
            ))}
            {!activities.length ? <p className="text-sm text-muted-foreground">No activities scheduled yet.</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assigned Assets</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {assets.map((asset) => (
              <div key={asset.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{asset.asset?.name ?? "Unknown asset"}</p>
                <p className="text-muted-foreground">{asset.asset?.asset_code ?? "No asset code"} · {asset.purpose ?? "Production use"}</p>
              </div>
            ))}
            {!assets.length ? <p className="text-sm text-muted-foreground">No assets assigned yet.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{production.notes || "No notes recorded."}</CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 truncate">{value || "Not recorded"}</p>
    </div>
  );
}
