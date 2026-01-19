
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { getServerAuthSession } from "@/server/auth/session";

const prisma = new PrismaClient();

const DEFAULT_ABOUT = {
  landingTitle: "Tentang Kami",
  landingContentHtml: "<p>KKM Mata Mamplam berkomitmen untuk memberdayakan masyarakat desa melalui inovasi, pendidikan, dan kolaborasi yang berkelanjutan.</p>",
  landingImageUrl: "",
  
  visionLabel: "VISI KAMI",
  visionTitle: "Membangun Desa yang Mandiri dan Berkelanjutan",
  visionDescription: "Kami percaya bahwa setiap desa memiliki potensi unik yang dapat dikembangkan.",
  visionImageUrl: "",

  missionLabel: "MISI KAMI",
  missionTitle: "Langkah Nyata Untuk Perubahan",
  missionSubtitle: "Strategi utama kami dalam mewujudkan visi menjadi aksi nyata.",

  programBadge: "PROGRAM UNGGULAN",
  programTitle: "Inisiatif Kunci Kami",
  programSubtitle: "Fokus utama kami dalam memberdayakan masyarakat.",
};

const DEFAULT_MISSION_ITEMS = [
  { title: "Pemberdayaan Masyarakat", description: "Meningkatkan kapasitas SDM.", icon: "Users", order: 0 },
  { title: "Pengembangan Ekonomi", description: "Mendorong pertumbuhan UMKM.", icon: "Target", order: 1 },
  { title: "Inovasi Digital", description: "Memperkenalkan teknologi digital.", icon: "Zap", order: 2 },
];

const DEFAULT_PROGRAM_ITEMS = [
  { title: "Literasi Digital", description: "Pelatihan penggunaan perangkat lunak.", order: 0 },
  { title: "Revitalisasi UMKM", description: "Pendampingan branding dan legalitas.", order: 1 },
  { title: "Desa Sehat", description: "Kampanye pola hidup bersih dan sehat.", order: 2 },
];

export async function GET() {
  try {
    let aboutPage = await prisma.aboutPage.findFirst({
      include: {
        missionItems: { orderBy: { order: "asc" } },
        programItems: { orderBy: { order: "asc" } },
      },
    });

    if (!aboutPage) {
      // Auto-create default
      aboutPage = await prisma.aboutPage.create({
        data: {
            ...DEFAULT_ABOUT,
            missionItems: {
                create: DEFAULT_MISSION_ITEMS
            },
            programItems: {
                create: DEFAULT_PROGRAM_ITEMS
            }
        },
        include: {
            missionItems: { orderBy: { order: "asc" } },
            programItems: { orderBy: { order: "asc" } },
        }
      });
    }

    return NextResponse.json(aboutPage);
  } catch (error) {
    console.error("[ABOUT_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerAuthSession();
    // Assuming you have a way to check for Admin role here, e.g.:
    // if (!session || session.user.role !== "SUPERADMIN") return new NextResponse("Unauthorized", { status: 401 });

    const body = await req.json();
    const { 
        missionItems = [], 
        programItems = [], 
        ...pageData 
    } = body;

    // We find the existing page or fallback to create logic (though usually GET is called first)
    let aboutPage = await prisma.aboutPage.findFirst();
    
    if (!aboutPage) {
        // Create new if somehow missing
        aboutPage = await prisma.aboutPage.create({
            data: { ...DEFAULT_ABOUT } // Minimal init, will update below
        })
    }
    
    // Transactional Update
    const updatedPage = await prisma.$transaction(async (tx) => {
        // 1. Update Page Fields
        const p = await tx.aboutPage.update({
            where: { id: aboutPage.id },
            data: {
                landingTitle: pageData.landingTitle,
                landingContentHtml: pageData.landingContentHtml,
                landingImageUrl: pageData.landingImageUrl,
                visionLabel: pageData.visionLabel,
                visionTitle: pageData.visionTitle,
                visionDescription: pageData.visionDescription,
                visionImageUrl: pageData.visionImageUrl,
                missionLabel: pageData.missionLabel,
                missionTitle: pageData.missionTitle,
                missionSubtitle: pageData.missionSubtitle,
                programBadge: pageData.programBadge,
                programTitle: pageData.programTitle,
                programSubtitle: pageData.programSubtitle,
            }
        });

        // 2. Refresh Mission Items
        // Delete all existing for this page to simplify sync
        await tx.aboutMissionItem.deleteMany({ where: { aboutPageId: p.id }});
        
        // Re-create
        if (missionItems.length > 0) {
            await tx.aboutMissionItem.createMany({
                data: missionItems.map((item: any, idx: number) => ({
                    aboutPageId: p.id,
                    title: item.title,
                    description: item.description,
                    icon: item.icon,
                    order: idx // use index as order
                }))
            });
        }

        // 3. Refresh Program Items
        await tx.aboutProgramItem.deleteMany({ where: { aboutPageId: p.id }});

        if (programItems.length > 0) {
             await tx.aboutProgramItem.createMany({
                data: programItems.map((item: any, idx: number) => ({
                    aboutPageId: p.id,
                    title: item.title,
                    description: item.description,
                    href: item.href,
                    numberLabel: String(idx + 1).padStart(2, '0'), // Auto label 01, 02
                    order: idx
                }))
            });
        }

        return p;
    });

    return NextResponse.json(updatedPage);

  } catch (error) {
    console.error("[ABOUT_PUT]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
