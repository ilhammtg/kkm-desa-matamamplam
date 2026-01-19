"use server";

import { prisma } from "@/server/db/prisma";
import { getServerAuthSession } from "@/server/auth/session";
import { revalidatePath } from "next/cache";
import { PostStatus, PostType } from "@prisma/client";

// Get all posts with pagination and search
// Get all posts with pagination, search, and optional status filter
export async function getPosts(page = 1, limit = 10, search = "", status?: PostStatus) {
  const skip = (page - 1) * limit;

  const where: any = {
    AND: [
      search
        ? {
            OR: [{ title: { contains: search } }, { content: { contains: search } }],
          }
        : {},
      status ? { status } : {},
    ],
  };

  try {
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: { author: { select: { name: true, email: true } } },
      }),
      prisma.post.count({ where }),
    ]);

    return {
      posts,
      total,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Failed to fetch posts:", error);
    return {
      posts: [],
      total: 0,
      totalPages: 0,
    };
  }
}

// Get single post by ID
export async function getPost(id: string) {
  return await prisma.post.findUnique({ where: { id } });
}

// Get single post by Slug
export async function getPostBySlug(slug: string) {
  return await prisma.post.findUnique({ 
    where: { slug },
    include: { author: { select: { name: true } } } 
  });
}

// Create new post
export async function createPost(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  location?: string;
  type: PostType;
  coverImageUrl?: string;
  status: PostStatus;
}) {
  const session = await getServerAuthSession();
  if (!session || !session.user.id) throw new Error("Unauthorized");

  // Check unique slug
  const existing = await prisma.post.findUnique({ where: { slug: data.slug } });
  if (existing) throw new Error("Slug already exists");

  const post = await prisma.post.create({
    data: {
      ...data,
      authorId: session.user.id,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  revalidatePath("/dashboard/posts");
  revalidatePath("/kegiatan");
  revalidatePath("/artikel");
  return post;
}

// Update post
export async function updatePost(
  id: string,
  data: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    location?: string;
    type?: PostType;
    coverImageUrl?: string;
    status?: PostStatus;
  }
) {
  const session = await getServerAuthSession();
  if (!session) throw new Error("Unauthorized");

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...data,
      publishedAt:
        data.status === "PUBLISHED" ? new Date() : data.status === "DRAFT" ? null : undefined,
    },
  });

  revalidatePath("/dashboard/posts");
  revalidatePath("/kegiatan");
  revalidatePath("/artikel");
  revalidatePath(`/kegiatan/${post.slug}`);
  revalidatePath(`/artikel/${post.slug}`);
  return post;
}

// Delete post
export async function deletePost(id: string) {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== "SUPERADMIN") throw new Error("Unauthorized");

  await prisma.post.delete({ where: { id } });
  revalidatePath("/dashboard/posts");
}
