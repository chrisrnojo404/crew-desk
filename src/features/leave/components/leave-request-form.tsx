"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { LeaveType } from "@/features/leave/types";

export function LeaveRequestForm({ leaveTypes }: { leaveTypes: LeaveType[] }) {
  const router = useRouter();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const totalDays = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
    return diff > 0 ? diff : 0;
  }, [endDate, startDate]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/leave/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        leave_type: Number(formData.get("leave_type")),
        start_date: formData.get("start_date"),
        end_date: formData.get("end_date"),
        total_days: totalDays,
        reason: formData.get("reason")
      })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.message ?? "Unable to submit leave request.");
      setIsLoading(false);
      return;
    }

    router.push("/leave");
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Leave Request</CardTitle>
        <p className="text-sm text-muted-foreground">Submit vacation, sick, emergency, unpaid, or maternity leave.</p>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="leave_type">Leave type</Label>
            <select id="leave_type" name="leave_type" required className="h-10 rounded-md border bg-background px-3 text-sm">
              <option value="">Select leave type</option>
              {leaveTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <DateField name="start_date" label="Start date" value={startDate} onChange={setStartDate} />
          <DateField name="end_date" label="End date" value={endDate} onChange={setEndDate} />
          <div className="grid gap-2">
            <Label>Total days</Label>
            <div className="flex h-10 items-center rounded-md border px-3 text-sm">{totalDays}</div>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="reason">Reason</Label>
            <textarea id="reason" name="reason" rows={4} className="rounded-md border bg-background px-3 py-2 text-sm" />
          </div>
          {error ? <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm md:col-span-2">{error}</p> : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={isLoading || !totalDays}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Submit request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function DateField({
  name,
  label,
  value,
  onChange
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type="date" required value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
