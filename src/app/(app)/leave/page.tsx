import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/features/auth/server/session";
import { LeaveDashboard } from "@/features/leave/components/leave-dashboard";
import { listLeaveBalances, listLeaveRequests } from "@/features/leave/server/leave";

export default async function LeavePage() {
  const user = await getSessionUser();

  if (!user) redirect("/login");

  const [requests, balances] = await Promise.all([listLeaveRequests(), listLeaveBalances()]);

  return (
    <AppShell user={user}>
      <LeaveDashboard requests={requests} balances={balances} />
    </AppShell>
  );
}
