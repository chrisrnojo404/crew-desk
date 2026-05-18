import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/features/auth/server/session";
import { InventoryDashboard } from "@/features/inventory/components/inventory-dashboard";
import { listInventoryCategories, listInventoryItems, listMaintenanceLogs } from "@/features/inventory/server/inventory";

export default async function InventoryPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const [items, categories, maintenanceLogs] = await Promise.all([
    listInventoryItems(),
    listInventoryCategories(),
    listMaintenanceLogs()
  ]);

  return (
    <AppShell user={user}>
      <InventoryDashboard items={items} categories={categories} maintenanceLogs={maintenanceLogs} />
    </AppShell>
  );
}
