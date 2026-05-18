import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GearStatusBadge } from "@/features/gear-desk/components/gear-status-badge";
import type { GearCheckout, GearRequest, GearRequestItem } from "@/features/gear-desk/types";

function personName(person: GearRequest["requested_by"]) {
  if (!person) return "Unassigned";
  return [person.first_name, person.last_name].filter(Boolean).join(" ") || person.email;
}

export function GearRequestDetail({
  request,
  items,
  checkouts
}: {
  request: GearRequest;
  items: GearRequestItem[];
  checkouts: GearCheckout[];
}) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{request.request_code ?? `REQ-${request.id}`}</p>
          <h1 className="text-2xl font-semibold tracking-normal">{request.production_activity_type}</h1>
        </div>
        <GearStatusBadge status={request.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm md:grid-cols-2">
            <Field label="Requested by" value={personName(request.requested_by)} />
            <Field label="Reviewed by" value={personName(request.reviewed_by)} />
            <Field label="Location" value={request.location} />
            <Field label="Date" value={request.request_date} />
            <Field label="Start time" value={request.start_time} />
            <Field label="End time" value={request.end_time} />
            <Field label="Return date" value={request.return_date} />
            <Field label="Approval notes" value={request.approval_notes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Checkout State</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {checkouts.length ? (
              checkouts.map((checkout) => (
                <div key={checkout.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{checkout.checkout_code ?? `Checkout ${checkout.id}`}</p>
                    <Badge variant="secondary">{checkout.status}</Badge>
                  </div>
                  <p className="mt-1 text-muted-foreground">Expected return: {checkout.expected_return_at ?? "Not recorded"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No checkout has been generated yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Requested Items</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {items.length ? (
            items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 rounded-md border p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.item?.name ?? "Unknown item"}</p>
                  <p className="truncate text-muted-foreground">{item.item?.asset_code ?? "No asset code"}</p>
                </div>
                <Badge variant="secondary">{item.checkout_status ?? "requested"}</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No requested items were attached.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{request.notes || "No notes recorded."}</CardContent>
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
