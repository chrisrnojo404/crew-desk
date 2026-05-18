import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DirectusRole } from "@/features/admin/types";

const matrix = [
  { module: "Authentication", employee: "Self", manager: "Team", hr: "People", admin: "Full" },
  { module: "User Directory", employee: "Self", manager: "Read", hr: "Manage", admin: "Full" },
  { module: "Inventory", employee: "Request", manager: "Approve", hr: "Read", admin: "Full" },
  { module: "Gear Desk", employee: "Request", manager: "Read", hr: "Read", admin: "Full" },
  { module: "Audit Logs", employee: "None", manager: "None", hr: "Read", admin: "Full" }
];

export function RolesMatrix({ roles }: { roles: DirectusRole[] }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <CardTitle className="text-base">{role.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{role.description ?? "Crew Desk access role"}</p>
            </CardHeader>
            <CardContent className="flex gap-2">
              {role.name.toLowerCase() === "admin" ? <Badge>Admin</Badge> : null}
              <Badge variant="secondary">App access</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <div className="grid min-w-[780px] grid-cols-5 border-b px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <div>Module</div>
          <div>Employee</div>
          <div>Manager</div>
          <div>HR</div>
          <div>Admin</div>
        </div>
        {matrix.map((row) => (
          <div key={row.module} className="grid min-w-[780px] grid-cols-5 border-b px-4 py-4 text-sm last:border-b-0">
            <div className="font-medium">{row.module}</div>
            <div className="text-muted-foreground">{row.employee}</div>
            <div className="text-muted-foreground">{row.manager}</div>
            <div className="text-muted-foreground">{row.hr}</div>
            <div className="text-muted-foreground">{row.admin}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
