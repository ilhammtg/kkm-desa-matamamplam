import { PrismaClient } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Target, Users, Zap, Heart, Globe, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const prisma = new PrismaClient();

// Map icon strings to components
const iconMap: Record<string, any> = {
  Users: Users,
  Target: Target,
  Zap: Zap,
  Heart: Heart,
  Globe: Globe,
  BookOpen: BookOpen,
  CheckCircle2: CheckCircle2, // Added CheckCircle2 as it's used in the new code
  ArrowRight: ArrowRight, // Added ArrowRight as it's used in the new code
};

export const revalidate = 0; // Ensure fresh data on every request

export default async function AboutPage() {
  const aboutData = await prisma.aboutPage.findFirst({
    include: {
      missionItems: { orderBy: { order: "asc" } },
      programItems: { orderBy: { order: "asc" } },
    },
  });

  if (!aboutData) {
    return <div className="p-20 text-center">Data About Us belum disetup. Silahkan buka halaman Settings di Admin.</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-24 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="container px-6 mx-auto text-center max-w-4xl">
            <Badge variant="outline" className="mb-6 px-4 py-1 text-sm border-primary/30 text-primary bg-primary/5 uppercase tracking-widest">
                Tentang Kami
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 mb-8 leading-tight">
                {aboutData.landingTitle || "Membangun Desa, Merajut Masa Depan."}
            </h1>
            <div 
                className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto prose prose-neutral dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: aboutData.landingContentHtml || "<p>KKM Mata Mamplam berkomitmen untuk memberdayakan masyarakat desa melalui inovasi, pendidikan, dan kolaborasi yang berkelanjutan.</p>" }}
            />
        </div>
      </section>

      {/* --- VISION SECTION --- */}
      <section className="py-24 relative">
        <div className="container px-6 mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition duration-1000" />
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl border border-border/50">
                        <Image 
                            src={aboutData.visionImageUrl || "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2664&auto=format&fit=crop"}
                            alt="Vision"
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    </div>
                </div>
                <div className="space-y-8">
                    <div>
                        <h2 className="text-primary font-semibold tracking-wide uppercase mb-3 text-sm">
                            {aboutData.visionLabel || "VISI KAMI"}
                        </h2>
                        <h3 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
                            {aboutData.visionTitle || "Mewujudkan Masyarakat yang Mandiri"}
                        </h3>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            {aboutData.visionDescription}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <Separator className="opacity-50" />

      {/* --- MISSION SECTION --- */}
      <section className="py-24 bg-secondary/5">
        <div className="container px-6 mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-primary font-semibold tracking-wide uppercase mb-3 text-sm">
                    {aboutData.missionLabel || "MISI KAMI"}
                </h2>
                <h3 className="text-3xl md:text-4xl font-bold mb-6">
                    {aboutData.missionTitle || "Langkah Nyata Untuk Perubahan"}
                </h3>
                <p className="text-muted-foreground text-lg">
                    {aboutData.missionSubtitle || "Strategi utama kami dalam mewujudkan visi menjadi aksi nyata."}
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {aboutData.missionItems.map((item, idx) => {
                    const Icon = iconMap[item.icon || "Target"] || Target;
                    return (
                        <Card key={item.id} className="bg-background border-border/50 hover:border-primary/50 transition-colors duration-300">
                            <CardContent className="pt-8 pb-8 px-6 text-center space-y-4">
                                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                                    <Icon className="w-7 h-7" />
                                </div>
                                <h4 className="text-xl font-bold">{item.title}</h4>
                                <p className="text-muted-foreground leading-relaxed">
                                    {item.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
      </section>

      {/* --- PROGRAMS SECTION --- */}
      <section className="py-24">
        <div className="container px-6 mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div className="max-w-2xl">
                    <Badge className="mb-4 bg-primary text-primary-foreground hover:bg-primary/90">
                        {aboutData.programBadge || "PROGRAM UNGGULAN"}
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold">
                        {aboutData.programTitle || "Inisiatif Kunci Kami"}
                    </h2>
                    <p className="text-muted-foreground text-lg mt-4">
                        {aboutData.programSubtitle || "Fokus utama kami dalam memberdayakan masyarakat."}
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {aboutData.programItems.map((program, idx) => (
                    <div key={program.id} className="group relative bg-card rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
                        <div className="absolute top-8 right-8 text-6xl font-black text-muted/10 group-hover:text-primary/10 transition-colors pointer-events-none select-none">
                            {program.numberLabel || String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="relative z-10 space-y-6">
                             <div className="w-12 h-1 bg-gradient-to-r from-primary to-transparent rounded-full" />
                             <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                                {program.title}
                             </h3>
                             <p className="text-muted-foreground leading-relaxed">
                                {program.description}
                             </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}