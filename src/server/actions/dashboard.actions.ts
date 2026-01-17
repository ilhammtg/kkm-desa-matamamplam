"use server";

import { prisma } from "@/server/db/prisma";

export async function getDashboardStats() {
  const [
    totalUsers,
    activeUsers,
    totalPosts,
    publishedPosts,
    draftPosts,
    articles,
    activities
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.post.count({ where: { type: "ARTICLE" } }),
    prisma.post.count({ where: { type: "ACTIVITY" } }),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
    },
    posts: {
      total: totalPosts,
      published: publishedPosts,
      draft: draftPosts,
      articles,
      activities,
    },
  };
}
