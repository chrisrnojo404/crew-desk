import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/features/auth/server/session";
import { ProductionForm } from "@/features/productions/components/production-form";

export default async function NewProductionPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  return (
    <AppShell user={user}>
      <ProductionForm />
    </AppShell>
  );
}
