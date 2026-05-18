import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/features/auth/server/session";
import { LeaveRequestDetail } from "@/features/leave/components/leave-request-detail";
import { getLeaveRequest } from "@/features/leave/server/leave";

export default async function LeaveRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();

  if (!user) redirect("/login");

  const { id } = await params;
  const request = await getLeaveRequest(id);

  if (!request) notFound();

  return (
    <AppShell user={user}>
      <LeaveRequestDetail request={request} />
    </AppShell>
  );
}
