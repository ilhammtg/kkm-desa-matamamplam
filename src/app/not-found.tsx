import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="space-y-6 max-w-md">
        {/* Icon / Illustration */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <MapPin className="h-12 w-12 text-muted-foreground animate-bounce" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">404</h1>
          <h2 className="text-2xl font-semibold tracking-tight">Halaman Tidak Ditemukan</h2>
          <p className="text-muted-foreground">
            Maaf, sepertinya Anda tersesat. Halaman yang Anda cari tidak ada di desa ini.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button size="lg" className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
          <Link href="/kegiatan">
             <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Lihat Kegiatan
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-12 text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} KKM Mata Mamplam
      </div>
    </div>
  );
}
