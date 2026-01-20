
import { getSiteSettings } from "@/server/actions/settings.actions";
import { PrismaClient, PostType, PostStatus } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = "force-dynamic";

// const prisma = new PrismaClient(); // Removed


async function getArticles() {
  return await prisma.post.findMany({
    where: {
      type: PostType.ARTICLE,
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

export default async function ArtikelPage() {
  const settings = await getSiteSettings();
  const articles = await getArticles();

  return (
    <div className="flex min-h-screen flex-col bg-background">

      <main className="flex-1 container py-12 max-w-7xl mx-auto px-6">
         <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Artikel Terkini</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Tulisan, opini, dan informasi menarik seputar kegiatan kami dan potensi desa.
            </p>
        </div>

        {articles.length > 0 ? (
             <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                 {articles.map((article) => (
                    <article key={article.id} className="flex flex-col group">
                        <Link href={`/artikel/${article.slug}`} className="overflow-hidden rounded-2xl mb-4 relative aspect-[4/3]">
                             {article.coverImageUrl ? (
                                <Image
                                    src={article.coverImageUrl}
                                    alt={article.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                    No Image
                                </div>
                            )}
                        </Link>
                        
                        <div className="flex flex-col flex-1">
                             <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
                                <span className="text-primary">Artikel</span>
                                <span>•</span>
                                <span>{format(new Date(article.createdAt), "d MMMM yyyy", { locale: id })}</span>
                             </div>
                            <h2 className="text-2xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
                                <Link href={`/artikel/${article.slug}`}>
                                    {article.title}
                                </Link>
                            </h2>
                            <p className="text-muted-foreground line-clamp-3 mb-4 text-base leading-relaxed">
                                {article.excerpt}
                            </p>
                            <Link href={`/artikel/${article.slug}`} className="learn-more inline-flex items-center text-sm font-semibold text-primary hover:underline mt-auto">
                                Baca Selengkapnya <ArrowRight className="ml-1 h-4 w-4" />
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        ) : (
            <div className="text-center py-20 text-muted-foreground">
                <p>Belum ada artikel yang diterbitkan.</p>
            </div>
        )}
      </main>
    </div>
  );
}
