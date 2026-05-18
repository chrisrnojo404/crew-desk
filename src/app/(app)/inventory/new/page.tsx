import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/features/auth/server/session";
import { AssetForm } from "@/features/inventory/components/asset-form";
import { listInventoryCategories, listLocations, listVendors } from "@/features/inventory/server/inventory";

export default async function NewAssetPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const [categories, vendors, locations] = await Promise.all([listInventoryCategories(), listVendors(), listLocations()]);

  return (
    <AppShell user={user}>
      <AssetForm categories={categories} vendors={vendors} locations={locations} />
    </AppShell>
  );
}
