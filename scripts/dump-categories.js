const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const expCats = await prisma.expenseCategory.findMany();
  const rabCats = await prisma.rabCategory.findMany();

  const output = `
EXPENSE CATEGORIES:
${expCats.map(c => `- ${c.name} (${c.id})`).join('\n')}

RAB CATEGORIES:
${rabCats.map(c => `- ${c.name} (${c.id})`).join('\n')}
  `;
  
  fs.writeFileSync('categories_dump.txt', output);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
