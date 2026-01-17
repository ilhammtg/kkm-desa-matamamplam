import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Activity, PenTool, Calendar, Lightbulb, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PDDDashboardProps {
  user: {
    name?: string | null;
  };
}

export function PDDDashboard({ user }: PDDDashboardProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white shadow-lg">
        <div className="relative z-10 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl text-white">
            Halo, {user.name?.split(" ")[0] || "Partner"}! 👋
          </h1>
          <p className="max-w-xl text-blue-100 md:text-lg">
            Selamat datang di workspace kreatifmu. Mulai dokumentasikan momen dan cerita KKM hari ini.
          </p>
        </div>
        {/* Abstract Shapes Decoration */}
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-12 right-20 h-40 w-40 rounded-full bg-blue-400/20 blur-2xl" />
      </div>

      {/* Main Action Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Link href="/dashboard/posts/new?type=ARTICLE" className="group h-full">
          <Card className="h-full border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ring-1 ring-border/50 hover:ring-blue-500/50 bg-gradient-to-br from-card to-blue-50/50 dark:from-card dark:to-blue-950/20">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
                <PenTool className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Tulis Artikel Baru</CardTitle>
              <CardDescription className="text-base">
                Bagikan opini, berita, atau cerita inspiratif dari lapangan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                Mulai Menulis <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/posts/new?type=ACTIVITY" className="group h-full">
          <Card className="h-full border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ring-1 ring-border/50 hover:ring-green-500/50 bg-gradient-to-br from-card to-green-50/50 dark:from-card dark:to-green-950/20">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400">
                <Activity className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Catat Kegiatan</CardTitle>
              <CardDescription className="text-base">
                Dokumentasikan proker, rapat, atau agenda harian kelompok.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm font-medium text-green-600 dark:text-green-400 group-hover:underline">
                Buat Laporan <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Info & Status Section */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Tips */}
        <Card className="col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Tips Konten Menarik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <h4 className="font-semibold text-sm mb-1">Judul yang Memikat</h4>
                <p className="text-xs text-muted-foreground">Buat judul singkat, padat, dan bikin penasaran pembaca.</p>
              </div>
              <div className="rounded-lg border p-3">
                <h4 className="font-semibold text-sm mb-1">Visual itu Penting</h4>
                <p className="text-xs text-muted-foreground">Gunakan foto landscape kualitas tinggi untuk cover artikel.</p>
              </div>
              <div className="rounded-lg border p-3">
                <h4 className="font-semibold text-sm mb-1">Struktur yang Rapi</h4>
                <p className="text-xs text-muted-foreground">Manfaatkan Heading, list, dan paragraf pendek agar mudah dibaca.</p>
              </div>
              <div className="rounded-lg border p-3">
                <h4 className="font-semibold text-sm mb-1">Cek Typo</h4>
                <p className="text-xs text-muted-foreground">Baca ulang tulisanmu sebelum menekan tombol publish.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links / Status */}
        <Card className="flex flex-col shadow-sm bg-muted/50 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Dashboard Pintasus</CardTitle>
            <CardDescription>Akses cepat ke menu lainnya</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3">
            <Link href="/dashboard/posts" className="w-full">
              <Button variant="outline" className="w-full justify-between h-auto py-3 bg-background hover:bg-accent hover:text-accent-foreground">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Semua Postingan</span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </Link>
            {/* Future placeholders could go here */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
