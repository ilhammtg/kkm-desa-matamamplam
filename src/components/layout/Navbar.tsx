import Link from "next/link";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  settings: Record<string, string>;
}

export function Navbar({ settings }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
             {settings.logo_url && <img src={settings.logo_url} alt="Logo" className="h-8 w-8 object-contain" />}
            <span className="hidden font-bold sm:inline-block">
              {settings.site_name || "KKM Mata Mamplam"}
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/kegiatan" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Kegiatan
            </Link>
            <Link href="/artikel" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Artikel
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other items */}
          </div>
          <nav className="flex items-center">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Login
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
