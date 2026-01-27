import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { DashboardTopbar } from "@/components/layout/DashboardTopbar";

// Force dynamic rendering for all dashboard pages (requires authentication)
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/40">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
