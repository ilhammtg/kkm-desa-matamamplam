
import { prisma } from "../src/server/db/prisma";
import { formatCurrency } from "../src/lib/utils";

async function main() {
  const expenses = await prisma.expense.findMany({ 
      orderBy: { amount: 'desc' },
      take: 10,
      include: { category: true }
  });

  console.log("Top 10 Expenses:");
  expenses.forEach(e => {
      console.log(`- ${formatCurrency(e.amount)} | ${e.category.name} | ${e.description}`);
  });
}

main().finally(() => prisma.$disconnect());
