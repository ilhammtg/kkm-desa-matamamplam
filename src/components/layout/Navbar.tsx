"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube, Facebook, Twitter, Linkedin, Globe, Video, MessageSquare, Menu, ArrowRight } from "lucide-react";
import { SocialMedia } from "@prisma/client";
import { TikTokIcon } from "@/components/icons/TikTokIcon";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface NavbarProps {
  settings: Record<string, string>;
  socials?: SocialMedia[];
}

const iconMap: Record<string, any> = {
  Instagram,
  Youtube,
  TikTok: TikTokIcon,
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
    { href: "/transparansi", label: "Cash Flow" },
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
            <div className="flex items-center space-x-1 border-l pl-4 ml-4 h-6">
               {socials.map((social) => {
                 const Icon = iconMap[social.platform] || Globe;
                 return (
                   <Link 
                     key={social.id} 
                     href={social.url} 
                     target="_blank" 
                     rel="noopener noreferrer" 
                     className="text-muted-foreground hover:text-primary transition-colors p-1.5 hover:bg-secondary rounded-full"
                   >
                     <Icon className="h-4 w-4" />
                     <span className="sr-only">{social.platform}</span>
                   </Link>
                 );
               })}
            </div>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-4 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search */}
            <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const input = form.elements.namedItem("search") as HTMLInputElement;
                if (input.value.trim()) {
                    window.location.href = `/search?q=${encodeURIComponent(input.value)}`;
                }
            }} className="relative hidden lg:block w-full max-w-[200px]">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        name="search"
                        placeholder="Cari..."
                        className="w-full bg-background rounded-full pl-9 h-9 text-sm focus-visible:ring-primary/20"
                    />
                </div>
            </form>
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
                         {socials.map((social) => {
                             const Icon = iconMap[social.platform] || Globe;
                             return (
                               <Link 
                                 key={social.id}
                                 href={social.url} 
                                 target="_blank" 
                                 rel="noopener noreferrer" 
                                 className="p-3 rounded-full bg-secondary/50 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all hover:scale-110"
                               >
                                 <Icon className="h-5 w-5" />
                               </Link>
                             );
                         })}
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

