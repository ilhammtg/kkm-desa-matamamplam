import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardTopbar() {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
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
