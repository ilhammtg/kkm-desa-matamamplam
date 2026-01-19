"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Facebook, Twitter, Linkedin, Globe, Video, MessageSquare, Menu } from "lucide-react";
import { SocialMedia } from "@prisma/client";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";

interface NavbarProps {
  settings: Record<string, string>;
  socials?: SocialMedia[];
}

const iconMap: Record<string, any> = {
  Instagram,
  Youtube,
  TikTok: MessageSquare, // Use MessageSquare or similar for TikTok if not available
  Facebook,
  Twitter,
  Linkedin,
  Website: Globe,
};

export function Navbar({ settings, socials = [] }: NavbarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/kegiatan", label: "Kegiatan" },
    { href: "/artikel", label: "Artikel" },
    { href: "/about", label: "Tentang Kami" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto px-6 flex h-16 items-center">
        <div className="mr-8 flex items-center">
          <Link href="/" className="mr-8 flex items-center space-x-3">
             {/* Only render if logo_url is present and not an empty string */}
             {settings.logo_url && settings.logo_url.trim() !== "" ? (
                <img src={settings.logo_url} alt="Logo" className="h-10 w-10 object-contain" />
             ) : null}
            <span className="hidden font-bold sm:inline-block text-lg tracking-tight">
              {settings.site_name || "KKM Mata Mamplam"}
            </span>
          </Link>
          <nav className="flex items-center space-x-2 text-sm font-medium hidden md:flex">
            {links.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                return (
                    <Link 
                        key={link.href}
                        href={link.href} 
                        className={cn(
                            "px-4 py-2 rounded-full transition-all duration-300",
                            isActive 
                                ? "bg-primary/10 text-primary font-bold shadow-sm" 
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        )}
                    >
                        {link.label}
                    </Link>
                );
            })}

            {/* Socials in Nav */}
            <div className="flex items-center space-x-3 border-l pl-4 ml-4 h-6">
               {/* Instagram */}
               {settings.instagram_url && settings.instagram_url.trim() !== "" && (
                 <Link href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-pink-600 transition-colors p-1.5 hover:bg-pink-50 rounded-full">
                   <Instagram className="h-5 w-5" />
                   <span className="sr-only">Instagram</span>
                 </Link>
               )}

               {/* TikTok */}
               {settings.tiktok_url && settings.tiktok_url.trim() !== "" && (
                 <Link href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-black transition-colors p-1.5 hover:bg-gray-100 rounded-full">
                   <TikTokIcon className="h-4 w-4" /> 
                   <span className="sr-only">TikTok</span>
                 </Link>
               )}
            </div>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other items */}
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/login" className="hidden md:block">
              <Button variant="ghost" size="sm" className="font-medium">
                Login
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                   <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-medium hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="h-px bg-border my-2" />
                  <Link href="/login">
                    <Button className="w-full">Login</Button>
                  </Link>

                  {/* Mobile Socials */}
                  <div className="flex gap-4 mt-4">
                     {/* Instagram */}
                     {settings.instagram_url && settings.instagram_url.trim() !== "" && (
                       <Link href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-pink-600">
                         <Instagram className="h-6 w-6" />
                       </Link>
                     )}
                     {/* TikTok */}
                     {settings.tiktok_url && settings.tiktok_url.trim() !== "" && (
                       <Link href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-black">
                         <TikTokIcon className="h-5 w-5" /> 
                       </Link>
                     )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  );
}

