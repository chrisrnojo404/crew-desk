import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/features/auth/server/session";
import { AssetDetail } from "@/features/inventory/components/asset-detail";
import { getInventoryItem } from "@/features/inventory/server/inventory";

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const item = await getInventoryItem(id);

  if (!item) {
    notFound();
  }

  return (
    <AppShell user={user}>
      <AssetDetail item={item} />
    </AppShell>
  );
}
