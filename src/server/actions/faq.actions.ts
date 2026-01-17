"use server";

import { prisma } from "@/server/db/prisma";
import { getServerAuthSession } from "@/server/auth/session";
import { revalidatePath } from "next/cache";

export async function getFAQs() {
  return await prisma.faq.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createFAQ(data: { question: string; answer: string }) {
  const session = await getServerAuthSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.faq.create({
    data: {
        question: data.question,
        answer: data.answer,
    },
  });

  revalidatePath("/dashboard/settings");
}

export async function updateFAQ(id: string, data: { question: string; answer: string }) {
  const session = await getServerAuthSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.faq.update({
    where: { id },
    data,
  });

  revalidatePath("/dashboard/settings");
}

export async function deleteFAQ(id: string) {
  const session = await getServerAuthSession();
  if (!session) throw new Error("Unauthorized");

  await prisma.faq.delete({
    where: { id },
  });

  revalidatePath("/dashboard/settings");
}
