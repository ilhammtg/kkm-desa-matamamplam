"use server";

import { prisma } from "@/server/db/prisma";
import { getServerAuthSession } from "@/server/auth/session";
import { revalidatePath } from "next/cache";

export async function getSiteSettings() {
  const settings = await prisma.siteSetting.findMany();
  // Transform to object for easier consumption
  return settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);
}

export async function updateSiteSettings(data: Record<string, string>) {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== "SUPERADMIN") {
    throw new Error("Unauthorized");
  }

  // Update in loop (using transaction would be better but this is fine for low volume)
  await prisma.$transaction(
    Object.entries(data).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );

  revalidatePath("/");
  revalidatePath("/dashboard/settings");
}
