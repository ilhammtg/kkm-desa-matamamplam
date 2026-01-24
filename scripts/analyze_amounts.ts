
import { prisma } from "../src/server/db/prisma";

async function main() {
  const incomes = await prisma.income.findMany();
  let incomeLow = 0;
  let incomeMax = 0;

  incomes.forEach(i => {
      if (i.amount > incomeMax) incomeMax = i.amount;
      if (i.amount < 10000) incomeLow++;
  });

  const expenses = await prisma.expense.findMany();
  let expenseLow = 0;
  let expenseMax = 0;

  expenses.forEach(e => {
      if (e.amount > expenseMax) expenseMax = e.amount;
      if (e.amount < 10000) expenseLow++;
  });

  console.log(JSON.stringify({
      totalIncomes: incomes.length,
      incomeLow,
      incomeMax,
      totalExpenses: expenses.length,
      expenseLow,
      expenseMax
  }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
