"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Users, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role;

  const sidebarItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["SUPERADMIN", "PDD"],
    },
    {
      title: "Posts",
      href: "/dashboard/posts",
      icon: FileText,
      roles: ["SUPERADMIN", "PDD"],
    },
    {
      title: "Users",
      href: "/dashboard/users",
      icon: Users,
      roles: ["SUPERADMIN"],
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["SUPERADMIN"],
    },
  ];

  return (
    <aside className="hidden w-64 flex-col border-r bg-muted/40 md:flex h-screen sticky top-0">
      <div className="flex h-14 items-center border-b px-6 font-semibold">
        KKM Admin
        {role && (
          <span className="ml-2 text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded">
            {role}
          </span>
        )}
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          {sidebarItems.map((item, index) => {
            if (role && !item.roles.includes(role)) return null;

            const Icon = item.icon;
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  pathname === item.href
                    ? "bg-muted text-primary"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <div className="mb-4 px-2">
            <p className="text-sm font-medium">{session?.user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
        </div>
         <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
            Logout
         </Button>
      </div>
    </aside>
  );
}
