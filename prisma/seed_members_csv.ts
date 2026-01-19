
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const csvData = [
  { no: 1, npm: "235520110047", name: "Indah Maulidia", jabatan: "Ketua Div. Acara", prodi: "S1 Informatika" },
  { no: 2, npm: "235520110168", name: "Syifa Safira", jabatan: "Sekretaris 1", prodi: "S1 Informatika" },
  { no: 3, npm: "232220110049", name: "Khairul Ahaddian", jabatan: "Ketua Div. Perlengkapan", prodi: "S1 Teknik Sipil" },
  { no: 4, npm: "238620610213", name: "Milu Muspika Andini", jabatan: "Ketua Div. Humas", prodi: "S1 PGSD" },
  { no: 5, npm: "232220110069", name: "Syahri Ramadan", jabatan: "Wakil Ketua", prodi: "S1 Teknik Sipil" },
  { no: 6, npm: "238620610206", name: "Iin Sawitri", jabatan: "Anggota Div. Humas", prodi: "S1 PGSD" },
  { no: 7, npm: "238620610220", name: "Ninis Arlianti", jabatan: "Anggota Div. Humas", prodi: "S1 PGSD" },
  { no: 8, npm: "238620610204", name: "Fisma Wani", jabatan: "Ketua Div. PDD", prodi: "S1 PGSD" },
  { no: 9, npm: "238620610238", name: "Yumi Sari", jabatan: "Anggota Div. PDD", prodi: "S1 PGSD" },
  { no: 10, npm: "238620610061", name: "Hafiza", jabatan: "Ketua Div. Kesehatan", prodi: "S1 PGSD" },
  { no: 11, npm: "238620610060", name: "Fikri Ulfa", jabatan: "Anggota Div. PDD", prodi: "S1 PGSD" },
  { no: 12, npm: "238620610033", name: "Cicia Intan", jabatan: "Anggota Div. Perlengkapan", prodi: "S1 PGSD" },
  { no: 13, npm: "236321110067", name: "Mani Sartika", jabatan: "Anggota Div. Acara", prodi: "S1 Adm. Bisnis" },
  { no: 14, npm: "235520110217", name: "Ilham", jabatan: "Ketua Kelompok", prodi: "S1 Informatika" },
  { no: 15, npm: "236321110071", name: "Putri Aliffa", jabatan: "Bendahara", prodi: "S1 Adm. Bisnis" },
  { no: 16, npm: "236321110045", name: "Suci Rahmadhani", jabatan: "Anggota Div. PDD", prodi: "S1 Adm. Bisnis" },
  { no: 17, npm: "238420210002", name: "Fazilla Tasya", jabatan: "Anggota Div. Humas", prodi: "S1 Pend. Matematika" },
  { no: 18, npm: "238420210008", name: "Nurul Ana", jabatan: "Anggota Div. Acara", prodi: "S1 Pend. Matematika" },
  { no: 19, npm: "235520110015", name: "Aulia Maisarah", jabatan: "Anggota Div. Konsumsi", prodi: "S1 Informatika" },
  { no: 20, npm: "238420210011", name: "Cut Noris Arizka", jabatan: "Anggota Div. Acara", prodi: "S1 Pend. Matematika" },
  { no: 21, npm: "238620610036", name: "Cut Fatin Noer", jabatan: "Anggota Div. Kesehatan", prodi: "S1 PGSD" },
  { no: 22, npm: "235520110124", name: "Nurul Hasinah", jabatan: "Ketua Div. Konsumsi", prodi: "S1 Informatika" },
  { no: 23, npm: "235520110123", name: "Nurul Fadhila", jabatan: "Sekretaris 2", prodi: "S1 Informatika" },
  { no: 24, npm: "235520110129", name: "Rahimi", jabatan: "Anggota Div. PDD", prodi: "S1 Informatika" },
  { no: 25, npm: "235520110132", name: "Rahmatul Ulya", jabatan: "Anggota Div. Konsumsi", prodi: "S1 Informatika" },
  { no: 26, npm: "235520110262", name: "Muhammad", jabatan: "Anggota Div. Perlengkapan", prodi: "S1 Informatika" },
  { no: 27, npm: "238820310031", name: "Riska Rama Dani", jabatan: "Anggota Div. Perlengkapan", prodi: "S1 Pend. B. Inggris" },
  { no: 28, npm: "238620610050", name: "Diya Salsabila", jabatan: "Anggota Div. Konsumsi", prodi: "S1 PGSD" },
  { no: 29, npm: "238620610211", name: "Liza Fadhila", jabatan: "Anggota Div. Humas", prodi: "S1 PGSD" },
  { no: 30, npm: "238620610205", name: "Hasnawati", jabatan: "Anggota Div. Acara", prodi: "S1 PGSD" }
];

export async function seedRealMembers(prisma: PrismaClient) {
  console.log("Starting member update...");

  // 1. Ensure all Divisions exist
  const divisions = [
    "Inti", "Acara", "Perlengkapan", "Humas", "PDD", "Kesehatan", "Konsumsi"
  ];

  const divMap: Record<string, string> = {};

  for (const divName of divisions) {
    const d = await prisma.division.upsert({
      where: { name: divName },
      update: {},
      create: { name: divName },
    });
    divMap[divName] = d.id;
    console.log(`Division ensure: ${divName}`);
  }

  // 2. Process each student
  for (const student of csvData) {
    let divisionName = "Inti";
    let title = student.jabatan;
    let level = 5; // Default member level

    // Determine Division and Level
    const lowerJabatan = student.jabatan.toLowerCase();

    if (lowerJabatan.includes("ketua kelompok") || lowerJabatan.includes("wakil ketua") || lowerJabatan.includes("sekretaris") || lowerJabatan.includes("bendahara")) {
      divisionName = "Inti";
      if (lowerJabatan.includes("ketua kelompok")) level = 1;
      else if (lowerJabatan.includes("wakil ketua")) level = 2;
      else level = 3;
    } else if (lowerJabatan.includes("acara")) {
      divisionName = "Acara";
      level = lowerJabatan.includes("ketua") ? 4 : 5;
    } else if (lowerJabatan.includes("perlengkapan")) {
      divisionName = "Perlengkapan";
      level = lowerJabatan.includes("ketua") ? 4 : 5;
    } else if (lowerJabatan.includes("humas")) {
      divisionName = "Humas";
      level = lowerJabatan.includes("ketua") ? 4 : 5;
    } else if (lowerJabatan.includes("pdd")) {
      divisionName = "PDD";
      level = lowerJabatan.includes("ketua") ? 4 : 5;
    } else if (lowerJabatan.includes("kesehatan")) {
      divisionName = "Kesehatan";
      level = lowerJabatan.includes("ketua") ? 4 : 5;
    } else if (lowerJabatan.includes("konsumsi")) {
      divisionName = "Konsumsi";
      level = lowerJabatan.includes("ketua") ? 4 : 5;
    }

    // Find or create Position
    const position = await prisma.position.upsert({
        where: {          
            id: "placeholder" // hack to skip upsert constraint check if we use findFirst logic below
        },
        update: {}, 
        create: {
            title: title,
            level: level,
            divisionId: divMap[divisionName]
        }
    }).catch(async () => {
        const existingPos = await prisma.position.findFirst({
            where: {
                title: title,
                divisionId: divMap[divisionName]
            }
        });

        if (existingPos) return existingPos;

        return await prisma.position.create({
            data: {
                title: title,
                level: level,
                divisionId: divMap[divisionName]
            }
        });
    });

    // Update or Create Member
    const existingMember = await prisma.member.findFirst({ where: { npm: student.npm } });

    if (existingMember) {
        await prisma.member.update({
            where: { id: existingMember.id },
            data: {
                name: student.name,
                major: student.prodi,
                positionId: position.id, 
            }
        });
    } else {
        await prisma.member.create({
            data: {
                name: student.name,
                npm: student.npm,
                major: student.prodi,
                positionId: position.id,
                photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`
            }
        });
    }
  }

  // 3. Cleanup Members not in CSV
  const csvNpmList = csvData.map(s => s.npm);
  const deleted = await prisma.member.deleteMany({
    where: {
        npm: {
            notIn: csvNpmList
        }
    }
  });
  console.log(`Deleted ${deleted.count} legacy/test members.`);
  console.log("Member update finished.");
}
