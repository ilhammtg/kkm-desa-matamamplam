"use client";

import { SidebarContent } from "@/components/layout/SidebarContent";

export function DashboardSidebar() {
  return (
    <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex h-screen sticky top-0">
      <SidebarContent />
    </aside>
  );
}

