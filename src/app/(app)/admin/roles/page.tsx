import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { RolesMatrix } from "@/features/admin/components/roles-matrix";
import { listRoles } from "@/features/admin/server/users";
import { canManageUsers, getSessionUser } from "@/features/auth/server/session";

export default async function RolesPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!canManageUsers(user)) {
    redirect("/dashboard");
  }

  const roles = await listRoles();

  return (
    <AppShell user={user}>
      <div className="grid gap-6">
        <div>
          <p className="text-sm text-muted-foreground">Phase 2 access model</p>
          <h1 className="text-2xl font-semibold tracking-normal">Roles & Permissions</h1>
        </div>
        <RolesMatrix roles={roles} />
      </div>
    </AppShell>
  );
}
