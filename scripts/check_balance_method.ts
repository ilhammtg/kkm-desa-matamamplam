
import { prisma } from "../src/server/db/prisma";

async function main() {
  const incomes = await prisma.income.findMany({ include: { paymentMethod: true } });
  const expenses = await prisma.expense.findMany({ include: { paymentMethod: true } });

  const balanceByMethod: Record<string, number> = {};

  incomes.forEach(i => {
      const pm = i.paymentMethod?.name || "Unknown";
      balanceByMethod[pm] = (balanceByMethod[pm] || 0) + i.amount;
  });

  expenses.forEach(e => {
      const pm = e.paymentMethod?.name || "Unknown";
      balanceByMethod[pm] = (balanceByMethod[pm] || 0) - e.amount;
  });

  console.log(JSON.stringify(balanceByMethod, null, 2));
}

main().finally(() => prisma.$disconnect());
