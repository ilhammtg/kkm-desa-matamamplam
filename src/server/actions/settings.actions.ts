"use server";

import { prisma } from "@/server/db/prisma";
import { getServerAuthSession } from "@/server/auth/session";
import { revalidatePath } from "next/cache";


const DEFAULT_MISSION = JSON.stringify([
    {
      "id": "m1",
      "title": "Pemberdayaan Masyarakat",
      "description": "Meningkatkan kapasitas SDM melalui pelatihan dan pendampingan intensif.",
      "icon": "Users"
    },
    {
      "id": "m2",
      "title": "Pengembangan Ekonomi Lokal",
      "description": "Mendorong pertumbuhan UMKM dan industri kreatif berbasis potensi desa.",
      "icon": "Target"
    },
    {
      "id": "m3",
      "title": "Inovasi Digital",
      "description": "Memperkenalkan teknologi digital untuk efisiensi administrasi dan pemasaran desa.",
      "icon": "Zap"
    }
]);

const DEFAULT_PROGRAMS = JSON.stringify([
    {
      "id": "p1",
      "title": "Literasi Digital",
      "description": "Pelatihan penggunaan perangkat lunak dan internet sehat untuk siswa sekolah dasar dan menengah, serta pengenalan marketplace untuk pelaku usaha."
    },
    {
      "id": "p2",
      "title": "Revitalisasi UMKM",
      "description": "Pendampingan branding, pengemasan produk, dan legalitas usaha bagi para pelaku UMKM lokal untuk meningkatkan daya saing pasar."
    },
    {
      "id": "p3",
      "title": "Desa Sehat & Hijau",
      "description": "Kampanye pola hidup bersih dan sehat (PHBS) serta program penghijauan lingkungan desa dan pengelolaan sampah terpadu."
    }
]);

export async function getSiteSettings() {
  const settings = await prisma.siteSetting.findMany();
  // Transform to object for easier consumption
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  // Apply Defaults
  if (!settingsMap.about_mission) settingsMap.about_mission = DEFAULT_MISSION;
  if (!settingsMap.about_programs) settingsMap.about_programs = DEFAULT_PROGRAMS;
  if (!settingsMap.about_vision) settingsMap.about_vision = "Kami percaya bahwa setiap desa memiliki potensi unik yang dapat dikembangkan. Visi kami adalah menciptakan ekosistem di mana masyarakat desa Mata Mamplam dapat tumbuh mandiri melalui pemanfaatan sumber daya lokal dan teknologi tepat guna.";
  if (!settingsMap.about_intro) settingsMap.about_intro = "KKM Mata Mamplam berkomitmen untuk memberdayakan masyarakat desa melalui inovasi, pendidikan, dan kolaborasi yang berkelanjutan.";
   if (!settingsMap.about_vision_title) settingsMap.about_vision_title = "Membangun Desa yang Mandiri dan Berkelanjutan";

  return settingsMap;
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

  revalidatePath("/dashboard/settings");
}

export async function getSocialMedias() {
  return prisma.socialMedia.findMany();
}

