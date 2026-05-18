"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProductionForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/productions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message ?? "Unable to create production.");
      setIsLoading(false);
      return;
    }

    router.push("/productions");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Production</CardTitle>
        <p className="text-sm text-muted-foreground">Plan productions, field assignments, and activity schedules.</p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <Field name="title" label="Title" required />
          <Select
            name="production_type"
            label="Production type"
            items={["interviews", "news coverage", "events", "documentaries", "broadcasts", "livestreams"]}
          />
          <Field name="location" label="Location" />
          <Select name="status" label="Status" items={["planned", "approved", "active", "completed", "cancelled"]} />
          <Field name="start_date" label="Start date" type="date" />
          <Field name="end_date" label="End date" type="date" />
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea id="notes" name="notes" rows={4} className="rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          {error ? <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save production
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

function Select({ name, label, items }: { name: string; label: string; items: string[] }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select id={name} name={name} className="h-10 rounded-md border bg-background px-3 text-sm">
        {items.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}
