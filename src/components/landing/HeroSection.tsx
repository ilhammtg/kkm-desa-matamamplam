import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  settings: Record<string, string>;
}

export function HeroSection({ settings }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      {/* Abstract Background Shapes */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
        />
      </div>

      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              {settings.hero_title || "Mengabdi untuk Masyarakat"}
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              {settings.hero_subtitle ||
                "Bersama KKM Mata Mamplam membangun masa depan desa yang lebih cerah dan berkelanjutan."}
            </p>
          </div>
          <div className="space-x-4">
            <Link href="/kegiatan">
              <Button size="lg" className="h-11 px-8">
                Lihat Kegiatan
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg" className="h-11 px-8">
                Tentang Kami <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
