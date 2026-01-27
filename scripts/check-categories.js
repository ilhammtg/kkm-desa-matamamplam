const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking Categories...");

  const expCats = await prisma.expenseCategory.findMany();
  const rabCats = await prisma.rabCategory.findMany();

  console.log("\nEXPENSE CATEGORIES:", expCats.map(c => c.name));
  console.log("RAB CATEGORIES:", rabCats.map(c => c.name));

  const expenses = await prisma.expense.findMany({ include: { category: true } });
  console.log(`\nFound ${expenses.length} expenses.`);
  
  // Sample a few expenses
  if (expenses.length > 0) {
    console.log("Sample Expense:", JSON.stringify(expenses[0], null, 2));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
