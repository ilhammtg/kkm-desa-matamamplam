
import { getSiteSettings } from "@/server/actions/settings.actions";
import { searchPublicPosts } from "@/server/actions/posts.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, Search as SearchIcon } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Pencarian | KKM Mata Mamplam",
    description: "Cari artikel dan kegiatan KKM Mata Mamplam.",
};

interface SearchPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const resolvedSearchParams = await searchParams;
    const query = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
    
    // Fetch data
    const [settings, results] = await Promise.all([
        getSiteSettings(),
        query ? searchPublicPosts(query) : Promise.resolve([])
    ]);

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950/50">
            
            <main className="flex-1 container max-w-5xl mx-auto px-6 py-12">
                
                {/* Search Header */}
                <div className="flex flex-col items-center mb-12 text-center space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight">Pencarian</h1>
                    <div className="w-full max-w-md relative">
                         <form action="/search" method="GET" className="relative w-full">
                            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                            <Input 
                                name="q" 
                                defaultValue={query} 
                                placeholder="Cari artikel atau kegiatan..." 
                                className="pl-10 h-11 rounded-full shadow-sm"
                            />
                        </form>
                    </div>
                    {query && (
                        <p className="text-muted-foreground">
                            Menampilkan hasil untuk kata kunci: <span className="font-semibold text-foreground">"{query}"</span>
                        </p>
                    )}
                </div>

                {/* Results */}
                {query ? (
                    results.length > 0 ? (
                        <div className="grid gap-6">
                            {results.map((post) => (
                                <div key={post.id} className="bg-background border rounded-xl p-4 md:p-6 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start">
                                    {/* Thumbnail (if any) */}
                                    {post.coverImageUrl && (
                                        <div className="w-full md:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-muted relative">
                                            <Image 
                                                src={post.coverImageUrl} 
                                                alt={post.title} 
                                                fill 
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-primary">
                                            <span className="bg-primary/10 px-2 py-0.5 rounded-full">{post.type}</span>
                                            <span className="text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(post.createdAt), "d MMM yyyy", { locale: id })}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold leading-tight">
                                            <Link href={`/${post.type === "ARTICLE" ? "artikel" : "kegiatan"}/${post.slug}`} className="hover:text-primary transition-colors">
                                                {post.title}
                                            </Link>
                                        </h3>
                                        <p className="text-muted-foreground text-sm line-clamp-2">
                                            {post.excerpt || "Tidak ada ringkasan."}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground space-y-2">
                            <SearchIcon className="h-12 w-12 mx-auto opacity-20" />
                            <p className="text-lg font-medium">Tidak ada hasil ditemukan.</p>
                            <p className="text-sm">Coba kata kunci lain atau periksa ejaan Anda.</p>
                        </div>
                    )
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        <p>Silakan masukkan kata kunci untuk mulai mencari.</p>
                    </div>
                )}

            </main>
        </div>
    );
}
