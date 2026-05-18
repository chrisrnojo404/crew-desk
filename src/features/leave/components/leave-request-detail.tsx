import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaveStatusBadge } from "@/features/leave/components/leave-status-badge";
import type { LeaveRequest } from "@/features/leave/types";

function personName(person: LeaveRequest["employee"]) {
  if (!person) return "Unassigned";
  return [person.first_name, person.last_name].filter(Boolean).join(" ") || person.email;
}

export function LeaveRequestDetail({ request }: { request: LeaveRequest }) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{request.request_code ?? `LV-${request.id}`}</p>
          <h1 className="text-2xl font-semibold tracking-normal">{request.leave_type?.name ?? "Leave request"}</h1>
        </div>
        <LeaveStatusBadge status={request.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm md:grid-cols-2">
          <Field label="Employee" value={personName(request.employee)} />
          <Field label="Manager" value={personName(request.manager)} />
          <Field label="HR reviewer" value={personName(request.hr_reviewer)} />
          <Field label="Leave type" value={request.leave_type?.name} />
          <Field label="Start date" value={request.start_date} />
          <Field label="End date" value={request.end_date} />
          <Field label="Total days" value={String(request.total_days ?? "Not recorded")} />
          <Field label="Manager status" value={request.manager_status} />
          <Field label="HR status" value={request.hr_status} />
          <Field label="Approval notes" value={request.approval_notes} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reason</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">{request.reason || "No reason provided."}</CardContent>
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
