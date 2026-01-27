
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== RAB Date Diagnostics ===\n");
  
  const rabs = await prisma.rab.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { rabCategory: true }
  });

  console.log(`Found ${rabs.length} recent RABs.\n`);

  for (const rab of rabs) {
    const d = new Date(rab.date);
    console.log(`RAB: ${rab.rabCategory.name}`);
    console.log(`  ID          : ${rab.id}`);
    console.log(`  Created     : ${rab.createdAt.toISOString()}`);
    console.log(`  Date (ISO)  : ${rab.date.toISOString()}`);
    console.log(`  UTC Hour    : ${d.getUTCHours()}:${d.getUTCMinutes()}`);
    console.log(`  UTC Day     : ${d.getUTCDate()}`);
    console.log(`  Local String: ${d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`);
    
    // Highlight potential issues
    if (d.getUTCHours() === 17) {
      console.log(`  ⚠️  WARNING: Stored at 17:00 UTC (previous day, midnight WIB)`);
    } else if (d.getUTCHours() !== 0) {
      console.log(`  ⚠️  WARNING: Not at UTC midnight (hour: ${d.getUTCHours()})`);
    } else {
      console.log(`  ✅ Correct: UTC midnight`);
    }
    console.log("---");
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
