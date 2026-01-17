import { PrismaClient, Role, PostType, PostStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminName = "Super Admin";
  const adminEmail = "admin@kkm.local";
  const adminPassword = "Admin@12345";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  // 1. Create Super Admin
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      passwordHash,
      role: Role.SUPERADMIN,
      isActive: true,
    },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
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
    { key: "footer_text", value: "© 2024 KKM Mata Mamplam. Dibuat dengan cinta untuk Bangsa." },
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

  // 3. FAQs using upsert or deleteMany+create (simple upsert loop here for safety)
  // Since FAQ has no unique key other than ID, we'll just check if any exist, if not create them.
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

  // 4. Posts
  const posts = [
    {
      title: "Gotong Royong Bersih Desa",
      slug: "gotong-royong-bersih-desa",
      type: PostType.ACTIVITY,
      excerpt: "Kegiatan bersih-bersih desa bersama warga setempat untuk menciptakan lingkungan yang asri.",
      content: "<p>Kami bersama warga melakukan kegiatan gotong royong...</p>",
      status: PostStatus.PUBLISHED,
      authorId: user.id,
      coverImageUrl: "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=800&auto=format&fit=crop&q=60"
    },
    {
      title: "Sosialisasi Pentingnya Pendidikan",
      slug: "sosialisasi-pendidikan",
      type: PostType.ACTIVITY,
      excerpt: "Mengajar anak-anak desa membaca dan menulis dengan metode yang menyenangkan.",
      content: "<p>Pendidikan adalah kunci masa depan...</p>",
      status: PostStatus.PUBLISHED,
      authorId: user.id,
      coverImageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60"
    },
    {
      title: "Potensi Wisata Alam Mata Mamplam",
      slug: "potensi-wisata-alam",
      type: PostType.ARTICLE,
      excerpt: "Menjelajahi keindahan alam tersembunyi yang dimiliki oleh desa Mata Mamplam.",
      content: "<p>Desa ini menyimpan sejuta pesona...</p>",
      status: PostStatus.PUBLISHED,
      authorId: user.id,
      coverImageUrl: "https://images.unsplash.com/photo-1469474932316-d6df02312320?w=800&auto=format&fit=crop&q=60"
    },
    {
      title: "Pelatihan UMKM Digital",
      slug: "pelatihan-umkm-digital",
      type: PostType.ACTIVITY,
      excerpt: "Membantu ibu-ibu PKK memasarkan produk lokal ke pasar digital.",
      content: "<p>Digitalisasi ekonomi desa...</p>",
      status: PostStatus.PUBLISHED,
      authorId: user.id,
      coverImageUrl: "https://images.unsplash.com/photo-1664575602554-208c7a229a14?w=800&auto=format&fit=crop&q=60"
    }
  ];

  for (const post of posts) {
    const existing = await prisma.post.findUnique({ where: { slug: post.slug } });
    if (!existing) {
      await prisma.post.create({ data: post });
    }
  }
  console.log("Posts ensured.");

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
