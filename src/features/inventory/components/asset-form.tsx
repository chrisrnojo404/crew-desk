"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InventoryCategory, Location, Vendor } from "@/features/inventory/types";

export function AssetForm({
  categories,
  vendors,
  locations
}: {
  categories: InventoryCategory[];
  vendors: Vendor[];
  locations: Location[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/inventory/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message ?? "Unable to register asset.");
      setIsLoading(false);
      return;
    }

    router.push("/inventory");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register Asset</CardTitle>
        <p className="text-sm text-muted-foreground">Create a trackable inventory item with lifecycle metadata.</p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <Field name="asset_code" label="Asset code" required />
          <Field name="name" label="Asset name" required />
          <Field name="serial_number" label="Serial number" />
          <Field name="barcode" label="Barcode" />
          <Select name="category" label="Category" items={categories} />
          <Select name="vendor" label="Vendor" items={vendors} />
          <Select name="location" label="Location" items={locations} />
          <Select
            name="status"
            label="Status"
            items={[
              { id: "available", name: "Available" },
              { id: "assigned", name: "Assigned" },
              { id: "reserved", name: "Reserved" },
              { id: "in_repair", name: "In repair" },
              { id: "damaged", name: "Damaged" },
              { id: "lost", name: "Lost" },
              { id: "retired", name: "Retired" }
            ]}
            defaultValue="available"
          />
          <Field name="purchase_date" label="Purchase date" type="date" />
          <Field name="warranty_expires_at" label="Warranty expires" type="date" />
          <Field name="purchase_cost" label="Purchase cost" type="number" />
          <Field name="current_value" label="Current value" type="number" />
          {error ? <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save asset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ name, label, type = "text", required }: { name: string; label: string; type?: string; required?: boolean }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} required={required} />
    </div>
  );
}

function Select({
  name,
  label,
  items,
  defaultValue = ""
}: {
  name: string;
  label: string;
  items: { id: string | number; name: string }[];
  defaultValue?: string;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} defaultValue={defaultValue} className="h-10 rounded-md border bg-background px-3 text-sm">
        <option value="">Unassigned</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </div>
  );
}
