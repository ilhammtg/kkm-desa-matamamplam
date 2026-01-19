"use client";

import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/layout/SidebarContent";
import { useState } from "react";

export function DashboardTopbar() {
    const [open, setOpen] = useState(false);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-64">
           {/* SidebarContent handles the layout internally now */}
           <SidebarContent onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="w-full flex-1">
        {/* Breadcrumbs or search could go here */}
      </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <User className="h-5 w-5" />
        <span className="sr-only">Toggle user menu</span>
      </Button>
    </header>
  );
}
