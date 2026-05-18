import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/features/auth/server/session";
import { ProductionsDashboard } from "@/features/productions/components/productions-dashboard";
import {
  listProductionActivities,
  listProductionAssignments,
  listProductions
} from "@/features/productions/server/productions";

export default async function ProductionsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [productions, assignments, activities] = await Promise.all([
    listProductions(),
    listProductionAssignments(),
    listProductionActivities()
  ]);

  return (
    <AppShell user={user}>
      <ProductionsDashboard productions={productions} assignments={assignments} activities={activities} />
    </AppShell>
  );
}
