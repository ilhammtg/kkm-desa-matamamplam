import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AboutSectionProps {
  title?: string;
  content: string;
  imageUrl?: string;
}

export function AboutSection({ title, content, imageUrl }: AboutSectionProps) {
  if (!content) return null;

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="container px-4 md:px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-20 items-center">
            <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">{title || "Tentang Kami"}</h2>
                <div 
                    className="prose dark:prose-invert max-w-none text-gray-500 md:text-lg"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
                 <Link href="/about">
                    <Button variant="default" className="mt-4">
                        Baca Selengkapnya
                    </Button>
                </Link>
            </div>
            <div className="relative aspect-square lg:aspect-auto lg:h-[400px] rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-xl">
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <img 
                        src={imageUrl || "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&auto=format&fit=crop&q=60"} 
                        alt="About Us" 
                        className="object-cover w-full h-full"
                    />
                 </div>
            </div>
        </div>
      </div>
    </section>
  );
}
