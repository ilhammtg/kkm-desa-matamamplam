import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { Post } from "@prisma/client";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar } from "lucide-react";

interface LatestPostsProps {
  posts: Post[];
}

export function LatestPosts({ posts }: LatestPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Terbaru dari Kami</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Berita dan kegiatan terkini dari KKM Mata Mamplam.
            </p>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card key={post.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative aspect-video w-full overflow-hidden">
                 {post.coverImageUrl ? (
                    <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                 ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                        No Image
                    </div>
                 )}
                 <Badge className="absolute top-2 right-2 bg-primary/90 hover:bg-primary">{post.type}</Badge>
              </div>
              <CardHeader className="p-4">
                <CardTitle className="line-clamp-2 text-lg hover:text-primary transition-colors">
                    <Link href={`/posts/${post.slug}`}>
                        {post.title}
                    </Link>
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar className="mr-1 h-3 w-3" />
                    {post.publishedAt ? format(new Date(post.publishedAt), "MMMM d, yyyy") : "Draft"}
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-grow">
                <p className="text-sm text-gray-500 line-clamp-3">
                  {post.excerpt || "Baca selengkapnya untuk mengetahui detail kegiatan ini."}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Link href={`/posts/${post.slug}`} className="text-sm font-medium text-primary hover:underline flex items-center">
                  Baca Selengkapnya <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className="flex justify-center mt-10">
            <Link href="/artikel" className="text-sm font-semibold text-primary hover:underline">
                Lihat Semua Artikel &rarr;
            </Link>
        </div>
      </div>
    </section>
  );
}
