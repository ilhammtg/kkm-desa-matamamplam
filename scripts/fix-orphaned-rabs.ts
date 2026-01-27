
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Checking for orphaned REALIZED RABs...");

  // Find RABs that are REALIZED but have no linked Expense
  // Since Expense holds the FK (rabId), we check where 'expense' relation is null
  const orphanedRabs = await prisma.rab.findMany({
    where: {
      status: "REALIZED",
      expense: null
    },
    include: {
      rabCategory: true
    }
  });

  console.log(`Found ${orphanedRabs.length} orphaned RAB(s).`);

  for (const rab of orphanedRabs) {
    console.log(`- Fixing RAB: ${rab.rabCategory.name} (${rab.date.toISOString().split('T')[0]})`);
    
    await prisma.rab.update({
      where: { id: rab.id },
      data: { status: "DRAFT" }
    });
  }

  console.log("Done. All orphaned RABs reset to DRAFT.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
