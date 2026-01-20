"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Facebook, Twitter, Linkedin, Globe, Video, MessageSquare, Menu, ArrowRight } from "lucide-react";
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
                <Button variant="ghost" size="icon" className="md:hidden hover:bg-primary/10 transition-colors">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] border-l-2 border-primary/20 bg-gradient-to-b from-background/95 to-secondary/30 backdrop-blur-xl p-0">
                <SheetHeader className="p-6 text-left border-b border-border/50">
                   <div className="flex items-center gap-3 mb-2">
                      {settings.logo_url ? (
                        <img src={settings.logo_url} alt="Logo" className="h-10 w-10 object-contain drop-shadow-sm" />
                       ) : <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center"><Globe className="h-6 w-6 text-primary"/></div>}
                      <SheetTitle className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        {settings.site_name || "KKM Mata Mamplam"}
                      </SheetTitle>
                   </div>
                </SheetHeader>
                
                <div className="flex flex-col h-full px-6 py-6">
                  <nav className="flex flex-col space-y-3">
                    {links.map((link, index) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="group flex items-center justify-between p-3 text-lg font-medium transition-all hover:bg-primary/10 rounded-xl hover:pl-5 data-[active=true]:bg-primary/5 data-[active=true]:text-primary"
                      >
                        <span className="bg-clip-text group-hover:text-primary transition-colors">{link.label}</span>
                        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-primary" />
                      </Link>
                    ))}
                  </nav>

                  <div className="mt-8 pt-8 border-t border-border/50">
                     <Link href="/login" className="w-full">
                        <Button className="w-full text-base font-semibold shadow-lg shadow-primary/20 flex items-center gap-2 group">
                           Login to Dashboard
                           <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                     </Link>
                  </div>

                  {/* Mobile Socials */}
                  <div className="mt-auto pb-8">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Connect With Us</p>
                      <div className="flex gap-4">
                         {/* Instagram */}
                         {settings.instagram_url && settings.instagram_url.trim() !== "" && (
                           <Link href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-secondary/50 hover:bg-pink-100 dark:hover:bg-pink-900/20 text-muted-foreground hover:text-pink-600 transition-all hover:scale-110">
                             <Instagram className="h-5 w-5" />
                           </Link>
                         )}
                         {/* TikTok */}
                         {settings.tiktok_url && settings.tiktok_url.trim() !== "" && (
                           <Link href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full bg-secondary/50 hover:bg-gray-200 dark:hover:bg-gray-800 text-muted-foreground hover:text-black dark:hover:text-white transition-all hover:scale-110">
                             <TikTokIcon className="h-5 w-5" /> 
                           </Link>
                         )}
                         {/* Youtube (Assuming available in settings/iconMap if needed) */}
                          <Link href="#" className="p-3 rounded-full bg-secondary/50 hover:bg-red-100 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-600 transition-all hover:scale-110">
                             <Youtube className="h-5 w-5" />
                           </Link>
                      </div>
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

