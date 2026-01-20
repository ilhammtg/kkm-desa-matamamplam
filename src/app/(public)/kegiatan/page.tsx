
import { getSiteSettings } from "@/server/actions/settings.actions";
import { PrismaClient, PostType, PostStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = "force-dynamic";

// const prisma = new PrismaClient(); // Removed


async function getActivities() {
  return await prisma.post.findMany({
    where: {
      type: PostType.ACTIVITY,
      status: PostStatus.PUBLISHED,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
        author: true
    }
  });
}

export default async function KegiatanPage() {
  const settings = await getSiteSettings();
  const activities = await getActivities();

  return (
    <div className="flex min-h-screen flex-col bg-background">

      <main className="flex-1 container py-12 max-w-7xl mx-auto px-6">
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Dokumentasi Kegiatan</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Berbagai aktivitas dan program kerja yang telah kami laksanakan bersama masyarakat desa Mata Mamplam.
            </p>
        </div>
        
        {activities.length > 0 ? (
             <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                 {activities.map((activity) => (
                    <article key={activity.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md">
                        <div className="relative aspect-video w-full overflow-hidden bg-muted">
                            {activity.coverImageUrl ? (
                                <Image
                                    src={activity.coverImageUrl}
                                    alt={activity.title}
                                    fill
                                    className="object-cover transition-transform duration-300 hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="flex flex-1 flex-col p-6">
                             <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{format(new Date(activity.createdAt), "d MMMM yyyy", { locale: id })}</span>
                                </div>
                             </div>
                            <h2 className="text-xl font-bold leading-tight mb-2 line-clamp-2">
                                <Link href={`/kegiatan/${activity.slug}`} className="hover:underline hover:text-primary">
                                    {activity.title}
                                </Link>
                            </h2>
                            <p className="text-muted-foreground line-clamp-3 mb-4 text-sm flex-1">
                                {activity.excerpt}
                            </p>
                             <div className="mt-auto flex items-center pt-4 border-t">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <User className="h-4 w-4" />
                                    <span>{activity.author?.name || "Admin"}</span>
                                </div>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 text-muted-foreground">
                <p>Belum ada kegiatan yang diterbitkan.</p>
            </div>
        )}
      </main>
    </div>
  );
}
