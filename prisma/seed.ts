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

  // 4. Posts
  const posts = [
    {
      title: "Gotong Royong Bersih Desa",
      slug: "gotong-royong-bersih-desa",
      type: PostType.ACTIVITY,
      excerpt: "Kegiatan bersih-bersih desa bersama warga setempat untuk menciptakan lingkungan yang asri.",
      content: "<p>Kami bersama warga melakukan kegiatan gotong royong membersihkan selokan, memotong rumput liar, dan memperbaiki fasilitas umum. Antusiasme warga sangat tinggi dan kegiatan berjalan lancar.</p>",
      status: PostStatus.PUBLISHED,
      authorId: user.id,
      coverImageUrl: "https://images.unsplash.com/photo-1558008258-3256797b43f3?w=800&auto=format&fit=crop&q=60"
    },
    {
      title: "Sosialisasi Pentingnya Pendidikan",
      slug: "sosialisasi-pendidikan",
      type: PostType.ACTIVITY,
      excerpt: "Mengajar anak-anak desa membaca dan menulis dengan metode yang menyenangkan.",
      content: "<p>Pendidikan adalah kunci masa depan. Kami mengadakan kelas tambahan sore hari untuk membantu adik-adik belajar membaca dan berhitung dengan metode bermain sambil belajar.</p>",
      status: PostStatus.PUBLISHED,
      authorId: user.id,
      coverImageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=60"
    },
    {
      title: "Workshop Pertanian Modern",
      slug: "workshop-pertanian-modern",
      type: PostType.ACTIVITY,
      excerpt: "Mengenalkan teknologi hidroponik kepada petani lokal untuk efisiensi lahan.",
      content: "<p>Workshop ini bertujuan mengenalkan metode hidroponik yang hemat air dan lahan, cocok untuk diterapkan di pekarangan rumah tangga sebagai sumber pangan tambahan.</p>",
      status: PostStatus.PUBLISHED,
      authorId: user.id,
      coverImageUrl: "https://images.unsplash.com/photo-1625246333195-5519a4950a9a?w=800&auto=format&fit=crop&q=60"
    },
    {
      title: "Posyandu Balita dan Lansia",
      slug: "posyandu-balita-lansia",
      type: PostType.ACTIVITY,
      excerpt: "Pemeriksaan kesehatan gratis untuk balita dan lansia di balai desa.",
      content: "<p>Bekerja sama dengan puskesmas setempat, kami mengadakan pemeriksaan kesehatan rutin meliputi penimbangan berat badan, imunisasi, dan cek tensi.</p>",
      status: PostStatus.PUBLISHED,
      authorId: user.id,
      coverImageUrl: "https://images.unsplash.com/photo-1576091160550-217358c7db81?w=800&auto=format&fit=crop&q=60"
    },
    {
      title: "Potensi Wisata Alam Mata Mamplam",
      slug: "potensi-wisata-alam",
      type: PostType.ARTICLE,
      excerpt: "Menjelajahi keindahan alam tersembunyi yang dimiliki oleh desa Mata Mamplam.",
      content: "<p>Desa ini menyimpan sejuta pesona, mulai dari hamparan sawah hijau hingga sungai jernih yang belum banyak terjamah. Potensi ekowisata sangat besar jika dikelola dengan bijak.</p>",
      status: PostStatus.PUBLISHED,
      authorId: user.id,
      coverImageUrl: "https://images.unsplash.com/photo-1469474932316-d6df02312320?w=800&auto=format&fit=crop&q=60"
    },
    {
      title: "Pelatihan UMKM Digital",
      slug: "pelatihan-umkm-digital",
      type: PostType.ACTIVITY, 
      excerpt: "Membantu ibu-ibu PKK memasarkan produk lokal ke pasar digital.",
      content: "<p>Digitalisasi ekonomi desa menjadi fokus utama. Melalui pelatihan ini, produk keripik singkong khas desa kini bisa dibeli melalui marketplace.</p>",
      status: PostStatus.PUBLISHED,
      authorId: user.id,
      coverImageUrl: "https://images.unsplash.com/photo-1664575602554-208c7a229a14?w=800&auto=format&fit=crop&q=60"
    },
    {
      title: "Sejarah Desa Mata Mamplam",
      slug: "sejarah-desa",
      type: PostType.ARTICLE,
      excerpt: "Menguak asal usul nama dan sejarah berdirinya desa Mata Mamplam.",
      content: "<p>Menurut sesepuh desa, nama Mata Mamplam diambil dari pohon mangga besar yang dulu menjadi penanda mata air utama di wilayah ini.</p>",
      status: PostStatus.PUBLISHED,
      authorId: user.id,
      coverImageUrl: "https://images.unsplash.com/photo-1599940824399-b87987ced72a?w=800&auto=format&fit=crop&q=60"
    },
    {
      title: "Resep Kuliner Khas: Kuah Beulangong",
      slug: "resep-kuah-beulangong",
      type: PostType.ARTICLE,
      excerpt: "Rahasia kelezatan masakan tradisional yang selalu ada di setiap kenduri.",
      content: "<p>Kuah Beulangong adalah masakan kari daging kambing atau sapi dengan nangka muda yang dimasak dalam kuali besar. Berikut resep rahasianya...</p>",
      status: PostStatus.PUBLISHED,
      authorId: user.id,
      coverImageUrl: "https://images.unsplash.com/photo-1547496502-ffa22d388915?w=800&auto=format&fit=crop&q=60"
    }
  ];

  for (const post of posts) {
    const existing = await prisma.post.findUnique({ where: { slug: post.slug } });
    if (!existing) {
      await prisma.post.create({ data: post });
    }
  }
  console.log("Posts ensured.");

  // 5. Social Media
  const socials = [
    { platform: "Instagram", url: "https://instagram.com/kkm.matamamplam", icon: "Instagram" },
    { platform: "TikTok", url: "https://tiktok.com/@kkm.matamamplam", icon: "MessageSquare" },
    { platform: "YouTube", url: "https://youtube.com/@kkm.matamamplam", icon: "Youtube" },
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
