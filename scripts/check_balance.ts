
import { prisma } from "../src/server/db/prisma";

async function main() {
  const incomeAgg = await prisma.income.aggregate({ _sum: { amount: true } });
  const expenseAgg = await prisma.expense.aggregate({ _sum: { amount: true } });
  
  const totalIncome = incomeAgg._sum.amount || 0;
  const totalExpense = expenseAgg._sum.amount || 0;
  const balance = totalIncome - totalExpense;

  console.log(JSON.stringify({
      totalIncome,
      totalExpense,
      balance
  }, null, 2));
}

main().finally(() => prisma.$disconnect());
