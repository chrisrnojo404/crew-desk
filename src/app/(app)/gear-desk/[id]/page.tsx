import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { GearRequestDetail } from "@/features/gear-desk/components/gear-request-detail";
import { getGearRequest, listGearCheckouts, listGearRequestItems } from "@/features/gear-desk/server/gear-desk";
import { getSessionUser } from "@/features/auth/server/session";

export default async function GearRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/login");
  }

  const { id } = await params;
  const [request, items, checkouts] = await Promise.all([getGearRequest(id), listGearRequestItems(id), listGearCheckouts()]);

  if (!request) {
    notFound();
  }

  return (
    <AppShell user={user}>
      <GearRequestDetail
        request={request}
        items={items}
        checkouts={checkouts.filter((checkout) => checkout.request?.id === request.id)}
      />
    </AppShell>
  );
}
