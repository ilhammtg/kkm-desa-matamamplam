import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/server/actions/settings.actions";

export default async function LoginPage() {
  const settings = await getSiteSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar settings={settings} />
      <div className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<div>Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
      <Footer settings={settings} />
    </div>
  );
}
