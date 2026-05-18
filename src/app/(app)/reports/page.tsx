import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/features/auth/server/session";
import { ReportsDashboard } from "@/features/reports/components/reports-dashboard";
import { getReportingAnalytics, listKpiSnapshots, listReportDefinitions } from "@/features/reports/server/reports";

export default async function ReportsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [{ metrics, summaries }, definitions, snapshots] = await Promise.all([
    getReportingAnalytics(),
    listReportDefinitions(),
    listKpiSnapshots()
  ]);

  return (
    <AppShell user={user}>
      <ReportsDashboard metrics={metrics} summaries={summaries} definitions={definitions} snapshots={snapshots} />
    </AppShell>
  );
}
