
import { prisma } from "../src/server/db/prisma";

async function main() {
  const incomes = await prisma.income.findMany({ include: { category: true } });
  const grouped: Record<string, number> = {};
  incomes.forEach(i => {
      const cat = i.category.name;
      grouped[cat] = (grouped[cat] || 0) + i.amount;
  });
  console.log(JSON.stringify(grouped, null, 2));
}

main().finally(() => prisma.$disconnect());
