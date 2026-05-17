import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSessionUser } from "@/features/auth/server/session";

const modules = [
  { name: "Leave Management", status: "Phase 5", metric: "Approval workflows" },
  { name: "Inventory Assets", status: "Phase 3", metric: "Lifecycle tracking" },
  { name: "Gear Desk", status: "Phase 4", metric: "Reservations and checkout" },
  { name: "Production Planning", status: "Phase 6", metric: "Assignments and schedules" }
];

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell user={user}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Phase 1 foundation</p>
            <h1 className="text-2xl font-semibold tracking-normal">Operations Dashboard</h1>
          </div>
          <Badge variant="secondary">Authenticated with Directus</Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => (
            <Card key={module.name}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">{module.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{module.metric}</p>
              </CardHeader>
              <CardContent>
                <Badge>{module.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Phase 1 Readiness</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <p>Next.js app shell, dark mode, responsive navigation, and auth routes are in place.</p>
            <p>Directus and PostgreSQL run through Docker Compose with JWT-based session handling.</p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
