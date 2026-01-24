import { getSiteSettings } from "@/server/actions/settings.actions";
import { getPostBySlug } from "@/server/actions/posts.actions";
import { notFound } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, User, ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { PostType } from "@prisma/client";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { ShareActions } from "@/components/shared/ShareActions";
import { CommentSection } from "@/components/shared/CommentSection";
import { getPostComments } from "@/server/actions/comments.actions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const post = await getPostBySlug(decodedSlug);

  if (!post) {
    return {
      title: "Kegiatan Tidak Ditemukan",
    };
  }

  return {
    title: `${post.title} | KKM Mata Mamplam`,
    description: post.excerpt || post.content.substring(0, 160),
    openGraph: {
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
    },
  };
}

export default async function ActivityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  const [settings, post] = await Promise.all([
    getSiteSettings(),
    getPostBySlug(decodedSlug),
  ]);

  if (!post || post.type !== PostType.ACTIVITY) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-b from-muted/50 to-background">
            <div className="container max-w-4xl mx-auto px-6 text-center">
                 {/* Breadcrumb */}
                <div className="mb-8 flex justify-center">
                     <Link href="/kegiatan" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors bg-background/50 px-4 py-2 rounded-full border shadow-sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Kegiatan
                     </Link>
                </div>

                {/* Categories/Meta */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground mb-6 uppercase tracking-wider font-semibold">
                    <span className="text-secondary-foreground bg-secondary px-3 py-1 rounded-full text-xs">Kegiatan</span>
                     <div className="flex items-center gap-1">
                         <Calendar className="h-4 w-4" />
                         <time>{format(new Date(post.createdAt), "d MMMM yyyy", { locale: id })}</time>
                     </div>
                     {post.location && (
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{post.location}</span>
                        </div>
                     )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight mb-8 font-serif">
                    {post.title}
                </h1>

                {/* Author / Info */}
                <div className="flex items-center justify-center gap-4">
                     <div className="flex items-center gap-2">
                         <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground font-bold border-2 border-background shadow-sm">
                            {post.author?.name?.substring(0, 1) || "A"}
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-bold text-foreground">{post.author?.name || "Admin"}</p>
                            <p className="text-xs text-muted-foreground">Dokumentasi</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Featured Image */}
        {post.coverImageUrl && (
             <div className="container max-w-5xl mx-auto px-6 mb-12 lg:mb-16">
                <div className="relative aspect-video w-full overflow-hidden rounded-3xl shadow-2xl border bg-card">
                     <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>
        )}

        {/* Content Section */}
        <article className="container max-w-3xl mx-auto px-6 pb-24">
             <div 
                className="prose prose-lg dark:prose-invert max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                prose-p:leading-relaxed prose-p:text-muted-foreground
                prose-a:text-primary prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:border
                prose-blockquote:border-l-4 prose-blockquote:border-secondary prose-blockquote:bg-muted/30 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:italic
                prose-li:marker:text-secondary-foreground
                first-letter:text-5xl first-letter:font-bold first-letter:text-secondary-foreground first-letter:float-left first-letter:mr-3 first-letter:mt-[-8px]
                font-serif
                "
                dangerouslySetInnerHTML={{ __html: post.content }} 
             />

             {/* Share Section */}
             <div className="mt-12 py-6 border-t border-b flex justify-center">
                <ShareActions title={post.title} url={`/kegiatan/${slug}`} />
             </div>

             {/* Comments Section */}
             <div className="container max-w-3xl mx-auto mt-12">
                <CommentSection postId={post.id} existingComments={await getPostComments(post.id)} />
             </div>

             {/* Footer of Article */}
             <div className="mt-20 pt-10 border-t flex flex-col items-center text-center bg-gradient-to-br from-muted/30 to-muted/10 p-10 rounded-3xl gap-6">
                <div className="max-w-xl">
                    <h3 className="text-2xl font-bold mb-3">Dokumentasi Kegiatan Desa</h3>
                    <p className="text-muted-foreground text-lg mb-6">Lihat berbagai kegiatan dan program kerja lainnya yang telah kami laksanakan bersama masyarakat.</p>
                    <Link href="/kegiatan">
                        <Button size="lg" className="rounded-full px-8" variant="secondary">Lihat Kegiatan Lain</Button>
                    </Link>
                </div>
             </div>
        </article>

      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            image: post.coverImageUrl ? [post.coverImageUrl] : [],
            datePublished: post.publishedAt || post.createdAt,
            dateModified: post.updatedAt,
            author: [{
                "@type": "Person",
                name: post.author?.name || "Admin",
            }],
          }),
        }}
      />
    </div>
  );
}
