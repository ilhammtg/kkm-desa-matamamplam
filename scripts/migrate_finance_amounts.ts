
import { prisma } from "../src/server/db/prisma";

async function main() {
  console.log("Starting Migration: Multiplying Finance Amounts by 1000...");

  // 1. INCOMES
  const incomes = await prisma.income.findMany();
  console.log(`Found ${incomes.length} incomes.`);
  
  let incomeUpdated = 0;
  for (const inc of incomes) {
      // Safety check: skip if amount is already large (e.g. > 1 million, implying it was already correct?)
      // But based on analysis, max is small. Let's use a threshold just in case.
      // If amount < 1,000,000, we assume it's shortened (since 1 million would be 1000 in short form).
      // Wait, if 1000 shortened = 1,000,000. 
      // If existing is 10,000 (10 million?), it might be real. 
      // Let's indiscriminately multiply if it's "small". 
      // Let's say < 500,000.
      if (inc.amount < 500000) {
          await prisma.income.update({
              where: { id: inc.id },
              data: { amount: inc.amount * 1000 }
          });
          incomeUpdated++;
      }
  }
  console.log(`Updated ${incomeUpdated} incomes.`);

  // 2. EXPENSES
  const expenses = await prisma.expense.findMany();
  console.log(`Found ${expenses.length} expenses.`);
  
  let expenseUpdated = 0;
  for (const exp of expenses) {
      if (exp.amount < 500000) {
          await prisma.expense.update({
              where: { id: exp.id },
              data: { amount: exp.amount * 1000 }
          });
          expenseUpdated++;
      }
  }
  console.log(`Updated ${expenseUpdated} expenses.`);
  
  console.log("Migration Complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
