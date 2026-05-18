import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/features/auth/server/session";
import { ProductionDetail } from "@/features/productions/components/production-detail";
import {
  getProduction,
  listProductionActivities,
  listProductionAssets,
  listProductionAssignments
} from "@/features/productions/server/productions";

export default async function ProductionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const [production, assignments, activities, assets] = await Promise.all([
    getProduction(id),
    listProductionAssignments(id),
    listProductionActivities(id),
    listProductionAssets(id)
  ]);

  if (!production) notFound();

  return (
    <AppShell user={user}>
      <ProductionDetail production={production} assignments={assignments} activities={activities} assets={assets} />
    </AppShell>
  );
}
