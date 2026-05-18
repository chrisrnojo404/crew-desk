import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { GearRequestForm } from "@/features/gear-desk/components/gear-request-form";
import { listAvailableGearItems } from "@/features/gear-desk/server/gear-desk";
import { getSessionUser } from "@/features/auth/server/session";

export default async function NewGearRequestPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const items = await listAvailableGearItems();

  return (
    <AppShell user={user}>
      <GearRequestForm items={items} />
    </AppShell>
  );
}
