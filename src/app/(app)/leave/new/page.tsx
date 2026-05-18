import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/features/auth/server/session";
import { LeaveRequestForm } from "@/features/leave/components/leave-request-form";
import { listLeaveTypes } from "@/features/leave/server/leave";

export default async function NewLeaveRequestPage() {
  const user = await getSessionUser();

  if (!user) redirect("/login");

  const leaveTypes = await listLeaveTypes();

  return (
    <AppShell user={user}>
      <LeaveRequestForm leaveTypes={leaveTypes} />
    </AppShell>
  );
}
