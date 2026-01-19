
import { PrismaClient } from "@prisma/client";

export async function seedAbout(prisma: PrismaClient) {
  console.log("Starting About Us seed...");

  // 1. Clear existing About Page data to avoid duplicates/conflicts
  await prisma.aboutProgramItem.deleteMany();
  await prisma.aboutMissionItem.deleteMany();
  await prisma.aboutPage.deleteMany();

  // 2. Create About Page
  const aboutPage = await prisma.aboutPage.create({
    data: {
      landingTitle: "Mengabdi untuk Negeri, Membangun Desa Mandiri",
      landingContentHtml: "<p>Kelompok Kuliah Kerja Mahasiswa (KKM) Mata Mamplam berkomitmen untuk menjadi jembatan antara dunia akademis dan realitas sosial masyarakat. Kami percaya bahwa perubahan besar dimulai dari langkah kecil di desa.</p>",
      landingImageUrl: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200&auto=format&fit=crop&q=80",
      
      visionLabel: "Visi Kami",
      visionTitle: "Desa Mata Mamplam: Sentra Ekonomi Digital & Ekowisata Berkelanjutan",
      visionDescription: "Mewujudkan masyarakat Desa Mata Mamplam yang berdaya saing global melalui optimalisasi potensi lokal, teknologi digital, dan pelestarian lingkungan yang berkelanjutan.",
      visionImageUrl: "https://images.unsplash.com/photo-1518544806308-5960413009d5?w=800&auto=format&fit=crop&q=80",

      missionLabel: "Misi Kami",
      missionTitle: "Langkah Nyata untuk Perubahan",
      missionSubtitle: "Kami bergerak melalui program-program strategis yang menyentuh langsung aspek vital kehidupan masyarakat.",

      programBadge: "Program Unggulan",
      programTitle: "Inisiatif Kerja KKM",
      programSubtitle: "Fokus utama kami dalam memberdayakan masyarakat desa selama periode pengabdian.",
    }
  });

  // 3. Create Mission Items
  const missions = [
    {
      title: "Pemberdayaan Ekonomi Digital",
      description: "Meningkatkan kapasitas UMKM lokal melalui pelatihan pemasaran digital, digital branding, dan onboarding ke marketplace nasional untuk memperluas jangkauan pasar produk desa.",
      icon: "TrendingUp",
      order: 1
    },
    {
      title: "Peningkatan Kualitas Hidup",
      description: "Fokus pada sektor kesehatan (Stunting & Posyandu) dan pendidikan non-formal (Rumah Baca & Bimbingan Belajar) untuk mencetak generasi penerus desa yang sehat dan cerdas.",
      icon: "Heart",
      order: 2
    },
    {
      title: "Konservasi & Ekowisata",
      description: "Memetakan dan mengembangkan potensi wisata alam desa serta mengedukasi masyarakat tentang pengelolaan lingkungan yang berkelanjutan dan bebas sampah.",
      icon: "Leaf",
      order: 3
    }
  ];

  for (const m of missions) {
    await prisma.aboutMissionItem.create({
      data: {
        aboutPageId: aboutPage.id,
        ...m
      }
    });
  }

  // 4. Create Program Items
  const programs = [
    {
      title: "Desa Digital Indonesia",
      description: "Instalasi hotspot WiFi di titik strategis desa dan pelatihan literasi digital dasar bagi perangkat desa untuk pelayanan publik yang lebih efisien.",
      numberLabel: "01",
      order: 1
    },
    {
      title: "Sehat Bersama Mamplam",
      description: "Program revitalisasi Posyandu dengan pengadaan alat ukur digital dan kampanye \"Isi Piringku\" untuk pencegahan stunting sejak dini.",
      numberLabel: "02",
      order: 2
    },
    {
      title: "Mamplam Creative Hub",
      description: "Pusat pelatihan kerajinan tangan dan pengolahan pangan lokal (seperti emping melinjo dan keripik) dengan kemasan modern standar ekspor.",
      numberLabel: "03",
      order: 3
    },
    {
      title: "Green Village Movement",
      description: "Gerakan penanaman 1000 pohon produktif dan pembuatan bank sampah desa untuk mengubah limbah rumah tangga menjadi bernilai ekonomis.",
      numberLabel: "04",
      order: 4
    }
  ];

  for (const p of programs) {
    await prisma.aboutProgramItem.create({
      data: {
        aboutPageId: aboutPage.id,
        ...p
      }
    });
  }

  console.log("About Us seeded successfully.");
}
