"use server";

import { prisma as db } from "@/server/db/prisma";
import { revalidatePath } from "next/cache";

export async function incrementPostView(postId: string) {
  try {
    await db.post.update({
      where: { id: postId },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  } catch (error) {
    console.error("Error incrementing post view:", error);
    // Don't throw, just log. Analytics shouldn't break the app.
  }
}

export async function incrementSiteVisit() {
  try {
    const today = new Date();
    // Normalize to YYYY-MM-DD
    today.setHours(0, 0, 0, 0);

    const visit = await db.siteVisit.findUnique({
      where: {
        date: today,
      },
    });

    if (visit) {
      await db.siteVisit.update({
        where: {
          id: visit.id,
        },
        data: {
          count: {
            increment: 1,
          },
        },
      });
    } else {
      await db.siteVisit.create({
        data: {
          date: today,
          count: 1,
        },
      });
    }
  } catch (error) {
    console.error("Error incrementing site visit:", error);
  }
}

export async function getAnalyticsData() {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Normalize today for comparison
    today.setHours(23, 59, 59, 999);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [siteVisits, topPosts] = await Promise.all([
      db.siteVisit.findMany({
        where: {
          date: {
            gte: thirtyDaysAgo,
            lte: today,
          },
        },
        orderBy: {
          date: "asc",
        },
      }),
      db.post.findMany({
        orderBy: {
          views: "desc",
        },
        take: 10,
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          views: true,
        },
      }),
    ]);

    // Calculate total visits
    const totalVisits = siteVisits.reduce((acc: number, curr: { count: number }) => acc + curr.count, 0);

    return {
      siteVisits,
      topPosts,
      totalVisits,
    };
  } catch (error) {
    console.error("Error fetching analytics data:", error);
    return {
      siteVisits: [],
      topPosts: [],
      totalVisits: 0,
    };
  }
}
