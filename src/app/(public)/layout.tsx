
import { getSiteSettings, getSocialMedias } from "@/server/actions/settings.actions";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const socials = await getSocialMedias();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar settings={settings} socials={socials} />
      <main className="flex-1">
        {children}
      </main>
      <Footer settings={settings} />
    </div>
  );
}
