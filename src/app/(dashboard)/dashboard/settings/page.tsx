import { getSiteSettings } from "@/server/actions/settings.actions";
import { SettingsForm } from "@/components/dashboard/settings/SettingsForm";

export default async function DashboardSettingsPage() {
  const settings = await getSiteSettings();

  const initialData = {
    site_name: settings.site_name || "",
    logo_url: settings.logo_url || "",
    favicon_url: settings.favicon_url || "",
    hero_title: settings.hero_title || "",
    hero_subtitle: settings.hero_subtitle || "",
    instagram_url: settings.instagram_url || "",
    tiktok_url: settings.tiktok_url || "",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Site Settings</h2>
      </div>

      <SettingsForm initialData={initialData} />
    </div>
  );
}
