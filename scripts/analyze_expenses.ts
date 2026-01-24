
import { prisma } from "../src/server/db/prisma";

async function main() {
  const expenses = await prisma.expense.findMany({ include: { category: true } });
  const grouped: Record<string, number> = {};
  expenses.forEach(e => {
      const cat = e.category.name;
      grouped[cat] = (grouped[cat] || 0) + e.amount;
  });
  console.log(JSON.stringify(grouped, null, 2));
}

main().finally(() => prisma.$disconnect());
