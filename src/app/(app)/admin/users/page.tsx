import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { UsersDirectory } from "@/features/admin/components/users-directory";
import { listDirectoryUsers, listRoles } from "@/features/admin/server/users";
import { canManageUsers, getSessionUser } from "@/features/auth/server/session";

export default async function UsersPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  if (!canManageUsers(user)) {
    redirect("/dashboard");
  }

  const [users, roles] = await Promise.all([listDirectoryUsers(), listRoles()]);

  return (
    <AppShell user={user}>
      <UsersDirectory users={users} roles={roles} />
    </AppShell>
  );
}
