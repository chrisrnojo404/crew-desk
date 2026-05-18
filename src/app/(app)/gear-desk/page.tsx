import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { GearDashboard } from "@/features/gear-desk/components/gear-dashboard";
import {
  listDamageReports,
  listGearCheckouts,
  listGearRequestItems,
  listGearRequests
} from "@/features/gear-desk/server/gear-desk";
import { getSessionUser } from "@/features/auth/server/session";

export default async function GearDeskPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const [requests, requestItems, checkouts, damageReports] = await Promise.all([
    listGearRequests(),
    listGearRequestItems(),
    listGearCheckouts(),
    listDamageReports()
  ]);

  return (
    <AppShell user={user}>
      <GearDashboard requests={requests} requestItems={requestItems} checkouts={checkouts} damageReports={damageReports} />
    </AppShell>
  );
}
