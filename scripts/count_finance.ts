
import { prisma } from "../src/server/db/prisma";

async function main() {
  const incomeCount = await prisma.income.count();
  const expenseCount = await prisma.expense.count();
  
  console.log(`Income Count: ${incomeCount}`);
  console.log(`Expense Count: ${expenseCount}`);
}

main().finally(() => prisma.$disconnect());
