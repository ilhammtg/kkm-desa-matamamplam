import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

import { getSiteSettings } from "@/server/actions/settings.actions";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  
  return {
    title: {
      default: settings.site_name || "KKM Mata Mamplam",
      template: `%s | ${settings.site_name || "KKM Mata Mamplam"}`,
    },
    description: settings.hero_subtitle || "Website Resmi KKM Mata Mamplam",
    icons: {
      icon: settings.favicon_url || settings.logo_url || "/favicon.ico",
      shortcut: settings.favicon_url || settings.logo_url || "/favicon.ico",
      apple: settings.favicon_url || settings.logo_url || "/favicon.ico",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background antialiased")} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
