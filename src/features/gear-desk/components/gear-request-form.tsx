"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { InventoryItem } from "@/features/inventory/types";

export function GearRequestForm({ items }: { items: InventoryItem[] }) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  function toggleItem(id: number) {
    setSelectedItems((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      production_activity_type: formData.get("production_activity_type"),
      location: formData.get("location"),
      request_date: formData.get("request_date"),
      start_time: formData.get("start_time"),
      end_time: formData.get("end_time"),
      return_date: formData.get("return_date"),
      notes: formData.get("notes"),
      requested_items: Array.from(selectedItems).map((id) => ({ item: id, quantity: 1 }))
    };

    const response = await fetch("/api/gear-desk/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message ?? "Unable to create gear request.");
      setIsLoading(false);
      return;
    }

    router.push("/gear-desk");
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>New Gear Request</CardTitle>
          <p className="text-sm text-muted-foreground">Submit equipment needs for a production, assignment, or field activity.</p>
        </CardHeader>
        <CardContent>
          <form id="gear-request-form" className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <Field name="production_activity_type" label="Production/activity type" required />
            <Field name="location" label="Location" required />
            <Field name="request_date" label="Date" type="date" required />
            <Field name="start_time" label="Start time" type="time" required />
            <Field name="end_time" label="End time" type="time" required />
            <Field name="return_date" label="Return date" type="date" required />
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                className="rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            {error ? <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm md:col-span-2">{error}</p> : null}
            <div className="md:col-span-2">
              <Button type="submit" disabled={isLoading || selectedItems.size === 0}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Submit request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Available Equipment</CardTitle>
          <p className="text-sm text-muted-foreground">{selectedItems.size} selected</p>
        </CardHeader>
        <CardContent className="grid max-h-[620px] gap-2 overflow-auto">
          {items.length ? (
            items.map((item) => (
              <label
                key={item.id}
                className="flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm hover:bg-secondary/60"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.has(Number(item.id))}
                  onChange={() => toggleItem(Number(item.id))}
                  className="mt-1"
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{item.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {item.asset_code} · {item.category?.name ?? "Uncategorized"}
                  </span>
                </span>
              </label>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No available inventory items found.</p>
          )}
        </CardContent>
      </Card>
    </div>
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
