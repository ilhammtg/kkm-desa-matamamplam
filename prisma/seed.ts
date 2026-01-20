import { PrismaClient, Role, PostType, PostStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "ilhammtg2020@gmail.com";
  // NOTE: In production, password should be env var. For this specific request, it's hardcoded.
  // "09@CiHam2024"
  const adminPasswordHash = await bcrypt.hash("09@CiHam2024", 10);

  // 1. Create Super Admin
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Ilham Superadmin",
      passwordHash: adminPasswordHash,
      role: Role.SUPERADMIN,
      isActive: true,
    },
    create: {
      name: "Ilham Superadmin",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.SUPERADMIN,
      isActive: true,
    },
  });

  console.log("User/Admin ensured:", user.email);

  // 2. Site Settings
  const settings = [
    { key: "site_name", value: "KKM Mata Mamplam" },
    { key: "hero_title", value: "Mengabdi untuk Masyarakat, Membangun Desa" },
    { key: "hero_subtitle", value: "Selamat datang di portal resmi Kelompok Kuliah Kerja Mahasiswa (KKM) Mata Mamplam. Kami berdedikasi untuk memberikan dampak positif melalui berbagai program kerja dan kegiatan sosial." },
    { key: "footer_text", value: "© 2026 KKM Mata Mamplam. Dibuat dengan cinta untuk Bangsa." },
    { key: "about_content", value: "<p>Kelompok KKM kami terdiri dari mahasiswa berbagai jurusan yang bersatu untuk membangun desa Mata Mamplam menjadi lebih baik.</p>" },
    { key: "logo_url", value: "" },
    { key: "favicon_url", value: "" },
    { key: "instagram_url", value: "" },
    { key: "tiktok_url", value: "" },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }
  console.log("Settings ensured.");

  // 3. FAQs 
  const countFAQs = await prisma.faq.count();
  if (countFAQs === 0) {
    await prisma.faq.createMany({
      data: [
        { question: "Apa itu KKM Mata Mamplam?", answer: "KKM Mata Mamplam adalah kelompok mahasiswa yang melakukan pengabdian masyarakat di desa Mata Mamplam." },
        { question: "Bagaimana cara berpartisipasi?", answer: "Anda bisa menghubungi kami melalui media sosial atau datang langsung ke posko kami." },
        { question: "Apa saja program kerjanya?", answer: "Kami memiliki program pendidikan, kesehatan, lingkungan, dan teknologi tepat guna." },
      ],
    });
    console.log("FAQs seeded.");
  }

  // 5. Social Media
  const socials = [
    { platform: "Instagram", url: "https://instagram.com/kkm.matamamplam", icon: "Instagram" },
    { platform: "TikTok", url: "https://tiktok.com/@kkm.matamamplam", icon: "MessageSquare" },
  ];

  for (const s of socials) {
    const existing = await prisma.socialMedia.findFirst({ where: { platform: s.platform } });
    if (!existing) {
      await prisma.socialMedia.create({ data: s });
    }
  }
  console.log("Social Media ensured.");

  // 6. Org Structure & Members (Real Data)
  const { seedRealMembers } = await import("./seed_members_csv");
  await seedRealMembers(prisma);
  console.log("Org Structure & Members ensured.");

  // 7. Finance Seed
  const { seedFinance } = await import("./seed_finance");
  await seedFinance(prisma);
  // (seedFinance function inside has its own logging)
  
  // 8. About Us Seed (NEW)
  const { seedAbout } = await import("./seed_about");
  await seedAbout(prisma);

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
