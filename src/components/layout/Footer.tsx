interface FooterProps {
  settings: Record<string, string>;
}

export function Footer({ settings }: FooterProps) {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-center gap-4 py-8 md:h-24 md:flex-row md:py-0">
        <p className="text-center text-sm leading-loose text-muted-foreground w-full">
           &copy; {new Date().getFullYear()} {settings.site_name || "KKM Mata Mamplam"}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
