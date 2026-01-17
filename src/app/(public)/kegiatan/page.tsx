import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/server/actions/settings.actions";

export default async function KegiatanPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar settings={settings} />
      <main className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Kegiatan KKM</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* TODO: Add logic to fetch and display list of Activity type posts */}
             <p className="text-gray-500 col-span-full">Belum ada kegiatan yang diterbitkan.</p>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
}
