
import { MetadataRoute } from "next";
import { prisma } from "@/server/db/prisma";
import { PostStatus, PostType } from "@prisma/client";

// Force dynamic generation to avoid database access during build
export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kkm.matamamplam.com";

    // 1. Static Routes
    const routes = [
        "",
        "/about",
        "/artikel",
        "/kegiatan",
        "/transparansi",
        "/contact",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.8,
    }));

    // 2. Fetch All Published Posts (with error handling for build time)
    try {
        const posts = await prisma.post.findMany({
            where: {
                status: PostStatus.PUBLISHED,
            },
            select: {
                slug: true,
                updatedAt: true,
                type: true,
            },
        });

        // 3. Map Posts to Sitemap Entries
        const postRoutes = posts.map((post) => ({
            url: `${baseUrl}/${post.type === PostType.ARTICLE ? "artikel" : "kegiatan"}/${post.slug}`,
            lastModified: post.updatedAt,
            changeFrequency: "weekly" as const,
            priority: 0.7,
        }));

        return [...routes, ...postRoutes];
    } catch (error) {
        // If database is not available (e.g., during build), return static routes only
        console.warn("Database not available for sitemap generation, returning static routes only");
        return routes;
    }
}
