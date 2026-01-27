
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== RAB Date Fixer ===");
  
  // Find all RABs
  const rabs = await prisma.rab.findMany({
    include: { rabCategory: true }
  });

  console.log(`Checking ${rabs.length} RABs for timezone misalignment...`);
  
  let fixedCount = 0;

  for (const rab of rabs) {
    const d = new Date(rab.date);
    const hour = d.getUTCHours();
    
    // Logic: 
    // If hour is 17 (which is 00:00 GMT+7), it means it was saved with 'setHours(0)' in local time.
    // We want it to be 00:00 UTC.
    // So we need to add 7 hours? No, 17:00 PREVIOUS DAY -> 00:00 NEXT DAY is +7 hours.
    
    if (hour === 17) {
      console.log(`[FIXING] RAB ${rab.rabCategory.name} (${rab.date.toISOString()}) -> Hour is 17 UTC`);
      
      const newDate = new Date(d);
      newDate.setUTCHours(0, 0, 0, 0);
      newDate.setUTCDate(newDate.getUTCDate() + 1); // Shift to next day 00:00 UTC
      
      console.log(`         New Date: ${newDate.toISOString()}`);
      
      await prisma.rab.update({
        where: { id: rab.id },
        data: { date: newDate }
      });
      fixedCount++;
    } else if (hour !== 0) {
        // Just in case it's some other weird time, force to midnight UTC of that same day?
        // Let's be safe and only touch the 17:00 ones which clearly indicate the GMT+7 shift.
        console.log(`[SKIP] RAB ${rab.rabCategory.name} (${rab.date.toISOString()}) -> Hour is ${hour}, not 17.`);
    }
  }

  console.log(`\nFixed ${fixedCount} RABs.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
