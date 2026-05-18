import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryStatusBadge } from "@/features/inventory/components/status-badge";
import type { InventoryItem } from "@/features/inventory/types";

function formatMoney(value?: number | null) {
  if (value == null) return "Not recorded";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value));
}

export function AssetDetail({ item }: { item: InventoryItem }) {
  const assignedTo = item.assigned_to
    ? [item.assigned_to.first_name, item.assigned_to.last_name].filter(Boolean).join(" ") || item.assigned_to.email
    : "Unassigned";

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{item.asset_code}</p>
          <h1 className="text-2xl font-semibold tracking-normal">{item.name}</h1>
        </div>
        <InventoryStatusBadge status={item.status} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Asset Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm md:grid-cols-2">
            <Field label="Serial number" value={item.serial_number} />
            <Field label="Barcode" value={item.barcode} />
            <Field label="QR code" value={item.qr_code} />
            <Field label="Condition" value={item.condition} />
            <Field label="Category" value={item.category?.name} />
            <Field label="Location" value={item.location?.name} />
            <Field label="Vendor" value={item.vendor?.name} />
            <Field label="Assigned to" value={assignedTo} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financials & Warranty</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <Field label="Purchase date" value={item.purchase_date} />
            <Field label="Warranty expires" value={item.warranty_expires_at} />
            <Field label="Purchase cost" value={formatMoney(item.purchase_cost)} />
            <Field label="Current value" value={formatMoney(item.current_value)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{item.notes || "No notes recorded."}</CardContent>
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
