
import { MetadataRoute } from "next";
import { prisma } from "@/server/db/prisma";
import { PostStatus, PostType } from "@prisma/client";

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

    // 2. Fetch All Published Posts
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
}
