"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Overview", href: "/dashboard/finance/overview" },
  { name: "Pemasukan", href: "/dashboard/finance/income" },
  { name: "Pengeluaran", href: "/dashboard/finance/expense" },
  { name: "Kategori", href: "/dashboard/finance/categories" },
  { name: "RAB (Anggaran)", href: "/dashboard/finance/rab" },
  { name: "Laporan", href: "/dashboard/finance/report" },
];

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6 p-6">
      <div className="pb-4 border-b print:hidden">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Keuangan & Bendahara</h1>
        <nav className="flex space-x-2 overflow-x-auto pb-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname.startsWith(item.href) ? "default" : "ghost"}
                size="sm"
                className="whitespace-nowrap"
              >
                {item.name}
              </Button>
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
